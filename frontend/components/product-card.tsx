import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { isOnSale } from "@/lib/sale";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { LikeButton } from "@/components/like-button";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  stock: number;
  image_urls?: string[] | null;
};

export function ProductCard({
  product,
  liked = false,
}: {
  product: Product;
  /** Whether the current user has already liked this product — pass this in
   *  from a page that fetched getWishlistIds() so the heart starts filled. */
  liked?: boolean;
}) {
  const onSale = isOnSale(product);
  const image = product.image_urls?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl border border-line bg-surface p-4 transition hover:border-ink/30 hover:shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-bg">
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        )}
        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-onaccent">
            Sale
          </span>
        )}

        <div className="absolute right-2 top-2">
          <LikeButton productId={product.id} initialLiked={liked} size={16} />
        </div>

        <div className="absolute bottom-2 right-2">
          <AddToCartButton productId={product.id} disabled={product.stock === 0} iconOnly />
        </div>
      </div>
      <h3 className="mt-3 font-display font-semibold text-ink">{product.name}</h3>
      <div className="mt-1 flex items-center gap-2">
        {onSale ? (
          <>
            <span className="text-sm text-muted line-through">
              {formatPrice(product.price)}
            </span>
            <span className="font-semibold text-ink">
              {formatPrice(product.sale_price!)}
            </span>
          </>
        ) : (
          <span className="font-semibold text-ink">{formatPrice(product.price)}</span>
        )}
      </div>
      {product.stock === 0 && (
        <p className="mt-1 text-xs text-muted">Out of stock</p>
      )}
    </Link>
  );
}
