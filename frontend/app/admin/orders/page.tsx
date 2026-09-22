import { getAllOrdersForAdmin } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/order-status-select";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2">Order</th>
            <th className="py-2">Customer</th>
            <th className="py-2">Total</th>
            <th className="py-2">Date</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-b border-line">
              <td className="py-3">#{order.id.slice(0, 8)}</td>
              <td className="py-3">
                {order.profiles?.full_name ?? order.profiles?.email ?? "—"}
              </td>
              <td className="py-3">{formatPrice(order.total)}</td>
              <td className="py-3">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="py-3">
                <OrderStatusSelect orderId={order.id} status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
