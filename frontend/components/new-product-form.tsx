"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProduct } from "@/lib/actions/products";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      {pending ? "Saving..." : "Create product"}
    </button>
  );
}

export function NewProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createProduct, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          required
          placeholder="e.g. sample-t-shirt"
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Price (ETB)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sale price (optional)</label>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            required
            className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category_id"
            className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked />
        Active (visible on storefront)
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
