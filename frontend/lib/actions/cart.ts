"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  return { supabase, user };
}

export async function getCart() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, color, size, product:products(id, name, slug, price, sale_price, stock, image_urls)"
    )
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Number of distinct line items in the current user's cart — used for the
 * badge next to the "Cart" link in the header. Cheap head-only count query,
 * safe to call on every page render via the site header.
 */
export async function getCartCount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function addToCart(
  productId: string,
  quantity = 1,
  options?: { color?: string | null; size?: string | null }
) {
  const { supabase, user } = await requireUser();
  const color = options?.color ?? null;
  const size = options?.size ?? null;

  // upsert-style: if a line for this exact product+color+size already
  // exists, bump quantity; otherwise insert a new line. Different
  // color/size choices for the same product are kept as separate lines.
  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId);
  existingQuery = color ? existingQuery.eq("color", color) : existingQuery.is("color", null);
  existingQuery = size ? existingQuery.eq("size", size) : existingQuery.is("size", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity, color, size });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/cart");
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const { supabase } = await requireUser();

  if (quantity <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) throw new Error(error.message);
  revalidatePath("/cart");
}
