import Link from "next/link";
import { getNewArrivals, getDeals } from "@/lib/actions/products";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { ProductCard } from "@/components/product-card";
import { HeroGraphic } from "@/components/hero-graphic";
import { TrustStrip } from "@/components/trust-strip";

export default async function HomePage() {
  const [newArrivals, deals, likedIds] = await Promise.all([
    getNewArrivals(4),
    getDeals(4),
    getWishlistIds(),
  ]);
  const liked = new Set(likedIds);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-24">
        <div className="grid items-center gap-8 sm:gap-12 md:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-5xl">
              Everyday goods, honest prices.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted">
              Clothing, electronics, and home essentials — in stock, fairly priced, and
              delivered across Ethiopia. Pay by bank transfer, mobile money, or card.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/products"
                className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-onaccent transition hover:bg-accent/90"
              >
                Shop all products
              </Link>
              {deals.length > 0 && (
                <Link
                  href="/products"
                  className="rounded-full border border-line px-6 py-3 text-center text-sm font-semibold text-ink transition hover:border-ink"
                >
                  See today&apos;s deals
                </Link>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[16rem] sm:max-w-sm md:max-w-none">
            {/*
              HeroGraphic is an original illustration (no stock photo licensing needed).
              To swap in a real licensed product photo instead:
              1. Buy/download the license, save the file as public/hero.jpg
              2. Replace the line below with:
                 import Image from "next/image";
                 <Image src="/hero.jpg" alt="Products ready to ship" fill
                        className="rounded-2xl object-cover" priority />
                 (wrap it in a div with `relative aspect-square` instead of this one)
            */}
            <HeroGraphic />
          </div>
        </div>
      </section>

      <TrustStrip />

      {deals.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Today&apos;s deals</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} liked={liked.has(p.id)} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">New arrivals</h2>
        {newArrivals.length === 0 ? (
          <p className="mt-4 text-muted">
            No products yet — add some from the admin dashboard.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} liked={liked.has(p.id)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
