"use client";

import { useState, useTransition } from "react";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { updateCartItemQuantity, removeFromCart } from "@/lib/actions/cart";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

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
    stock: number;
  };
};

export function CartLineItem({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition();
  const [isRemoving, setIsRemoving] = useState(false);
  const unitPrice = item.product.sale_price ?? item.product.price;
  const toast = useToast();
  const atStockLimit = item.quantity >= item.product.stock;

  function changeQuantity(nextQuantity: number) {
    startTransition(async () => {
      try {
        await updateCartItemQuantity(item.id, nextQuantity);
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't update quantity."));
      }
    });
  }

  function handleRemove() {
    setIsRemoving(true);
    startTransition(async () => {
      try {
        await removeFromCart(item.id);
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't remove this item."));
      } finally {
        setIsRemoving(false);
      }
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 border-b border-line py-4 transition-opacity sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
        isRemoving ? "opacity-40" : ""
      }`}
    >
      {/* Product info — full width on phones so long names can wrap */}
      <div className="min-w-0 sm:flex-1">
        <p className="break-words font-medium">{item.product.name}</p>
        {(item.color || item.size) && (
          <p className="text-xs text-muted">
            {item.color && <span>Color: {item.color}</span>}
            {item.color && item.size && <span> · </span>}
            {item.size && <span>Size: {item.size}</span>}
          </p>
        )}
        <p className="text-sm text-muted">{formatPrice(unitPrice)} each</p>
        {atStockLimit && (
          <p className="text-xs text-accent">Max available stock reached</p>
        )}
      </div>

      {/* Quantity, line total, remove — one tidy row that fits a 320px screen */}
      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <div className="flex items-center gap-2">
          <button
            disabled={isPending}
            aria-label="Decrease quantity"
            onClick={() => changeQuantity(item.quantity - 1)}
            className="flex h-9 w-9 items-center justify-center rounded border border-line disabled:opacity-50 sm:h-8 sm:w-8"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center">{item.quantity}</span>
          <button
            disabled={isPending || atStockLimit}
            aria-label="Increase quantity"
            title={atStockLimit ? "No more in stock" : undefined}
            onClick={() => changeQuantity(item.quantity + 1)}
            className="flex h-9 w-9 items-center justify-center rounded border border-line disabled:opacity-50 sm:h-8 sm:w-8"
          >
            <Plus size={14} />
          </button>
        </div>

        <p className="min-w-[5rem] whitespace-nowrap text-right font-medium">
          {formatPrice(unitPrice * item.quantity)}
        </p>

        <button
          disabled={isPending}
          onClick={handleRemove}
          aria-label={`Remove ${item.product.name} from cart`}
          title="Remove from cart"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 sm:h-8 sm:w-8"
        >
          {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
}
