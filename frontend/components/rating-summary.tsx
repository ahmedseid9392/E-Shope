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

  return (
    <span className={`flex items-center gap-1 text-xs text-muted ${className}`}>
      <Star size={size} className="text-accent" fill="currentColor" strokeWidth={0} />
      <span className="font-medium text-ink">{avgRating.toFixed(1)}</span>
      <span>({reviewCount})</span>
    </span>
  );
}
