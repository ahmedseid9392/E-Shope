"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent py-3 text-onaccent transition hover:bg-accent/90 disabled:opacity-50 sm:py-2"
    >
      {pending ? "Sending..." : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, undefined);

  return (
    <main className="mx-auto w-full max-w-sm px-4 py-8 sm:py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
      <p className="mt-2 text-sm text-muted">
        Enter the email on your account and we&apos;ll send you a link to set a new password.
      </p>

      {state?.message ? (
        <p className="mt-6 rounded border border-line bg-surface px-3 py-3 text-sm text-ink">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
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

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <SubmitButton />
        </form>
      )}

      <p className="mt-4 text-sm text-muted">
        <Link href="/login" className="underline">
          Back to login
        </Link>
      </p>
    </main>
  );
}
