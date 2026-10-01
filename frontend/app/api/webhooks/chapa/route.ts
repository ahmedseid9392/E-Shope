import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { confirmChapaPayment } from "@/lib/actions/payments";

/**
 * Optional secondary confirmation path. The primary one is
 * /api/payments/chapa/callback (Chapa calls it automatically for every
 * transaction, no dashboard setup needed). This route only does anything
 * useful once a webhook URL + secret hash is configured in the Chapa
 * dashboard (Settings → Webhooks) — until then Chapa simply never calls it.
 *
 * Both paths funnel into the same confirmChapaPayment(), which is
 * idempotent, so having both active at once is safe.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signatureHeader =
      request.headers.get("x-chapa-signature") ?? request.headers.get("chapa-signature");

    if (!signatureHeader || !isValidSignature(rawBody, signatureHeader, webhookSecret)) {
      console.error("[api/webhooks/chapa] invalid or missing signature");
      // 401 so Chapa's retry logic doesn't keep hammering a request that
      // will never pass signature checks.
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    // No CHAPA_WEBHOOK_SECRET configured — accept the event unverified
    // rather than rejecting payments outright, since confirmChapaPayment
    // never trusts this payload anyway (it re-verifies with Chapa before
    // doing anything). Set CHAPA_WEBHOOK_SECRET once a dashboard webhook is
    // configured to turn signature checking on.
    console.warn("[api/webhooks/chapa] CHAPA_WEBHOOK_SECRET not set — skipping signature check");
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const txRef: string | undefined = payload?.tx_ref ?? payload?.data?.tx_ref;
  if (!txRef) {
    // Not a transaction event we care about (e.g. a payout webhook) — ack
    // it anyway so Chapa doesn't retry forever.
    return NextResponse.json({ ok: true });
  }

  try {
    await confirmChapaPayment(txRef);
  } catch (err) {
    console.error("[api/webhooks/chapa]", err);
    // 500 so Chapa retries — this was our failure, not a reason to drop the event.
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}
