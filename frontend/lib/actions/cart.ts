"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";

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
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  assertNoDbError(error, "getCart");
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

  assertNoDbError(error, "getCartCount");
  return count ?? 0;
}

export async function addToCart(
  productId: string,
  quantity = 1,
  options?: { color?: string | null; size?: string | null }
) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const { supabase, user } = await requireUser();
  const color = options?.color ?? null;
  const size = options?.size ?? null;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, stock, is_active")
    .eq("id", productId)
    .maybeSingle();
  assertNoDbError(productError, "addToCart.lookupProduct");
  if (!product || !product.is_active) {
    throw new Error("This product is no longer available.");
  }

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
  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  assertNoDbError(existingError, "addToCart.lookupExisting");

  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > product.stock) {
    throw new Error(
      product.stock > 0
        ? `Only ${product.stock} of ${product.name} left in stock.`
        : `${product.name} is out of stock.`
    );
  }

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existing.id);
    assertNoDbError(error, "addToCart.update");
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity, color, size });
    assertNoDbError(error, "addToCart.insert");
  }

  revalidatePath("/cart");
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (!Number.isFinite(quantity)) {
    throw new Error("Invalid quantity.");
  }
  const { supabase, user } = await requireUser();

  if (quantity <= 0) {
    // Ownership filter is defense in depth on top of RLS — makes sure this
    // action can never touch a row that isn't the current user's.
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);
    assertNoDbError(error, "updateCartItemQuantity.delete");
  } else {
    const { data: item, error: lookupError } = await supabase
      .from("cart_items")
      .select("id, product:products(name, stock)")
      .eq("id", cartItemId)
      .eq("user_id", user.id)
      .maybeSingle();
    assertNoDbError(lookupError, "updateCartItemQuantity.lookup");
    if (!item) throw new Error("That cart item no longer exists.");

    const product = item.product as unknown as { name: string; stock: number };
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} of ${product.name} left in stock.`);
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", user.id);
    assertNoDbError(error, "updateCartItemQuantity.update");
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", user.id);
  assertNoDbError(error, "removeFromCart");
  revalidatePath("/cart");
}
