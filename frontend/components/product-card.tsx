import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
};

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.sale_price !== null && product.sale_price < product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl border border-line bg-surface p-4 transition hover:border-ink/30 hover:shadow-sm"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-bg">
        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-onaccent">
            Sale
          </span>
        )}
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
