import { Star } from "lucide-react";

export function RatingSummary({
  avgRating,
  reviewCount,
  size = 13,
  className = "",
}: {
  avgRating: number | null;
  reviewCount: number;
  size?: number;
  className?: string;
}) {
  if (!avgRating || reviewCount === 0) return null;

  const roundedRating = Math.round(avgRating);

  return (
    <span className={`flex items-center gap-1.5 text-xs text-muted ${className}`}>
      <span className="flex items-center gap-0.5" aria-label={`${avgRating.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={star <= roundedRating ? "text-accent" : "text-muted/40"}
            fill={star <= roundedRating ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="font-medium text-ink">{avgRating.toFixed(1)}</span>
      <span>({reviewCount})</span>
    </span>
  );
}
