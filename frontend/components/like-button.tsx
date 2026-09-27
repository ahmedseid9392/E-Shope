"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function LikeButton({
  productId,
  initialLiked = false,
  size = 18,
  className = "",
}: {
  productId: string;
  initialLiked?: boolean;
  size?: number;
  className?: string;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    // Product cards wrap this button in a <Link>; stop the click from also
    // navigating to the product page.
    e.preventDefault();
    e.stopPropagation();

    // Optimistic toggle — feels instant, and we roll back on error.
    const next = !liked;
    setLiked(next);

    startTransition(async () => {
      try {
        const result = await toggleWishlist(productId);
        setLiked(result.liked);
      } catch (err) {
        setLiked(!next);
        if (err instanceof Error && err.message.includes("Not authenticated")) {
          router.push("/login");
        }
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center rounded-full bg-surface/90 p-2 text-ink shadow-sm ring-1 ring-line backdrop-blur transition hover:text-red-500 disabled:opacity-60 ${className}`}
    >
      <Heart
        size={size}
        fill={liked ? "currentColor" : "none"}
        strokeWidth={1.75}
        className={liked ? "text-red-500" : ""}
      />
    </button>
  );
}
