"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signUp } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-neutral-900 py-2 text-white transition hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "Creating account..." : "Sign up"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, undefined);

  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign up</h1>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

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
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>

      <p className="mt-4 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
