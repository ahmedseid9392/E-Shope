import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <SearchX size={28} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">
        The page you're looking for doesn't exist, or may have moved.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent transition hover:bg-accent/90"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
