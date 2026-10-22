
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { confirmChapaPaymentCore } from "@/lib/payments/confirm-chapa-payment";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signatureHeader =
      request.headers.get("x-chapa-signature") ??
      request.headers.get("chapa-signature");

    if (
      !signatureHeader ||
      !isValidSignature(rawBody, signatureHeader, webhookSecret)
    ) {
      console.error("[api/webhooks/chapa] invalid or missing signature");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
  } else {
    console.warn(
      "[api/webhooks/chapa] CHAPA_WEBHOOK_SECRET not set — skipping signature check"
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept the transaction reference from either documented payload shape
  // currently handled by this project.
  const rawTxRef =
    typeof payload === "object" && payload !== null
      ? (
          payload as {
            tx_ref?: unknown;
            data?: { tx_ref?: unknown };
          }
        ).tx_ref ??
        (
          payload as {
            data?: { tx_ref?: unknown };
          }
        ).data?.tx_ref
      : undefined;

  if (typeof rawTxRef !== "string" || !rawTxRef.trim()) {
    // A non-transaction event is acknowledged without changing payment state.
    return NextResponse.json({ ok: true });
  }

  try {
    await confirmChapaPaymentCore(rawTxRef);
  } catch (err) {
    console.error("[api/webhooks/chapa]", err);

    // Ask the provider to retry if our server-side processing failed.
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

function isValidSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, signatureBuf);
}
