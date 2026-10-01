"use client";

import { useTransition } from "react";
import { CreditCard } from "lucide-react";
import { initiateChapaPaymentForOrder } from "@/lib/actions/payments";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

/**
 * Starts (or restarts) a Chapa checkout for a pending order. On success the
 * server action's redirect() takes the browser straight to Chapa — nothing
 * else to do here. Only a genuine failure to start the payment reaches the
 * catch block (Next.js handles the redirect itself, it never surfaces here
 * as a rejected promise).
 */
export function PayNowButton({
  orderId,
  className = "",
}: {
  orderId: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    startTransition(async () => {
      try {
        await initiateChapaPaymentForOrder(orderId);
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't start payment. Please try again."));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-onaccent transition hover:bg-accent/90 disabled:opacity-50 sm:py-2.5 ${className}`}
    >
      <CreditCard size={16} />
      {isPending ? "Redirecting to Chapa..." : "Pay now"}
    </button>
  );
}
