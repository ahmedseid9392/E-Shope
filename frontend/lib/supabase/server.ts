import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes the session from cookies. Still respects RLS — this is NOT the admin client.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore if you have
            // middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Admin client using the service role key — bypasses RLS entirely.
 * ONLY use inside trusted server code (e.g. the Chapa webhook handler).
 * Never import this into anything that runs in the browser.
 */
export function createAdminClient() {
  const { createClient: createSupabaseClient } = require("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
