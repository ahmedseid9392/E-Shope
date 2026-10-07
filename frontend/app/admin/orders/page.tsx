import Link from "next/link";
import { Eye } from "lucide-react";
import { getAllOrdersForAdmin } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/order-status-select";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { customer?: string };
}) {
  const orders = await getAllOrdersForAdmin(searchParams.customer);
  const customerName =
    searchParams.customer && orders[0]
      ? (orders[0] as any).profiles?.full_name ?? (orders[0] as any).profiles?.email
      : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">
          {searchParams.customer ? `Orders${customerName ? ` · ${customerName}` : ""}` : "Orders"}
        </h1>
        {searchParams.customer && (
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            Clear filter
          </Link>
        )}
      </div>

      {orders.length === 0 && <p className="mt-6 text-sm text-muted">No orders yet.</p>}

      {/* Phones: one card per order */}
      <ul className="mt-6 space-y-3 md:hidden">
        {orders.map((order: any) => (
          <li key={order.id} className="rounded-xl border border-line bg-surface p-4">
            <Link href={`/admin/orders/${order.id}`} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink hover:underline">#{order.id.slice(0, 8)}</p>
                <p className="truncate text-sm text-muted">
                  {order.profiles?.full_name ?? order.profiles?.email ?? "—"}
                </p>
              </div>
              <p className="shrink-0 font-medium text-ink">{formatPrice(order.total)}</p>
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-muted">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
              <OrderStatusSelect orderId={order.id} status={order.status} />
            </div>
          </li>
        ))}
      </ul>

      {/* Tablets & desktop: table (scrolls sideways inside its box if ever needed) */}
      {orders.length > 0 && (
        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2">Order</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Total</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-line">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                      #{order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-3">
                    {order.profiles?.full_name ?? order.profiles?.email ?? "—"}
                  </td>
                  <td className="py-3">{formatPrice(order.total)}</td>
                  <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      aria-label="View order"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-bg hover:text-ink"
                    >
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
