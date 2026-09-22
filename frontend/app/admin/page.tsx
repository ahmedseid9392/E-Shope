import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  // Middleware already blocks non-admins from reaching this route, but we
  // re-check here too — never rely on middleware alone for authorization.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user!.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p>Not authorized.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-2 text-neutral-600">
        Signed in as {profile.full_name ?? user!.email}. Product/order management and stats
        land here in Phase 4 &amp; 7 — see IMPLEMENTATION_PLAN.md.
      </p>
    </main>
  );
}
