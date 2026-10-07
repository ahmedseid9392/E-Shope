import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";

type RecentOrder = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted">No orders yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/admin/orders/${order.id}`}
            className="flex items-center gap-3 py-3 transition hover:bg-bg/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <ShoppingBag size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">
                  New order #{order.id.slice(0, 8)}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {formatRelativeTime(order.created_at)}
                </span>
              </span>
              <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted">
                <span className="truncate">
                  {order.profiles?.full_name ?? order.profiles?.email ?? "Guest"} ·{" "}
                  {formatPrice(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
