
"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";
import {
  initializeChapaTransaction,
  splitName,
  normalizeEthiopianPhone,
} from "@/lib/chapa";
import { confirmChapaPaymentCore } from "@/lib/payments/confirm-chapa-payment";

export type {
  ConfirmOutcome,
  ConfirmPaymentResult,
} from "@/lib/payments/confirm-chapa-payment";

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/**
 * Starts or restarts a Chapa payment for an existing pending order.
 */
export async function initiateChapaPaymentForOrder(
  orderId: string
): Promise<never> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, status, total, shipping_address")
    .eq("id", orderId)
    .single();

  assertNoDbError(error, "initiateChapaPaymentForOrder.lookup");

  if (!order || order.user_id !== user.id) {
    throw new Error("Order not found.");
  }

  if (order.status !== "pending") {
    throw new Error("This order has already been paid or is no longer payable.");
  }

  const address = (order.shipping_address ?? {}) as {
    full_name?: string;
    phone?: string;
  };

  const { firstName, lastName } = splitName(
    address.full_name || user.email || "Customer"
  );

  const phoneNumber = address.phone
    ? normalizeEthiopianPhone(address.phone) ?? undefined
    : undefined;

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
    description: `Order ${shortOrderId.toUpperCase()}`,
  });

  // The payments table has no client-facing write policy.
  const admin = createAdminClient();

  const { error: insertError } = await admin.from("payments").insert({
    order_id: order.id,
    tx_ref: txRef,
    status: "pending",
    amount: order.total,
  });

  assertNoDbError(
    insertError,
    "initiateChapaPaymentForOrder.recordPayment"
  );

  redirect(checkoutUrl);
}

/**
 * Authenticated client-facing action for the "Check payment status" button.
 *
 * A transaction reference is not authorization. Confirm that the payment
 * belongs to an order owned by the current user before invoking the
 * privileged server-side confirmation core.
 */
export async function confirmChapaPayment(txRef: string) {
  if (typeof txRef !== "string" || !txRef.trim()) {
    return { outcome: "unknown" as const, orderId: null };
  }

  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated.");
  }

  const admin = createAdminClient();

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("order_id")
    .eq("tx_ref", txRef)
    .maybeSingle();

  assertNoDbError(paymentError, "confirmChapaPayment.lookup");

  if (!payment) {
    return { outcome: "unknown" as const, orderId: null };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, user_id")
    .eq("id", payment.order_id)
    .maybeSingle();

  assertNoDbError(orderError, "confirmChapaPayment.orderOwnership");

  // Do not reveal another customer's order ID or payment state.
  if (!order || order.user_id !== user.id) {
    return { outcome: "unknown" as const, orderId: null };
  }

  return confirmChapaPaymentCore(txRef);
}

/**
 * Payment-attempt history for the admin order detail page.
 */
export async function getPaymentsForOrder(orderId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  assertNoDbError(profileError, "getPaymentsForOrder.profile");

  if (!profile?.is_admin) {
    throw new Error("Not authorized.");
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("payments")
    .select("id, tx_ref, chapa_reference, status, amount, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  assertNoDbError(error, "getPaymentsForOrder");

  return data ?? [];
}
