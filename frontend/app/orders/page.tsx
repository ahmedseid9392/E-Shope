import Link from "next/link";
import { getOrders } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending payment",
  paid: "Paid",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-muted">
          No orders yet.{" "}
          <Link href="/products" className="underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 divide-y divide-line">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between py-4 hover:bg-bg"
            >
              <div>
                <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total)}</p>
                <p className="text-sm text-muted">
                  {STATUS_LABEL[order.status] ?? order.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
