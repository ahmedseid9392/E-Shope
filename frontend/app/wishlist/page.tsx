import Link from "next/link";
import { getWishlist } from "@/lib/actions/wishlist";
import { ProductCard } from "@/components/product-card";

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-muted">
          You haven&apos;t liked anything yet.{" "}
          <Link href="/products" className="underline">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item: any) => (
            <ProductCard key={item.product.id} product={item.product} liked />
          ))}
        </div>
      )}
    </main>
  );
}
