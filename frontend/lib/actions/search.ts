"use server";

import { createClient } from "@/lib/supabase/server";

export async function logSearch(query: string) {
  if (!query.trim()) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // guests: not persisted for MVP (see docs/database.md)

  await supabase.from("search_history").insert({ user_id: user.id, query: query.trim() });
}

export async function getRecentSearches(limit = 8) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("search_history")
    .select("query, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // de-dupe consecutive-ish repeats client-doesn't-need-to-see
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.query)) {
      seen.add(row.query);
      unique.push(row.query);
    }
  }
  return unique;
}

export async function getSearchSuggestions(query: string, limit = 6) {
  const term = query.trim();
  if (!term) return [];

  const supabase = createClient();
  const [productsResult, categoriesResult, historyResult] = await Promise.all([
    supabase
      .from("products")
      .select("name")
      .eq("is_active", true)
      .ilike("name", `%${term}%`)
      .limit(limit),
    supabase
      .from("categories")
      .select("name")
      .ilike("name", `%${term}%`)
      .limit(limit),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return { data: [] };
      return supabase
        .from("search_history")
        .select("query")
        .eq("user_id", user.id)
        .ilike("query", `%${term}%`)
        .order("created_at", { ascending: false })
        .limit(limit);
    }),
  ]);

  const suggestions = [
    ...(historyResult.data ?? []).map((row) => row.query),
    ...(productsResult.data ?? []).map((row) => row.name),
    ...(categoriesResult.data ?? []).map((row) => row.name),
  ];

  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = suggestion.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}
