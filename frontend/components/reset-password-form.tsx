"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePassword } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent py-3 text-onaccent transition hover:bg-accent/90 disabled:opacity-50 sm:py-2"
    >
      {pending ? "Saving..." : "Save new password"}
    </button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
