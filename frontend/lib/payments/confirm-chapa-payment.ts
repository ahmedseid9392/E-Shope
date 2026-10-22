
import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";
import { verifyChapaTransaction } from "@/lib/chapa";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email-templates";

export type ConfirmOutcome =
  | "paid"
  | "already_paid"
  | "failed"
  | "pending"
  | "unknown";

export type ConfirmPaymentResult = {
  outcome: ConfirmOutcome;
  orderId: string | null;
};

/**
 * Private server-side payment confirmation core.
 *
 * Only trusted server-side routes and server actions should invoke this
 * function. Client components must not import this module.
 *
 * This function independently verifies the transaction with Chapa before
 * requesting database finalization.
 */
export async function confirmChapaPaymentCore(
  txRef: string
): Promise<ConfirmPaymentResult> {
  if (typeof txRef !== "string" || !txRef.trim()) {
    return { outcome: "unknown", orderId: null };
  }

  const admin = createAdminClient();

  const { data: payment, error: lookupError } = await admin
    .from("payments")
    .select("order_id, amount, status")
    .eq("tx_ref", txRef)
    .maybeSingle();

  assertNoDbError(lookupError, "confirmChapaPaymentCore.lookup");

  if (!payment) {
    return { outcome: "unknown", orderId: null };
  }

  if (payment.status === "success") {
    return {
      outcome: "already_paid",
      orderId: payment.order_id,
    };
  }

  let verification;

  try {
    verification = await verifyChapaTransaction(txRef);
  } catch (err) {
    // A verification/network error does not prove that the payment failed.
    console.error("[confirmChapaPaymentCore] verification failed", err);

    return {
      outcome: "pending",
      orderId: payment.order_id,
    };
  }

  if (verification.status !== "success") {
    const { error: updateError } = await admin
      .from("payments")
      .update({ status: verification.status })
      .eq("tx_ref", txRef);

    assertNoDbError(
      updateError,
      "confirmChapaPaymentCore.updatePaymentStatus"
    );

    return {
      outcome:
        verification.status === "pending" ? "pending" : "failed",
      orderId: payment.order_id,
    };
  }

  // Compare the provider-confirmed amount with the locally recorded amount.
  // The database finalization function must independently validate the
  // authoritative order total as a second layer of protection.
  if (
    !Number.isFinite(verification.amount) ||
    Math.abs(verification.amount - Number(payment.amount)) > 0.5
  ) {
    console.error("[confirmChapaPaymentCore] amount mismatch", {
      expected: payment.amount,
      received: verification.amount,
      txRef,
    });

    return {
      outcome: "failed",
      orderId: payment.order_id,
    };
  }

  const { data: justPaid, error: rpcError } = await admin.rpc(
    "mark_order_paid",
    {
      p_order_id: payment.order_id,
      p_tx_ref: txRef,
      p_chapa_reference: verification.reference,
      p_amount: verification.amount,
    }
  );

  assertNoDbError(rpcError, "confirmChapaPaymentCore.markPaid");

  if (justPaid) {
    await sendOrderConfirmationEmail(admin, payment.order_id);
  }

  return {
    outcome: justPaid ? "paid" : "already_paid",
    orderId: payment.order_id,
  };
}

/**
 * Send the confirmation email after the database reports that the order
 * was paid for the first time. Email failures must not undo payment state.
 */
async function sendOrderConfirmationEmail(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string
): Promise<void> {
  try {
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select(
        "id, total, user_id, order_items(quantity, price_at_purchase, product:products(name))"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error(
        "[sendOrderConfirmationEmail] order lookup failed",
        orderError
      );
      return;
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", order.user_id)
      .single();

    if (profileError || !profile?.email) {
      if (profileError) {
        console.error(
          "[sendOrderConfirmationEmail] profile lookup failed",
          profileError
        );
      }
      return;
    }

    const items = (order.order_items as any[]).map((item) => ({
      name: item.product?.name ?? "Item",
      quantity: item.quantity,
      price: Number(item.price_at_purchase),
    }));

    await sendEmail({
      to: profile.email,
      ...orderConfirmationEmail({
        orderId: order.id,
        items,
        total: Number(order.total),
      }),
    });
  } catch (err) {
    console.error("[sendOrderConfirmationEmail] failed", err);
  }
}
