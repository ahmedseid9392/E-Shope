"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string };

export function ProductFilters({
  categories,
  recentSearches,
}: {
  categories: Category[];
  recentSearches: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync if the URL changes from elsewhere (e.g. a recent-search click).
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounced so an empty box (backspacing to nothing) still fires and
    // immediately shows every product again — not just non-empty queries.
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value.trim() || undefined });
    }, 300);
  }

  function selectRecentSearch(term: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(term);
    updateParams({ q: term });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search products..."
          className="min-w-[200px] flex-1 rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value || undefined })}
          className="rounded border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          defaultValue={searchParams.get("sort") ?? "newest"}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {!query && recentSearches.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Recent:</span>
          {recentSearches.map((term) => (
            <button
              key={term}
              onClick={() => selectRecentSearch(term)}
              className="underline hover:text-ink"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
