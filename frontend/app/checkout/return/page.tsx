import Link from "next/link";
import { CheckCircle2, Clock3, XCircle, HelpCircle } from "lucide-react";
import { CheckPaymentAgainButton } from "@/components/check-payment-again-button";

const CONTENT: Record<
  string,
  { icon: typeof CheckCircle2; title: string; body: string; iconWrap: string; iconColor: string }
> = {
  paid: {
    icon: CheckCircle2,
    title: "Payment successful!",
    body: "Thanks — your order is confirmed and will be on its way soon.",
    iconWrap: "bg-green-500/15",
    iconColor: "text-green-600",
  },
  already_paid: {
    icon: CheckCircle2,
    title: "Payment already confirmed",
    body: "This order was already marked as paid.",
    iconWrap: "bg-green-500/15",
    iconColor: "text-green-600",
  },
  pending: {
    icon: Clock3,
    title: "Confirming your payment...",
    body: "Chapa hasn't confirmed this payment yet. This is usually quick — check again in a few seconds.",
    iconWrap: "bg-yellow-500/15",
    iconColor: "text-yellow-600",
  },
  failed: {
    icon: XCircle,
    title: "Payment didn't go through",
    body: "Your order is still saved — you can try paying again from the order page.",
    iconWrap: "bg-red-500/15",
    iconColor: "text-red-600",
  },
  unknown: {
    icon: HelpCircle,
    title: "We couldn't find that payment",
    body: "If you completed a payment, check your order history — it may already be confirmed.",
    iconWrap: "bg-line/50",
    iconColor: "text-muted",
  },
};

export default function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: { status?: string; order?: string; tx_ref?: string };
}) {
  const status = searchParams.status ?? "unknown";
  const content = CONTENT[status] ?? CONTENT.unknown;
  const Icon = content.icon;
  const orderId = searchParams.order;
  const txRef = searchParams.tx_ref;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className={`flex h-14 w-14 items-center justify-center rounded-full ${content.iconWrap}`}>
        <Icon size={28} className={content.iconColor} />
      </span>
      <h1 className="mt-5 font-display text-xl font-bold text-ink">{content.title}</h1>
      <p className="mt-2 text-sm text-muted">{content.body}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent transition hover:bg-accent/90"
          >
            View order
          </Link>
        )}
        {(status === "pending" || status === "failed" || status === "unknown") && txRef && (
          <CheckPaymentAgainButton txRef={txRef} />
        )}
        {!orderId && (
          <Link
            href="/orders"
            className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Your orders
          </Link>
        )}
      </div>
    </main>
  );
}
