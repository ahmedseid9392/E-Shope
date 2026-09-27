import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already blocks non-admins from reaching /admin, but we
  // re-check here too — never rely on middleware alone for authorization.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user?.id ?? "")
    .single();

  if (!profile?.is_admin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p>Not authorized.</p>
      </main>
    );
  }

  const name = profile.full_name ?? user!.email ?? "Admin";

  return (
    <div className="mx-auto flex max-w-7xl">
      <AdminSidebar name={name} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
