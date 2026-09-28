"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";

// A handful of common color names get a real swatch; anything else falls
// back to a plain text chip so admins aren't limited to this list.
const SWATCHES: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
  red: "#dc2626",
  blue: "#2563eb",
  navy: "#1e3a8a",
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#ea580c",
  pink: "#ec4899",
  purple: "#9333ea",
  brown: "#78350f",
  beige: "#e7dcc8",
};

export function ProductOptions({
  productId,
  colors,
  sizes,
  disabled,
}: {
  productId: string;
  colors: string[];
  sizes: string[];
  disabled?: boolean;
}) {
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">
            Color{color ? <span className="font-normal text-muted"> — {color}</span> : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => {
              const swatch = SWATCHES[c.toLowerCase()];
              const selected = color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-pressed={selected}
                  aria-label={c}
                  title={c}
                  className={`flex h-9 items-center gap-2 rounded-full border px-1 pr-3 text-sm transition ${
                    selected ? "border-ink" : "border-line hover:border-ink/40"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-line"
                    style={{ backgroundColor: swatch ?? "transparent" }}
                  >
                    {!swatch && (
                      <span className="flex h-full w-full items-center justify-center text-[10px] uppercase text-muted">
                        {c.slice(0, 2)}
                      </span>
                    )}
                  </span>
                  {swatch ? c : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">
            Size{size ? <span className="font-normal text-muted"> — {size}</span> : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => {
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={selected}
                  className={`min-h-10 min-w-[2.75rem] rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    selected
                      ? "border-ink bg-ink text-bg"
                      : "border-line text-ink hover:border-ink/40"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AddToCartButton
        productId={productId}
        disabled={disabled}
        color={color}
        size={size}
        className="w-full sm:w-auto"
      />
    </div>
  );
}
