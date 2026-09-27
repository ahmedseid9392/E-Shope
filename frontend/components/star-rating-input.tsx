"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export function StarRatingInput({
  name = "rating",
  defaultValue = 0,
}: {
  name?: string;
  defaultValue?: number;
}) {
  const [rating, setRating] = useState(defaultValue);
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? rating;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHovered(n)}
            onFocus={() => setHovered(n)}
            onClick={() => setRating(n)}
            className="p-0.5 text-accent transition hover:scale-110"
          >
            <Star size={24} fill={n <= display ? "currentColor" : "none"} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-muted">
          {rating} star{rating > 1 ? "s" : ""}
        </span>
      )}
      <input type="hidden" name={name} value={rating} />
    </div>
  );
}
