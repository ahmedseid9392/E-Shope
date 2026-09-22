"use client";

import { useTransition } from "react";
import { formatPrice } from "@/lib/format";
import { updateCartItemQuantity, removeFromCart } from "@/lib/actions/cart";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
  };
};

export function CartLineItem({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  const unitPrice = item.product.sale_price ?? item.product.price;

  return (
    <div className="flex items-center justify-between border-b border-line py-4">
      <div>
        <p className="font-medium">{item.product.name}</p>
        <p className="text-sm text-muted">{formatPrice(unitPrice)} each</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => updateCartItemQuantity(item.id, item.quantity - 1))
            }
            className="h-7 w-7 rounded border border-line disabled:opacity-50"
          >
            −
          </button>
          <span className="w-6 text-center">{item.quantity}</span>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(() => updateCartItemQuantity(item.id, item.quantity + 1))
            }
            className="h-7 w-7 rounded border border-line disabled:opacity-50"
          >
            +
          </button>
        </div>

        <p className="w-20 text-right font-medium">{formatPrice(unitPrice * item.quantity)}</p>

        <button
          disabled={isPending}
          onClick={() => startTransition(() => removeFromCart(item.id))}
          className="text-sm text-muted hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
