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

export async function getWishlist() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      "id, created_at, product:products(id, name, slug, price, sale_price, sale_starts_at, sale_ends_at, stock, image_urls)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  assertNoDbError(error, "getWishlist");
  return data ?? [];
}

/** Just the product ids the current user has liked — cheap to fetch alongside
 *  a product listing so each card can render its heart in the right state. */
export async function getWishlistIds(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);

  assertNoDbError(error, "getWishlistIds");
  return (data ?? []).map((row) => row.product_id);
}

/** Count for the header badge, same pattern as getCartCount. */
export async function getWishlistCount() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("wishlists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  assertNoDbError(error, "getWishlistCount");
  return count ?? 0;
}

export async function addToWishlist(productId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: user.id, product_id: productId })
    // Already liked — treat as a no-op rather than an error.
    .select()
    .maybeSingle();

  if (error && error.code !== "23505") assertNoDbError(error, "addToWishlist");

  revalidatePath("/wishlist");
  revalidatePath("/products");
}

export async function removeFromWishlist(productId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  assertNoDbError(error, "removeFromWishlist");

  revalidatePath("/wishlist");
  revalidatePath("/products");
}

/** Toggles like state and reports the new state back, so the client component
 *  calling this doesn't need a separate "is it liked" round trip. */
export async function toggleWishlist(productId: string): Promise<{ liked: boolean }> {
  const { supabase, user } = await requireUser();

  const { data: existing, error: lookupError } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();
  assertNoDbError(lookupError, "toggleWishlist.lookup");

  if (existing) {
    const { error } = await supabase.from("wishlists").delete().eq("id", existing.id);
    assertNoDbError(error, "toggleWishlist.delete");
    revalidatePath("/wishlist");
    revalidatePath("/products");
    return { liked: false };
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: user.id, product_id: productId });
  assertNoDbError(error, "toggleWishlist.insert");
  revalidatePath("/wishlist");
  revalidatePath("/products");
  return { liked: true };
}
