import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";

const STEPS = ["pending", "paid", "shipped", "delivered"];

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  let order;
  try {
    order = await getOrderById(params.id);
  } catch {
    notFound();
  }
  if (!order) notFound();

  const currentStep = STEPS.indexOf(order.status);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/orders" className="text-sm text-muted hover:underline">
        ← Back to orders
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Order #{order.id.slice(0, 8)}</h1>
      <p className="text-sm text-muted">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      {order.status === "cancelled" ? (
        <p className="mt-6 font-medium text-red-600">Cancelled</p>
      ) : (
        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={`h-2 flex-1 rounded ${
                  i <= currentStep ? "bg-ink" : "bg-line"
                }`}
              />
              {i < STEPS.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
      )}
      <div className="mt-1 flex justify-between text-xs text-muted">
        {STEPS.map((step) => (
          <span key={step} className="capitalize">
            {step}
          </span>
        ))}
      </div>

      <div className="mt-8 divide-y divide-line">
        {order.order_items.map((item: any) => (
          <div key={item.id} className="flex justify-between py-3">
            <span>
              {item.product?.name ?? "Product"} × {item.quantity}
            </span>
            <span>{formatPrice(item.price_at_purchase * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium">Shipping address</h2>
        <pre className="mt-1 whitespace-pre-wrap rounded bg-bg p-3 text-sm text-muted">
          {JSON.stringify(order.shipping_address, null, 2)}
        </pre>
      </div>
    </main>
  );
}
