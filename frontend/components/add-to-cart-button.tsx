"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export function AddToCartButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() => startTransition(() => addToCart(productId, 1))}
      className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm text-onaccent hover:bg-accent/90 disabled:opacity-50"
    >
      <ShoppingCart size={16} />
      {disabled ? "Out of stock" : isPending ? "Adding..." : "Add to cart"}
    </button>
  );
}
