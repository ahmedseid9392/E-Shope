"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(orderId, e.target.value))}
      className="rounded border border-line px-2 py-1 text-sm disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
