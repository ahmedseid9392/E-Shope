import Link from "next/link";
import Image from "next/image";
import { PackageOpen, MapPin } from "lucide-react";
import { getOrders } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-16">
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Your orders</h1>
      <p className="mt-1 text-sm text-muted">
        {orders.length === 0
          ? "You haven't placed any orders yet."
          : `${orders.length} order${orders.length === 1 ? "" : "s"}.`}
      </p>

      {orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed border-line py-16 text-center">
          <PackageOpen size={32} className="text-muted" />
          <p className="mt-3 text-muted">No orders yet.</p>
          <Link
            href="/products"
            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent transition hover:bg-accent/90"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order: any) => {
            const itemCount = order.order_items.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            );
            const thumbnails = order.order_items
              .map((item: any) => item.product?.image_urls?.[0])
              .filter(Boolean)
              .slice(0, 4);
            const itemNames = order.order_items
              .map((item: any) => item.product?.name)
              .filter(Boolean);
            const city = order.shipping_address?.city as string | undefined;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-line bg-surface p-4 transition hover:border-ink/30 hover:shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}{" "}
                      · {itemCount} item{itemCount === 1 ? "" : "s"}
                      {city && (
                        <span className="ml-1 inline-flex items-center gap-0.5">
                          <MapPin size={11} className="inline" /> {city}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink">{formatPrice(order.total)}</p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
                  {thumbnails.length > 0 ? (
                    <div className="flex -space-x-2">
                      {thumbnails.map((src: string, i: number) => (
                        <div
                          key={i}
                          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-surface bg-bg"
                        >
                          <Image src={src} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className="min-w-0 truncate text-sm text-muted">
                    {itemNames.slice(0, 3).join(", ")}
                    {itemNames.length > 3 ? `, +${itemNames.length - 3} more` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
