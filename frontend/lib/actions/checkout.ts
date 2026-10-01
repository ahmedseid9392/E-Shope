"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPendingOrderFromCart } from "@/lib/actions/orders";
import { initiateChapaPaymentForOrder } from "@/lib/actions/payments";

export type CheckoutActionState = { error?: string } | undefined;

/** redirect() throws a special error (digest starting "NEXT_REDIRECT") that
 *  must propagate to Next.js untouched — never treated as a real failure. */
function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/**
 * Creates a pending order from the cart, clears the cart, then starts a
 * Chapa payment for it and redirects to Chapa's hosted checkout. The order
 * stays `pending` until Chapa's callback (or webhook) independently
 * verifies the transaction — see lib/actions/payments.ts.
 */
export async function checkout(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const shippingAddress = {
    full_name: String(formData.get("full_name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address_line: String(formData.get("address_line") ?? ""),
    city: String(formData.get("city") ?? ""),
  };

  if (!shippingAddress.full_name || !shippingAddress.phone || !shippingAddress.address_line) {
    return { error: "Please fill in your name, phone, and address." };
  }

  let orderId: string;
  try {
    const order = await createPendingOrderFromCart(shippingAddress);
    orderId = order.id;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Checkout failed." };
  }

  // Deliberately outside the try/catch above — initiateChapaPaymentForOrder
  // ends in redirect(), which must propagate to Next.js, not be swallowed.
  try {
    await initiateChapaPaymentForOrder(orderId);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    // The order itself was created fine; only starting the Chapa payment
    // failed (e.g. a network hiccup). Send the person to the order page,
    // where a "Pay now" button lets them retry without losing the order.
    redirect(`/orders/${orderId}?payment_error=1`);
  }
}
