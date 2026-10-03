import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifyOtpForm } from "@/components/verify-otp-form";

// Reached right after signIn() detects an admin account and emails a code.
// Deliberately NOT under /admin/** — nesting it there would mean inheriting
// app/admin/layout.tsx's full dashboard sidebar before OTP verification
// has even happened. Middleware doesn't gate this path at all; the guards
// below (must be signed in, must be an admin) are enough on their own.
export default async function VerifyOtpPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/");

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Check your email</h1>
      <p className="mt-2 text-sm text-muted">
        We sent a 6-digit code to {user.email}. Enter it below to finish logging in.
      </p>

      <div className="mt-6">
        <VerifyOtpForm />
      </div>
    </main>
  );
}
