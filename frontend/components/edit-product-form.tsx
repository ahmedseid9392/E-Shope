"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProduct, type ProductActionState } from "@/lib/actions/products";
import { ImageUploader } from "@/components/image-uploader";

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  // datetime-local wants "YYYY-MM-DDTHH:mm" in local time, with no seconds/timezone.
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-accent px-4 py-2 text-sm text-onaccent disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  stock: number;
  category_id: string | null;
  image_urls: string[] | null;
  is_active: boolean;
};

export function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: { id: string; name: string }[];
}) {
  const action = updateProduct.bind(null, product.id);
  const [state, formAction] = useFormState<ProductActionState, FormData>(action, undefined);
  const [imageUrl, setImageUrl] = useState(product.image_urls?.[0] ?? "");

  return (
    <form action={formAction} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium">Product image</label>
        <div className="mt-1">
          <ImageUploader folder="products" initialUrl={imageUrl} onUploaded={setImageUrl} />
        </div>
        <input type="hidden" name="image_url" value={imageUrl} />
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          defaultValue={product.name}
          required
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          defaultValue={product.slug}
          required
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={3}
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Price (ETB)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={product.price}
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
            defaultValue={product.sale_price ?? ""}
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Sale starts (optional)</label>
          <input
            name="sale_starts_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(product.sale_starts_at)}
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Sale ends (optional)</label>
          <input
            name="sale_ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(product.sale_ends_at)}
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted">
        Leave both blank for a sale that starts now and never ends.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Stock</label>
          <input
            name="stock"
            type="number"
            defaultValue={product.stock}
            required
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            name="category_id"
            defaultValue={product.category_id ?? ""}
            className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
        <input type="checkbox" name="is_active" defaultChecked={product.is_active} />
        Active (visible on storefront)
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}

      <SubmitButton />
    </form>
  );
}
