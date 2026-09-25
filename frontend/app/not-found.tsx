import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="font-display text-5xl font-extrabold text-ink">404</span>
      <h1 className="mt-4 font-display text-xl font-bold text-ink">
        We couldn't find that page
      </h1>
      <p className="mt-2 text-muted">
        It may have been moved, sold out, or never existed. Try browsing our
        products instead.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded border border-line px-4 py-2 text-sm hover:border-ink"
        >
          Go home
        </Link>
        <Link
          href="/products"
          className="rounded bg-accent px-4 py-2 text-sm text-onaccent hover:bg-accent/90"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
