"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Catches any error thrown while rendering a page (a failed data fetch, a
 * thrown server action result, etc.) so the person sees a calm recovery
 * screen instead of a blank page or Next.js's default error overlay.
 *
 * This only covers errors below the root layout — see global-error.tsx for
 * errors in the layout itself (header/footer).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- surfaces the real error in dev/server logs
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-600">
        <AlertTriangle size={28} />
      </span>
      <h1 className="mt-5 font-display text-xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        {error.message && error.message.length < 160
          ? error.message
          : "An unexpected error occurred. Please try again."}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-onaccent transition hover:bg-accent/90"
        >
          <RotateCw size={14} />
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
