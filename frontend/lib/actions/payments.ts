"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";
import {
  initializeChapaTransaction,
  verifyChapaTransaction,
  splitName,
  normalizeEthiopianPhone,
} from "@/lib/chapa";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Starts (or restarts) a Chapa payment for an existing `pending` order and
 * redirects the browser to Chapa's hosted checkout.
 *
 * Used both right after checkout creates the order, and from the "Pay now"
 * retry button on the order detail page if a previous attempt was
 * abandoned or failed — a fresh `tx_ref` is generated every time, since
 * Chapa tx_refs can't be reused.
 */
export async function initiateChapaPaymentForOrder(orderId: string): Promise<never> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, status, total, shipping_address")
    .eq("id", orderId)
    .single();
  assertNoDbError(error, "initiateChapaPaymentForOrder.lookup");
  if (!order || order.user_id !== user.id) throw new Error("Order not found.");
  if (order.status !== "pending") {
    throw new Error("This order has already been paid or is no longer payable.");
  }

  const address = (order.shipping_address ?? {}) as { full_name?: string; phone?: string };
  const { firstName, lastName } = splitName(address.full_name || user.email || "Customer");
  const phoneNumber = address.phone ? normalizeEthiopianPhone(address.phone) ?? undefined : undefined;

  // Every attempt gets its own unique tx_ref — timestamp suffix lets retries
  // for the same order coexist as distinct Chapa transactions. Chapa caps
  // tx_ref at 50 chars, so we use a short slice of the order id (same slice
  // used in the description below) rather than the full UUID — "order-"
  // (6) + 8 hex chars (8) + "-" (1) + a 13-digit ms timestamp (13) = 28
  // chars, comfortably under the limit.
  const shortOrderId = order.id.slice(0, 8);
  const txRef = `order-${shortOrderId}-${Date.now()}`;

  const checkoutUrl = await initializeChapaTransaction({
    amount: Number(order.total),
    email: user.email || "customer@example.com",
    firstName,
    lastName,
    phoneNumber,
    txRef,
    returnUrl: `${siteUrl()}/api/payments/chapa/callback?tx_ref=${encodeURIComponent(txRef)}`,
    callbackUrl: `${siteUrl()}/api/payments/chapa/callback?tx_ref=${encodeURIComponent(txRef)}`,
    title: "E-Shope",
    // Chapa only allows letters, numbers, hyphens, underscores, spaces and
    // dots in the description — no "#" or other punctuation.
    description: `Order ${shortOrderId.toUpperCase()}`,
  });

  // Recorded via the admin client — `payments` has no client-facing write
  // policy at all, by design (see docs/security.md).
  const admin = createAdminClient();
  const { error: insertError } = await admin.from("payments").insert({
    order_id: order.id,
    tx_ref: txRef,
    status: "pending",
    amount: order.total,
  });
  assertNoDbError(insertError, "initiateChapaPaymentForOrder.recordPayment");

  redirect(checkoutUrl);
}

export type ConfirmOutcome = "paid" | "already_paid" | "failed" | "pending" | "unknown";

/**
 * The single source of truth for "did this payment actually go through."
 * Called from the callback route, the optional webhook route, and the
 * return page's manual "check again" button — all three just report what
 * this function decides, rather than trusting Chapa's redirect/webhook
 * payload directly.
 */
export async function confirmChapaPayment(txRef: string): Promise<{
  outcome: ConfirmOutcome;
  orderId: string | null;
}> {
  if (!txRef) return { outcome: "unknown", orderId: null };

  const admin = createAdminClient();

  const { data: payment, error: lookupError } = await admin
    .from("payments")
    .select("order_id, amount, status")
    .eq("tx_ref", txRef)
    .maybeSingle();
  assertNoDbError(lookupError, "confirmChapaPayment.lookup");

  if (!payment) return { outcome: "unknown", orderId: null };
  if (payment.status === "success") {
    return { outcome: "already_paid", orderId: payment.order_id };
  }

  let verification;
  try {
    verification = await verifyChapaTransaction(txRef);
  } catch (err) {
    // A verify-call failure (network blip, Chapa hiccup) is NOT the same as
    // a failed payment — report "pending" so the UI invites the person to
    // check again rather than telling them the payment failed.
    console.error("[confirmChapaPayment] verify failed", err);
    return { outcome: "pending", orderId: payment.order_id };
  }

  if (verification.status !== "success") {
    await admin
      .from("payments")
      .update({ status: verification.status })
      .eq("tx_ref", txRef);
    return {
      outcome: verification.status === "pending" ? "pending" : "failed",
      orderId: payment.order_id,
    };
  }

  // Defense in depth: the amount Chapa confirms should match what we billed.
  // A mismatch here means something is wrong enough that we should NOT mark
  // the order paid, even though Chapa reported "success".
  if (Math.abs(verification.amount - Number(payment.amount)) > 0.5) {
    console.error("[confirmChapaPayment] amount mismatch", {
      expected: payment.amount,
      got: verification.amount,
      txRef,
    });
    return { outcome: "failed", orderId: payment.order_id };
  }

  const { data: justPaid, error: rpcError } = await admin.rpc("mark_order_paid", {
    p_order_id: payment.order_id,
    p_tx_ref: txRef,
    p_chapa_reference: verification.reference,
    p_amount: verification.amount,
  });
  assertNoDbError(rpcError, "confirmChapaPayment.markPaid");

  return { outcome: justPaid ? "paid" : "already_paid", orderId: payment.order_id };
}
