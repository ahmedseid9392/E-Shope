"use client";

import { useState, useTransition } from "react";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { updateCartItemQuantity, removeFromCart } from "@/lib/actions/cart";

type CartItem = {
  id: string;
  quantity: number;
  color?: string | null;
  size?: string | null;
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
  const [isRemoving, setIsRemoving] = useState(false);
  const unitPrice = item.product.sale_price ?? item.product.price;

  function handleRemove() {
    setIsRemoving(true);
    startTransition(async () => {
      try {
        await removeFromCart(item.id);
      } finally {
        setIsRemoving(false);
      }
    });
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 border-b border-line py-4 transition-opacity ${
        isRemoving ? "opacity-40" : ""
      }`}
    >
      <div>
        <p className="font-medium">{item.product.name}</p>
        {(item.color || item.size) && (
          <p className="text-xs text-muted">
            {item.color && <span>Color: {item.color}</span>}
            {item.color && item.size && <span> · </span>}
            {item.size && <span>Size: {item.size}</span>}
          </p>
        )}
        <p className="text-sm text-muted">{formatPrice(unitPrice)} each</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            disabled={isPending}
            aria-label="Decrease quantity"
            onClick={() =>
              startTransition(() => updateCartItemQuantity(item.id, item.quantity - 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded border border-line disabled:opacity-50"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center">{item.quantity}</span>
          <button
            disabled={isPending}
            aria-label="Increase quantity"
            onClick={() =>
              startTransition(() => updateCartItemQuantity(item.id, item.quantity + 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded border border-line disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>

        <p className="w-20 text-right font-medium">{formatPrice(unitPrice * item.quantity)}</p>

        <button
          disabled={isPending}
          onClick={handleRemove}
          aria-label={`Remove ${item.product.name} from cart`}
          title="Remove from cart"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}
