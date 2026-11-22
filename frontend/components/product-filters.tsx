"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSearchSuggestions } from "@/lib/actions/search";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
    setShowSuggestions(Boolean(value.trim()));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Debounced so an empty box (backspacing to nothing) still fires and
    // immediately shows every product again — not just non-empty queries.
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value.trim() || undefined });
      if (value.trim()) {
        getSearchSuggestions(value.trim()).then(setSuggestions);
      } else {
        setSuggestions([]);
      }
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
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <div className="relative col-span-2 sm:min-w-[200px] sm:flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(Boolean(query.trim()))}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search products or categories..."
            className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:py-2"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setShowSuggestions(false);
                    selectRecentSearch(suggestion);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-bg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value || undefined })}
          className="min-w-0 rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:py-2"
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
          className="min-w-0 rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:py-2"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
        <input
          type="number"
          min="0"
          aria-label="Minimum price"
          defaultValue={searchParams.get("minPrice") ?? ""}
          onBlur={(event) => updateParams({ minPrice: event.target.value || undefined })}
          placeholder="Min price"
          className="min-w-0 rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted sm:py-2"
        />
        <input
          type="number"
          min="0"
          aria-label="Maximum price"
          defaultValue={searchParams.get("maxPrice") ?? ""}
          onBlur={(event) => updateParams({ maxPrice: event.target.value || undefined })}
          placeholder="Max price"
          className="min-w-0 rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted sm:py-2"
        />
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            defaultChecked={searchParams.get("availability") === "in_stock"}
            onChange={(event) =>
              updateParams({ availability: event.target.checked ? "in_stock" : undefined })
            }
          />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            defaultChecked={searchParams.get("sale") === "only"}
            onChange={(event) =>
              updateParams({ sale: event.target.checked ? "only" : undefined })
            }
          />
          On sale
        </label>
      </div>

      {!query && recentSearches.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Recent:</span>
          {recentSearches.map((term) => (
            <button
              key={term}
              onClick={() => selectRecentSearch(term)}
              className="rounded-full border border-line px-3 py-1 hover:border-ink hover:text-ink"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
