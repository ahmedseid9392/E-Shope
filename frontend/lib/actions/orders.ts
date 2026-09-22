"use server";

import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return { supabase, user };
}

export async function getOrders() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const { supabase, user } = await requireUser();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(name, slug))")
    .eq("id", orderId)
    .single();

  if (error) throw new Error(error.message);

  // Server-side ownership check on top of RLS — defense in depth.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (order.user_id !== user.id && !profile?.is_admin) {
    throw new Error("Not authorized.");
  }

  return order;
}

/**
 * Creates a `pending` order from the user's current cart. Does NOT touch stock
 * or mark anything paid — that only happens once Chapa's webhook independently
 * verifies the transaction (Phase 8). This action's job is just to snapshot the
 * cart into an order + order_items at a known total.
 */
export async function createPendingOrderFromCart(shippingAddress: Record<string, unknown>) {
  const { supabase, user } = await requireUser();

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("quantity, product:products(id, price, sale_price, stock, name)")
    .eq("user_id", user.id);

  if (cartError) throw new Error(cartError.message);
  if (!cartItems || cartItems.length === 0) throw new Error("Cart is empty.");

  for (const item of cartItems as any[]) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} doesn't have enough stock.`);
    }
  }

  const total = (cartItems as any[]).reduce((sum, item) => {
    const unitPrice = item.product.sale_price ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total,
      shipping_address: shippingAddress,
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const orderItems = (cartItems as any[]).map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_purchase: item.product.sale_price ?? item.product.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw new Error(itemsError.message);

  return order;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function getAllOrdersForAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not authorized.");

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at, user_id, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not authorized.");

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
}
