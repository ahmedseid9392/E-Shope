"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { assertNoDbError } from "@/lib/errors";
import { sendEmail } from "@/lib/email";
import { welcomeEmail, adminOtpEmail } from "@/lib/email-templates";
import {
  ADMIN_MFA_COOKIE,
  OTP_TTL_MINUTES,
  MFA_SESSION_TTL_HOURS,
  OTP_RESEND_COOLDOWN_SECONDS,
  sha256Hex,
  generateOtpCode,
  generateMfaToken,
} from "@/lib/mfa";

export type AuthActionState = { error?: string } | undefined;
export type AuthMessageState = { error?: string; message?: string } | undefined;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

/**
 * Generates + emails a fresh admin OTP for `userId`/`email`. Shared by the
 * post-password-check step in signIn() and the "resend code" action.
 * Returns false (and leaves no new row) if the email couldn't be sent, so
 * the caller can tell the person rather than sending them to a code-entry
 * screen for a code that never arrived.
 */
async function issueAdminOtp(userId: string, email: string): Promise<boolean> {
  const code = generateOtpCode();
  const { ok } = await sendEmail({ to: email, ...adminOtpEmail(code) });
  if (!ok) return false;

  const supabase = createClient();
  const codeHash = await sha256Hex(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabase
    .from("admin_login_otps")
    .insert({ user_id: userId, code_hash: codeHash, expires_at: expiresAt });
  assertNoDbError(error, "issueAdminOtp");

  return true;
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // profiles row is created automatically by the on_auth_user_created DB trigger
  // (see backend/supabase/migrations/0002_handle_new_user.sql)

  // Best-effort: a flaky email provider must never block account creation.
  // sendEmail() never throws — see lib/email.ts.
  await sendEmail({ to: email, ...welcomeEmail(fullName) });

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    assertNoDbError(profileError, "signIn.profile");

    if (profile?.is_admin) {
      // Password is correct, but admin accounts need a second factor before
      // /admin becomes reachable — see lib/supabase/middleware.ts. The base
      // session above still stands (they can browse as a normal customer),
      // it's only /admin that's gated behind the OTP check from here.
      const sent = await issueAdminOtp(user.id, email);
      if (!sent) {
        return { error: "Couldn't send your login code. Please try again." };
      }
      revalidatePath("/", "layout");
      redirect("/verify-otp");
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Verifies the code sent by issueAdminOtp() and, on success, mints a
 * short-lived MFA session (cookie + matching DB row) that middleware checks
 * on every /admin/** request from here on.
 */
export async function verifyAdminOtp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const codeHash = await sha256Hex(code);

  const { data: otp, error } = await supabase
    .from("admin_login_otps")
    .select("id, expires_at, consumed_at")
    .eq("user_id", user.id)
    .eq("code_hash", codeHash)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  assertNoDbError(error, "verifyAdminOtp.lookup");

  if (!otp || new Date(otp.expires_at) < new Date()) {
    return { error: "That code is invalid or has expired. Request a new one." };
  }

  const { error: consumeError } = await supabase
    .from("admin_login_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otp.id);
  assertNoDbError(consumeError, "verifyAdminOtp.consume");

  const token = generateMfaToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + MFA_SESSION_TTL_HOURS * 3_600_000);

  const { error: sessionError } = await supabase
    .from("admin_mfa_sessions")
    .insert({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt.toISOString() });
  assertNoDbError(sessionError, "verifyAdminOtp.session");

  cookies().set(ADMIN_MFA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  revalidatePath("/", "layout");
  redirect("/admin");
}

/**
 * Resends a fresh OTP for the currently-signed-in admin, with a basic
 * cooldown so the "resend" button can't be used to spam someone's inbox.
 */
export async function resendAdminOtp(
  _prevState: AuthMessageState,
  _formData: FormData
): Promise<AuthMessageState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: last, error } = await supabase
    .from("admin_login_otps")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  assertNoDbError(error, "resendAdminOtp.lookup");

  if (last) {
    const secondsSinceLast = (Date.now() - new Date(last.created_at).getTime()) / 1000;
    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        error: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another code.`,
      };
    }
  }

  const sent = await issueAdminOtp(user.id, user.email ?? "");
  if (!sent) return { error: "Couldn't send your login code. Please try again." };
  return { message: "A new code is on its way." };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Sends a password-reset link via Supabase Auth's own email delivery (not
 * Resend — Supabase has to be the one generating the recovery token, so it
 * has to send the email that carries it). To brand this with Resend
 * instead, configure custom SMTP in the Supabase dashboard (Authentication
 * → Settings → SMTP Settings) pointed at Resend's SMTP credentials — that's
 * a dashboard setting, not something this code can do.
 *
 * Always returns the same message whether or not the email has an account
 * — confirming/denying an email's existence here would let someone enumerate
 * registered customers.
 */
export async function requestPasswordReset(
  _prevState: AuthMessageState,
  formData: FormData
): Promise<AuthMessageState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/callback?redirectTo=${encodeURIComponent("/reset-password")}`,
  });

  return { message: "If an account exists for that email, a reset link is on its way." };
}

/**
 * Sets a new password. Only works with the temporary "recovery" session
 * Supabase establishes after /auth/callback exchanges the code from the
 * reset-password link — app/reset-password/page.tsx checks for that
 * session before rendering this form.
 */
export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

export async function signInWithGoogle(formData: FormData) {
  const redirectPath = String(formData.get("redirectPath") ?? "/");
  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?redirectTo=${encodeURIComponent(redirectPath)}`,
    },
  });

  assertNoDbError(error, "signInWithGoogle");
  if (data.url) redirect(data.url);
}
