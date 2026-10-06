import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, Mail, MapPin, Phone, CreditCard } from "lucide-react";
import { getOrderForAdmin } from "@/lib/actions/orders";
import { getPaymentsForOrder } from "@/lib/actions/payments";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/order-status-select";
import { OrderStatusBadge } from "@/components/order-status-badge";

const PAYMENT_STYLES: Record<string, string> = {
  success: "bg-green-500/15 text-green-700 dark:text-green-400",
  pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  failed: "bg-red-500/15 text-red-700 dark:text-red-400",
};

type ShippingAddress = {
  full_name?: string;
  phone?: string;
  address_line?: string;
  city?: string;
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  let order;
  try {
    order = await getOrderForAdmin(params.id);
  } catch (err) {
    if (err instanceof Error && err.message === "Order not found.") notFound();
    throw err;
  }
  if (!order) notFound();

  const payments = await getPaymentsForOrder(params.id);

  const customer = order.profiles as {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
  } | null;
  const address = (order.shipping_address ?? {}) as ShippingAddress;
  const itemCount = order.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/orders"
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
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 md:order-2">
          {/* ── Items ──────────────────────────────────────────────────── */}
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

          {/* ── Payments ───────────────────────────────────────────────── */}
          <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Payment history
          </h2>
          {payments.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No payment attempts recorded yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 text-sm sm:p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <CreditCard size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{p.tx_ref}</p>
                    <p className="truncate text-xs text-muted">
                      {p.chapa_reference ? `Ref: ${p.chapa_reference} · ` : ""}
                      {new Date(p.created_at).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium text-ink">{formatPrice(p.amount)}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      PAYMENT_STYLES[p.status] ?? "bg-line/50 text-muted"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 md:order-1">
          {/* ── Customer ───────────────────────────────────────────────── */}
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Customer
            </h2>
            <div className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-bg">
                  {customer?.avatar_url ? (
                    <Image src={customer.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted">
                      <User size={16} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {customer?.full_name ?? "Unnamed customer"}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted">
                    <Mail size={11} className="shrink-0" />
                    {customer?.email ?? "—"}
                  </p>
                </div>
              </div>
              {customer?.id && (
                <Link
                  href={`/admin/customers?highlight=${customer.id}`}
                  className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                >
                  View in customer list →
                </Link>
              )}
            </div>
          </div>

          {/* ── Shipping ───────────────────────────────────────────────── */}
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
              Shipping details
            </h2>
            <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-surface p-4 text-sm">
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
        </div>
      </div>
    </div>
  );
}
