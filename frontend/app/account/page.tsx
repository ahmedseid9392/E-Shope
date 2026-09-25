import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "@/components/account-form";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your account</h1>
      <p className="mt-2 text-sm text-muted">
        Signed in via {user!.app_metadata.provider === "google" ? "Google" : "email"}.
      </p>

      <AccountForm
        fullName={profile?.full_name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
        email={user!.email ?? ""}
      />
    </main>
  );
}
