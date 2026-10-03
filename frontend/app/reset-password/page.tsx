import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/reset-password-form";

// Only reachable with the temporary session /auth/callback establishes
// after exchanging the code from a password-reset email — anyone landing
// here without one is sent to request a fresh link instead.
export default async function ResetPasswordPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/forgot-password");

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Set a new password</h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>

      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </main>
  );
}
