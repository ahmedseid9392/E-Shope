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
    .select("id, quantity, product:products(id, name, slug, price, sale_price, stock, image_urls)")
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addToCart(productId: string, quantity = 1) {
  const { supabase, user } = await requireUser();

  // upsert-style: if the row exists, bump quantity; otherwise insert.
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity });
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
