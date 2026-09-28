"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export function AddToCartButton({
  productId,
  disabled,
  color,
  size,
  iconOnly = false,
  className = "",
}: {
  productId: string;
  disabled?: boolean;
  color?: string | null;
  size?: string | null;
  /** Compact circular icon button, used on product cards. */
  iconOnly?: boolean;
  /** Extra classes for the full-size button (e.g. width on mobile). */
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    if (iconOnly) {
      // Product cards wrap this button in a <Link> to the product page —
      // adding to cart shouldn't also navigate away.
      e.preventDefault();
      e.stopPropagation();
    }
    startTransition(async () => {
      await addToCart(productId, 1, { color: color ?? null, size: size ?? null });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={handleClick}
        aria-label={disabled ? "Out of stock" : "Add to cart"}
        title={disabled ? "Out of stock" : "Add to cart"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm ring-1 ring-line backdrop-blur transition hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
      </button>
    );
  }

  return (
    <button
      disabled={disabled || isPending}
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 rounded bg-accent px-5 py-3 text-sm font-medium text-onaccent hover:bg-accent/90 disabled:opacity-50 sm:py-2.5 ${className}`}
    >
      {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
      {disabled ? "Out of stock" : justAdded ? "Added!" : isPending ? "Adding..." : "Add to cart"}
    </button>
  );
}
