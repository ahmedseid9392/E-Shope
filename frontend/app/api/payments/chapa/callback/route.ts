
import { NextRequest, NextResponse } from "next/server";
import { confirmChapaPaymentCore } from "@/lib/payments/confirm-chapa-payment";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const txRef =
    url.searchParams.get("tx_ref") ??
    url.searchParams.get("trx_ref") ??
    "";

  let outcome:
    | "paid"
    | "already_paid"
    | "failed"
    | "pending"
    | "unknown" = "unknown";

  let orderId: string | null = null;

  try {
    const result = await confirmChapaPaymentCore(txRef);
    outcome = result.outcome;
    orderId = result.orderId;
  } catch (err) {
    console.error("[api/payments/chapa/callback]", err);
    outcome = "pending";
  }

  const redirectUrl = new URL("/checkout/return", url.origin);

  redirectUrl.searchParams.set("status", outcome);
  redirectUrl.searchParams.set("tx_ref", txRef);

  if (orderId) {
    redirectUrl.searchParams.set("order", orderId);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
