import { NextRequest, NextResponse } from "next/server";
import { confirmChapaPayment } from "@/lib/actions/payments";

/**
 * Destination for BOTH Chapa's `return_url` (the customer's browser) and
 * `callback_url` (Chapa's own GET notification) — see lib/actions/payments.ts
 * for why one endpoint safely covers both interpretations of Chapa's docs.
 *
 * Either way, nothing here is trusted at face value: we re-verify the
 * transaction server-to-server (via confirmChapaPayment -> Chapa's
 * `transaction/verify`) before treating the payment as successful.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const txRef =
    url.searchParams.get("tx_ref") ??
    url.searchParams.get("trx_ref") ??
    "";

  let outcome: Awaited<ReturnType<typeof confirmChapaPayment>>["outcome"] = "unknown";
  let orderId: string | null = null;

  try {
    const result = await confirmChapaPayment(txRef);
    outcome = result.outcome;
    orderId = result.orderId;
  } catch (err) {
    console.error("[api/payments/chapa/callback]", err);
    outcome = "pending"; // let the return page's "check again" recover from a transient failure
  }

  const redirectUrl = new URL("/checkout/return", url.origin);
  redirectUrl.searchParams.set("status", outcome);
  redirectUrl.searchParams.set("tx_ref", txRef);
  if (orderId) redirectUrl.searchParams.set("order", orderId);

  // A 303 here is harmless even when the actual caller is Chapa's server
  // (not a browser) — the important work (confirmChapaPayment) already ran
  // above; the redirect only matters for the browser-return-url case.
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
