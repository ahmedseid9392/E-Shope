"use client";

import { useTransition } from "react";
import { addToCart } from "@/lib/actions/cart";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() => startTransition(() => addToCart(productId, 1))}
      className="rounded bg-ink px-4 py-2 text-sm text-white hover:bg-ink/90 disabled:opacity-50"
    >
      {disabled ? "Out of stock" : isPending ? "Adding..." : "Add to cart"}
    </button>
  );
}
