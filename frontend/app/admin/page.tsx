import { DollarSign, ShoppingBag, Package, Users, Clock } from "lucide-react";
import { getAdminDashboardData } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/format";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { RecentOrders } from "@/components/admin/recent-orders";
import { LowStockList } from "@/components/admin/low-stock-list";

export default async function AdminDashboardPage() {
  const { profile, stats, revenueByDay, recentOrders, lowStockProducts } =
    await getAdminDashboardData();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Dashboard</h1>
      <p className="mt-1 text-muted">
        Welcome back, {profile.full_name ?? profile.email}. Here&apos;s what&apos;s happening in your store.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatPrice(stats.totalRevenue)}
          hint="Paid, shipped & delivered"
        />
        <StatCard icon={ShoppingBag} label="Orders" value={String(stats.totalOrders)} />
        <StatCard
          icon={Clock}
          label="Pending orders"
          value={String(stats.pendingOrders)}
          tone={stats.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatCard icon={Package} label="Active products" value={String(stats.totalProducts)} />
        <StatCard icon={Users} label="Customers" value={String(stats.totalCustomers)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-ink">Revenue, last 14 days</h2>
          <div className="mt-4">
            <RevenueChart data={revenueByDay} />
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <h2 className="font-display text-lg font-bold text-ink">Low stock</h2>
          <div className="mt-2">
            <LowStockList products={lowStockProducts} />
          </div>
        </div>
      </div>

      <div className="mt-6 min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 className="font-display text-lg font-bold text-ink">Recent activity</h2>
        <div className="mt-2">
          <RecentOrders orders={recentOrders as any} />
        </div>
      </div>
    </div>
  );
}
