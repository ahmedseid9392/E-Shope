import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, CreditCard, Truck, PackageCheck, XCircle, User, Phone, MapPin, HelpCircle } from "lucide-react";
import { getOrderById } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";

const STEPS = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "paid", label: "Paid", icon: CreditCard },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

type ShippingAddress = {
  full_name?: string;
  phone?: string;
  address_line?: string;
  city?: string;
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  let order;
  try {
    order = await getOrderById(params.id);
  } catch (err) {
    // Only a genuine "doesn't exist / not yours" case renders as a 404 —
    // any other failure (a dropped DB connection, etc.) is re-thrown so the
    // route's error.tsx boundary can offer a proper "try again".
    if (err instanceof Error && err.message === "Order not found.") notFound();
    throw err;
  }
  if (!order) notFound();

  const currentStep = STEPS.findIndex((s) => s.key === order.status);
  const address = (order.shipping_address ?? {}) as ShippingAddress;
  const itemCount = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Placed{" "}
            {new Date(order.created_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            · {itemCount} item{itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* ── Progress ─────────────────────────────────────────────────────── */}
      {order.status === "cancelled" ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900/40 dark:bg-red-950 dark:text-red-300">
          <XCircle size={20} className="shrink-0" />
          <p className="text-sm">
            This order was cancelled. If you think this is a mistake,{" "}
            <Link href="/contact" className="underline">
              contact us
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStep;
              return (
                <div key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        done
                          ? "border-accent bg-accent text-onaccent"
                          : "border-line bg-bg text-muted"
                      }`}
                    >
                      <Icon size={15} />
                    </span>
                    <span
                      className={`text-center text-[11px] sm:text-xs ${
                        done ? "font-medium text-ink" : "text-muted"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`mx-1.5 h-0.5 flex-1 rounded transition sm:mx-2 ${
                        i < currentStep ? "bg-accent" : "bg-line"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Items ────────────────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          Items
        </h2>
        <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg sm:h-16 sm:w-16">
                {item.product?.image_urls?.[0] && (
                  <Image
                    src={item.product.image_urls[0]}
                    alt={item.product?.name ?? "Product"}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {item.product?.slug ? (
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="break-words font-medium text-ink hover:underline"
                  >
                    {item.product.name}
                  </Link>
                ) : (
                  <p className="break-words font-medium text-ink">
                    {item.product?.name ?? "Product"}
                  </p>
                )}
                <p className="text-xs text-muted">
                  Qty {item.quantity}
                  {(item.color || item.size) && (
                    <span> · {[item.color, item.size].filter(Boolean).join(", ")}</span>
                  )}
                  {" · "}
                  {formatPrice(item.price_at_purchase)} each
                </p>
              </div>
              <p className="shrink-0 font-medium text-ink">
                {formatPrice(item.price_at_purchase * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between rounded-xl border border-line bg-surface px-4 py-3 font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* ── Shipping details ─────────────────────────────────────────────── */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
          Shipping details
        </h2>
        <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-surface p-4 text-sm sm:p-5">
          {address.full_name && (
            <p className="flex items-center gap-2 text-ink">
              <User size={15} className="shrink-0 text-muted" />
              {address.full_name}
            </p>
          )}
          {address.phone && (
            <p className="flex items-center gap-2 text-ink">
              <Phone size={15} className="shrink-0 text-muted" />
              {address.phone}
            </p>
          )}
          {(address.address_line || address.city) && (
            <p className="flex items-start gap-2 text-ink">
              <MapPin size={15} className="mt-0.5 shrink-0 text-muted" />
              <span>
                {address.address_line}
                {address.address_line && address.city && ", "}
                {address.city}
              </span>
            </p>
          )}
          {!address.full_name && !address.phone && !address.address_line && !address.city && (
            <p className="text-muted">No shipping details on file for this order.</p>
          )}
        </div>
      </div>

      {/* ── Help ─────────────────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
        <HelpCircle size={16} className="shrink-0" />
        <span>
          Questions about this order?{" "}
          <Link href="/contact" className="font-medium text-ink underline">
            Contact us
          </Link>
          .
        </span>
      </div>
    </main>
  );
}
