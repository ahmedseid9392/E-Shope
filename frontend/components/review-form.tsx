"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createReview, type ReviewActionState } from "@/lib/actions/reviews";
import { StarRatingInput } from "@/components/star-rating-input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-accent px-4 py-2 text-sm text-onaccent disabled:opacity-50"
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
        <div className="mt-1">
          <StarRatingInput />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Comment</label>
        <textarea
          name="comment"
          rows={3}
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
