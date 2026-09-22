import { listProducts, getCategories } from "@/lib/actions/products";
import { logSearch, getRecentSearches } from "@/lib/actions/search";
import { ProductCard } from "@/components/product-card";

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Products</h1>

      <form className="mt-6 flex flex-wrap gap-3" action="/products">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="flex-1 min-w-[200px] rounded border border-line px-3 py-2 text-sm"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded border border-line px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort ?? "newest"}
          className="rounded border border-line px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
        <button
          type="submit"
          className="rounded bg-ink px-4 py-2 text-sm text-white hover:bg-ink/90"
        >
          Search
        </button>
      </form>

      {!q && recentSearches.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
          <span>Recent:</span>
          {recentSearches.map((term) => (
            <a
              key={term}
              href={`/products?q=${encodeURIComponent(term)}`}
              className="underline hover:text-ink"
            >
              {term}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
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
