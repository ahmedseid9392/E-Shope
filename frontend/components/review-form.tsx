"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createReview, type ReviewActionState } from "@/lib/actions/reviews";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      {pending ? "Submitting..." : "Submit review"}
    </button>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const action = createReview.bind(null, productId);
  const [state, formAction] = useFormState<ReviewActionState, FormData>(action, undefined);

  if (state?.success) {
    return <p className="text-sm text-green-700">Thanks for your review!</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Rating</label>
        <select name="rating" required className="mt-1 rounded border border-line px-3 py-2 text-sm">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Comment</label>
        <textarea
          name="comment"
          rows={3}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
