import Link from "next/link";
import { getNewArrivals, getDeals } from "@/lib/actions/products";
import { ProductCard } from "@/components/product-card";
import { HeroGraphic } from "@/components/hero-graphic";
import { TrustStrip } from "@/components/trust-strip";

export default async function HomePage() {
  const [newArrivals, deals] = await Promise.all([getNewArrivals(4), getDeals(4)]);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              Everyday goods, honest prices.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted">
              Clothing, electronics, and home essentials — in stock, fairly priced, and
              delivered across Ethiopia. Pay by bank transfer, mobile money, or card.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Shop all products
              </Link>
              {deals.length > 0 && (
                <Link
                  href="/products"
                  className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink"
                >
                  See today&apos;s deals
                </Link>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm md:max-w-none">
            <HeroGraphic />
          </div>
        </div>
      </section>

      <TrustStrip />

      {deals.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold text-ink">Today&apos;s deals</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-bold text-ink">New arrivals</h2>
        {newArrivals.length === 0 ? (
          <p className="mt-4 text-muted">
            No products yet — add some from the admin dashboard.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
