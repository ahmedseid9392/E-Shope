"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPendingOrderFromCart } from "@/lib/actions/orders";

export type CheckoutActionState = { error?: string } | undefined;

/**
 * Creates a pending order from the cart and clears the cart.
 * Does NOT process payment yet — that's Chapa's transaction/initialize call,
 * wired up in Phase 8. For now this lets you exercise the full order lifecycle
 * (pending -> paid -> shipped -> delivered) via the admin status dropdown.
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

  let order;
  try {
    order = await createPendingOrderFromCart(shippingAddress);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Checkout failed." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  }

  redirect(`/orders/${order.id}`);
}
