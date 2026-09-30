"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    if (!confirm("Deactivate this product? It will be hidden from the storefront.")) return;
    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast("Product deactivated.", "success");
      } catch (err) {
        toast(getErrorMessage(err, "Couldn't deactivate this product."));
      }
    });
  }

  return (
    <button
      disabled={isPending}
      onClick={handleClick}
      className="flex items-center gap-1 text-muted hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={14} />
      {isPending ? "Removing..." : "Deactivate"}
    </button>
  );
}
