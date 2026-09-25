"use client";

import { useFormState, useFormStatus } from "react-dom";
import { checkout } from "@/lib/actions/checkout";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent py-2 text-onaccent disabled:opacity-50"
    >
      {pending ? "Placing order..." : "Place order"}
    </button>
  );
}

export default function CheckoutPage() {
  const [state, formAction] = useFormState(checkout, undefined);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Payment via Chapa gets wired in at Phase 8 — for now, placing an order creates it as{" "}
        <code className="rounded bg-bg px-1 py-0.5">pending</code> so you can test the
        rest of the order flow.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            name="full_name"
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            name="phone"
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            name="address_line"
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">City</label>
          <input
            name="city"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <SubmitButton />
      </form>
    </main>
  );
}
