import { listProducts, getCategories, getOtherProducts } from "@/lib/actions/products";
import { logSearch, getRecentSearches } from "@/lib/actions/search";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const { q, category, sort } = searchParams;

  if (q) {
    await logSearch(q);
  }

  const [products, categories, recentSearches] = await Promise.all([
    listProducts({
      q,
      category,
      sort: sort as "newest" | "price_asc" | "price_desc" | undefined,
    }),
    getCategories(),
    getRecentSearches(),
  ]);

  // When there's an active text search, always leave the customer with more to
  // browse — whether or not the search matched anything.
  const otherProducts = q
    ? await getOtherProducts(products.map((p) => p.id), 8)
    : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Products</h1>

      <ProductFilters categories={categories} recentSearches={recentSearches} />

      {q ? (
        <>
          <h2 className="mt-8 text-sm font-medium text-muted">
            {products.length > 0
              ? `${products.length} result${products.length === 1 ? "" : "s"} for "${q}"`
              : `No results for "${q}"`}
          </h2>

          {products.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {otherProducts.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-lg font-bold text-ink">
                {products.length > 0 ? "You might also like" : "Other products"}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {otherProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : products.length === 0 ? (
        <p className="mt-10 text-muted">No products found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
