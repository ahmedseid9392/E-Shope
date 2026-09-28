"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProduct } from "@/lib/actions/products";
import { ImageUploader } from "@/components/image-uploader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent px-4 py-3 text-sm text-onaccent disabled:opacity-50 sm:w-auto sm:py-2"
    >
      {pending ? "Saving..." : "Create product"}
    </button>
  );
}

export function NewProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction] = useFormState(createProduct, undefined);
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={formAction} className="mt-6 w-full max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium">Product image</label>
        <div className="mt-1">
          <ImageUploader folder="products" onUploaded={setImageUrl} />
        </div>
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          required
          placeholder="e.g. sample-t-shirt"
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Price (ETB)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sale price (optional)</label>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Sale starts (optional)</label>
          <input
            name="sale_starts_at"
            type="datetime-local"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sale ends (optional)</label>
          <input
            name="sale_ends_at"
            type="datetime-local"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted">
        Leave both blank for a sale that starts now and never ends. Times are in your browser&apos;s local timezone.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category_id"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Colors (optional)</label>
          <input
            name="colors"
            placeholder="e.g. Black, White, Navy"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-1 text-xs text-muted">Comma-separated. Shown as choices on the product page.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Sizes (optional)</label>
          <input
            name="sizes"
            placeholder="e.g. S, M, L, XL"
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <p className="mt-1 text-xs text-muted">Comma-separated.</p>
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
