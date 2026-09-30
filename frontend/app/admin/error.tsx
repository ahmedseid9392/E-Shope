"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

/** Admin pages have their own sidebar shell (app/admin/layout.tsx) that
 *  should stay visible even if a specific admin page's data fails to load,
 *  so this scopes error recovery to just the content area. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- surfaces the real error in dev/server logs
    console.error("[app/admin/error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600">
        <AlertTriangle size={22} />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">Couldn&apos;t load this page</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        {error.message && error.message.length < 160
          ? error.message
          : "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-onaccent transition hover:bg-accent/90"
      >
        <RotateCw size={14} />
        Try again
      </button>
    </div>
  );
}
