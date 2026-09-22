"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-neutral-900 py-2 text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "Logging in..." : "Log in"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(signIn, undefined);

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>

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
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
