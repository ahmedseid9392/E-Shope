"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { confirmChapaPayment } from "@/lib/actions/payments";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

/**
 * Manual recovery path for the "pending"/"unknown" states on the return
 * page — re-runs the same server-side verify + mark-paid logic the
 * callback route already tried, in case that first attempt hit a
 * transient failure (network blip, Chapa briefly unavailable).
 */
export function CheckPaymentAgainButton({ txRef }: { txRef: string }) {
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(false);
  const toast = useToast();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await confirmChapaPayment(txRef);
        setChecked(true);
        if (result.outcome === "paid" || result.outcome === "already_paid") {
          toast("Payment confirmed!", "success");
          if (result.orderId) router.push(`/orders/${result.orderId}`);
        } else if (result.outcome === "failed") {
          toast("This payment didn't go through.");
        } else {
          toast("Still waiting on confirmation from Chapa — try again shortly.");
        }
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't check payment status."));
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink disabled:opacity-50"
    >
      <RotateCw size={14} className={isPending ? "animate-spin" : ""} />
      {isPending ? "Checking..." : checked ? "Check again" : "Check payment status"}
    </button>
  );
}
