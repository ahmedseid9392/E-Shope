"use server";

import { createClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";
import { sendEmail } from "@/lib/email";
import { orderStatusEmail } from "@/lib/email-templates";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return { supabase, user };
}

/**
 * Full order history for the current user — not just id/date/total, but
 * enough about each order's items (name, thumbnail, quantity) to render a
 * useful summary card without a second round trip per order.
 */
export async function getOrders() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total, created_at, shipping_address, order_items(id, quantity, color, size, product:products(name, slug, image_urls))"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  assertNoDbError(error, "getOrders");
  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const { supabase, user } = await requireUser();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(name, slug, image_urls))"
    )
    .eq("id", orderId)
    .single();

  // PGRST116 = no matching row — treat the same as "not authorized" below so
  // a caller can't tell the difference between "doesn't exist" and "exists
  // but isn't yours" by the error shape.
  if (error) {
    if (error.code === "PGRST116") throw new Error("Order not found.");
    assertNoDbError(error, "getOrderById");
  }

  // Server-side ownership check on top of RLS — defense in depth.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  assertNoDbError(profileError, "getOrderById.profile");

  if (order.user_id !== user.id && !profile?.is_admin) {
    throw new Error("Order not found.");
  }

  return order;
}

/**
 * Creates a `pending` order from the user's current cart. Does NOT touch stock
 * or mark anything paid — that only happens once Chapa's webhook independently
 * verifies the transaction (Phase 8). This action's job is just to snapshot the
 * cart into an order + order_items at a known total.
 */

export async function createPendingOrderFromCart(
  shippingAddress: Record<string, unknown>
) {
  const { supabase } = await requireUser();

  const { data: order, error } = await supabase.rpc(
    "create_pending_order_from_cart",
    {
      p_shipping_address: shippingAddress,
    }
  );

  assertNoDbError(error, "createPendingOrderFromCart");

  if (!order) {
    throw new Error("Order creation did not return an order.");
  }

  return order;
}

// ── Admin ────────────────────────────────────────────────────────────────────

/**
 * Full order detail for the admin order page — same shape as getOrderById's
 * order_items/product join, plus the customer's profile (name, email,
 * avatar), which getOrderById doesn't need for the customer's own view.
 */
export async function getOrderForAdmin(orderId: string) {
  const { supabase, user } = await requireUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  assertNoDbError(profileError, "getOrderForAdmin.profile");
  if (!profile?.is_admin) throw new Error("Not authorized.");

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*, product:products(name, slug, image_urls)), profiles(id, full_name, email, avatar_url, created_at)"
    )
    .eq("id", orderId)
    .single();

  if (error) {
    if (error.code === "PGRST116") throw new Error("Order not found.");
    assertNoDbError(error, "getOrderForAdmin");
  }

  return order;
}

/** `customerId` narrows to one customer's orders — used by the "View orders"
 *  link on the admin Customers page. Omit it for the full order list. */
export async function getAllOrdersForAdmin(customerId?: string) {
  const { supabase, user } = await requireUser();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  assertNoDbError(profileError, "getAllOrdersForAdmin.profile");
  if (!profile?.is_admin) throw new Error("Not authorized.");

  let query = supabase
    .from("orders")
    .select("id, status, total, created_at, user_id, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (customerId) query = query.eq("user_id", customerId);

  const { data, error } = await query;

  assertNoDbError(error, "getAllOrdersForAdmin");
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid order status.");
  }

  const { supabase, user } = await requireUser();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  assertNoDbError(profileError, "updateOrderStatus.profile");
  if (!profile?.is_admin) throw new Error("Not authorized.");

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  assertNoDbError(error, "updateOrderStatus");

  // Best-effort notification — the status update above already succeeded,
  // so a broken email provider must not turn this into a failed request.
  const content = orderStatusEmail({ orderId, status });
  if (content) {
    try {
      const { data: order } = await supabase
        .from("orders")
        .select("user_id, profiles(email)")
        .eq("id", orderId)
        .single();
      const email = (order?.profiles as any)?.email;
      if (email) await sendEmail({ to: email, ...content });
    } catch (err) {
      console.error("[updateOrderStatus] status email failed", err);
    }
  }
}
