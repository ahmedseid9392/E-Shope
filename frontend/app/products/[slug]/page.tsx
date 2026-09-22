import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/actions/products";
import { getReviews } from "@/lib/actions/reviews";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ReviewForm } from "@/components/review-form";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getReviews(product.id),
  ]);

  const onSale = product.sale_price !== null && product.sale_price < product.price;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-bg" />

        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            {onSale ? (
              <>
                <span className="text-lg text-muted line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="font-display text-xl font-bold text-ink">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-ink">
                  Sale
                </span>
              </>
            ) : (
              <span className="font-display text-xl font-bold text-ink">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="mt-4 text-muted">{product.description}</p>

          <p className="mt-2 text-sm text-muted">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-6">
            <AddToCartButton productId={product.id} disabled={product.stock === 0} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-lg font-bold text-ink">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 max-w-xl">
        <h2 className="font-display text-lg font-bold text-ink">Reviews</h2>

        <div className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-muted">No reviews yet.</p>
          )}
          {reviews.map((r: any) => (
            <div key={r.id} className="border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{"★".repeat(r.rating)}</span>
                <span className="text-muted">
                  {r.profiles?.full_name ?? "Anonymous"}
                </span>
              </div>
              {r.comment && <p className="mt-1 text-sm text-ink">{r.comment}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium">Leave a review</h3>
          <p className="mb-3 text-xs text-muted">
            Only available if you have a delivered order for this product.
          </p>
          <ReviewForm productId={product.id} />
        </div>
      </section>
    </main>
  );
}
