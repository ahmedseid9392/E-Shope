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
      <h1 className="font-display text-2xl font-bold text-ink">Admin dashboard</h1>
      <p className="mt-2 text-muted">Signed in as {profile.full_name ?? user!.email}.</p>

      <div className="mt-6 flex gap-4">
        <a href="/admin/products" className="rounded border border-line px-4 py-2 text-sm hover:border-ink">
          Manage products
        </a>
        <a href="/admin/orders" className="rounded border border-line px-4 py-2 text-sm hover:border-ink">
          Manage orders
        </a>
      </div>
    </main>
  );
}
