"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(status);
  const toast = useToast();

  function handleChange(next: string) {
    const previous = value;
    setValue(next); // optimistic — reverted below if the update fails
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, next);
        toast("Order status updated.", "success");
      } catch (err) {
        setValue(previous);
        toast(getErrorMessage(err, "Couldn't update the order status."));
      }
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded border border-line bg-surface px-2 py-1 text-sm text-ink disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
