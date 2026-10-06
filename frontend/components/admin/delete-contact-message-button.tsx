"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteContactMessage } from "@/lib/actions/contact";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

export function DeleteContactMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label="Delete message"
      title="Delete message"
      onClick={() => {
        if (!confirm("Delete this message?")) return;
        startTransition(async () => {
          try {
            await deleteContactMessage(id);
          } catch (err) {
            toast(getErrorMessage(err, "Couldn't delete this message."));
          }
        });
      }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={14} />
    </button>
  );
}
