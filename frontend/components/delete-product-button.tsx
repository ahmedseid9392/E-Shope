"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/lib/actions/products";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Deactivate this product? It will be hidden from the storefront.")) {
          startTransition(() => deleteProduct(id));
        }
      }}
      className="text-sm text-muted hover:text-red-600 disabled:opacity-50"
    >
      {isPending ? "Removing..." : "Deactivate"}
    </button>
  );
}
