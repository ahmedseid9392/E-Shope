"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "@/lib/actions/auth";
import { GoogleSignInButton } from "@/components/google-signin-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent py-3 text-onaccent transition hover:bg-accent/90 disabled:opacity-50 sm:py-2"
    >
      {pending ? "Logging in..." : "Log in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, undefined);
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";

  return (
    <main className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Welcome back</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink">Log in</h1>
        </div>

        {justReset && (
          <p className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Your password has been updated. Log in with your new password.
          </p>
        )}

        <GoogleSignInButton />

        <div className="mt-5 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-line" />
          or continue with email
          <div className="h-px flex-1 bg-line" />
        </div>

        <form action={formAction} className="mt-5 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-muted underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="font-medium text-ink underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
