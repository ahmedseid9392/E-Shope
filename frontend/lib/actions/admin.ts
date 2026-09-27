"use server";

import { createClient } from "@/lib/supabase/server";

// Orders in these statuses count as realized revenue. `pending` orders exist
// but haven't been paid yet (see lib/actions/orders.ts), and `cancelled`
// orders obviously never should count.
const REVENUE_STATUSES = ["paid", "shipped", "delivered"];

// How many days of history to chart on the dashboard.
const CHART_DAYS = 14;

// Stock at or below this is flagged as "low stock".
const LOW_STOCK_THRESHOLD = 5;

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Not authorized.");
  return { supabase, user, profile };
}

function dayKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

export async function getAdminDashboardData() {
  const { supabase, profile } = await requireAdmin();

  const chartCutoff = new Date();
  chartCutoff.setDate(chartCutoff.getDate() - (CHART_DAYS - 1));
  chartCutoff.setHours(0, 0, 0, 0);

  const [
    ordersCountRes,
    pendingCountRes,
    revenueRowsRes,
    productsCountRes,
    customersCountRes,
    lowStockRowsRes,
    recentOrdersRes,
    chartOrdersRes,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total, status").in("status", REVENUE_STATUSES),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_admin", false),
    supabase
      .from("products")
      .select("id, name, stock")
      .eq("is_active", true)
      .lte("stock", LOW_STOCK_THRESHOLD)
      .order("stock", { ascending: true })
      .limit(5),
    supabase
      .from("orders")
      .select("id, status, total, created_at, user_id, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("orders")
      .select("total, status, created_at")
      .gte("created_at", chartCutoff.toISOString()),
  ]);

  for (const res of [
    ordersCountRes,
    pendingCountRes,
    revenueRowsRes,
    productsCountRes,
    customersCountRes,
    lowStockRowsRes,
    recentOrdersRes,
    chartOrdersRes,
  ]) {
    if (res.error) throw new Error(res.error.message);
  }

  const totalRevenue = (revenueRowsRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.total),
    0
  );

  // Build a zero-filled bucket per day so the chart doesn't skip empty days.
  const buckets = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) {
    const d = new Date(chartCutoff);
    d.setDate(d.getDate() + i);
    buckets.set(dayKey(d), 0);
  }
  for (const order of chartOrdersRes.data ?? []) {
    if (!REVENUE_STATUSES.includes(order.status)) continue;
    const key = dayKey(order.created_at);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(order.total));
    }
  }
  const revenueByDay = Array.from(buckets.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return {
    profile,
    stats: {
      totalRevenue,
      totalOrders: ordersCountRes.count ?? 0,
      pendingOrders: pendingCountRes.count ?? 0,
      totalProducts: productsCountRes.count ?? 0,
      totalCustomers: customersCountRes.count ?? 0,
      lowStockCount: (lowStockRowsRes.data ?? []).length,
    },
    revenueByDay,
    recentOrders: recentOrdersRes.data ?? [],
    lowStockProducts: lowStockRowsRes.data ?? [],
  };
}
