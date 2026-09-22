"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getReviews(productId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type ReviewActionState = { error?: string; success?: boolean } | undefined;

export async function createReview(
  productId: string,
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to leave a review." };

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "");

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Pick a rating between 1 and 5." };
  }

  // RLS also enforces this (see 0001_init.sql: "insert review if delivered"),
  // but checking here first gives a clear error message instead of a raw DB error.
  const { data: eligible } = await supabase
    .from("order_items")
    .select("order_id, orders!inner(status, user_id)")
    .eq("product_id", productId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "delivered")
    .limit(1);

  if (!eligible || eligible.length === 0) {
    return { error: "You can only review products from a delivered order." };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment,
  });

  if (error) return { error: error.message };

  revalidatePath(`/products`);
  return { success: true };
}
