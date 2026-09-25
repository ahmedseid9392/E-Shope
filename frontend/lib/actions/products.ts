"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";

export type ProductListParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

// ── Public reads ─────────────────────────────────────────────────────────────

export async function listProducts(params: ProductListParams = {}) {
  const supabase = createClient();
  let query = supabase.from("products").select("*").eq("is_active", true);

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }
  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (params.minPrice !== undefined) {
    query = query.gte("price", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("price", params.maxPrice);
  }

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

export async function getNewArrivals(limit = 8) {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getDeals(limit = 8) {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .not("sale_price", "is", null)
    .or(`sale_ends_at.is.null,sale_ends_at.gte.${nowIso}`)
    .limit(limit);
  return data ?? [];
}

export async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

/**
 * Active products NOT in excludeIds — used to fill a "you might also like" section
 * below search results, so a search always leaves the customer with more to browse
 * instead of a dead end.
 */
export async function getOtherProducts(excludeIds: string[], limit = 8) {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data } = await query;
  return data ?? [];
}

// ── Admin writes ─────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized.");

  return supabase;
}

export type ProductActionState = { error?: string } | undefined;

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const supabase = await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    sale_price: formData.get("sale_price") || undefined,
    stock: formData.get("stock"),
    category_id: formData.get("category_id") || undefined,
    image_url: formData.get("image_url") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const { image_url, ...rest } = parsed.data;

  const { error } = await supabase.from("products").insert({
    ...rest,
    sale_price: parsed.data.sale_price || null,
    category_id: parsed.data.category_id || null,
    image_urls: image_url ? [image_url] : [],
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await requireAdmin();

  const parsed = productSchema.partial().safeParse({
    name: formData.get("name") ?? undefined,
    slug: formData.get("slug") ?? undefined,
    description: formData.get("description") ?? undefined,
    price: formData.get("price") ?? undefined,
    sale_price: formData.get("sale_price") || undefined,
    stock: formData.get("stock") ?? undefined,
    category_id: formData.get("category_id") || undefined,
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid input.");
  }

  const { error } = await supabase.from("products").update(parsed.data).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  // Soft delete — keep order history intact (order_items references product_id).
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
}
