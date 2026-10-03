"use client";

import { useFormState, useFormStatus } from "react-dom";
import { verifyAdminOtp, resendAdminOtp } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent py-3 text-onaccent transition hover:bg-accent/90 disabled:opacity-50 sm:py-2"
    >
      {pending ? "Verifying..." : "Verify"}
    </button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm underline text-muted hover:text-ink disabled:opacity-50"
    >
      {pending ? "Sending..." : "Resend code"}
    </button>
  );
}

export function VerifyOtpForm() {
  const [state, formAction] = useFormState(verifyAdminOtp, undefined);
  const [resendState, resendAction] = useFormState(resendAdminOtp, undefined);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium">
            6-digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            autoFocus
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-center text-lg tracking-[0.5em] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="000000"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <form action={resendAction} className="flex flex-col items-start gap-2">
        <ResendButton />
        {resendState?.message && <p className="text-sm text-muted">{resendState.message}</p>}
        {resendState?.error && <p className="text-sm text-red-600">{resendState.error}</p>}
      </form>
    </div>
  );
}
