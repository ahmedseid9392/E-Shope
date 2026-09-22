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
