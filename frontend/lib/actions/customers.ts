"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertNoDbError, dbErrorMessage } from "@/lib/errors";

const REVENUE_STATUSES = ["paid", "shipped", "delivered"];

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

export type AdminCustomer = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
};

/**
 * Every customer (admins included, flagged via is_admin) with order count +
 * lifetime spend computed in JS from a single orders query — fine at this
 * scale; worth moving to a SQL view/RPC if the order table gets huge.
 */
export async function getAllCustomersForAdmin(): Promise<AdminCustomer[]> {
  const supabase = await requireAdmin();

  const [{ data: profiles, error: profilesError }, { data: orders, error: ordersError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, is_admin, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, total, status"),
    ]);

  assertNoDbError(profilesError, "getAllCustomersForAdmin.profiles");
  assertNoDbError(ordersError, "getAllCustomersForAdmin.orders");

  const stats = new Map<string, { order_count: number; total_spent: number }>();
  for (const order of orders ?? []) {
    const entry = stats.get(order.user_id) ?? { order_count: 0, total_spent: 0 };
    entry.order_count += 1;
    if (REVENUE_STATUSES.includes(order.status)) {
      entry.total_spent += Number(order.total);
    }
    stats.set(order.user_id, entry);
  }

  return (profiles ?? []).map((p) => ({
    ...p,
    order_count: stats.get(p.id)?.order_count ?? 0,
    total_spent: stats.get(p.id)?.total_spent ?? 0,
  }));
}

/**
 * Promotes/demotes a user's admin access — this is what makes the Settings
 * page's "team" section actually do something, backed by the "admins can
 * update all profiles" RLS policy (0012_admin_profiles_and_ratings.sql).
 */
export async function setCustomerAdminStatus(
  targetUserId: string,
  isAdmin: boolean
): Promise<{ error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return { error: "Not authorized." };

  // Guard against an admin locking themselves out by accident — removing
  // your own access has to happen from another admin account instead.
  if (targetUserId === user.id && !isAdmin) {
    return { error: "You can't remove your own admin access." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", targetUserId);

  if (error) {
    return { error: dbErrorMessage(error, "setCustomerAdminStatus") };
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/settings");
  return {};
}
