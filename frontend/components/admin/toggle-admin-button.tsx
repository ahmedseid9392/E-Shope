"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { setCustomerAdminStatus } from "@/lib/actions/customers";
import { useToast } from "@/components/toast-provider";
import { getErrorMessage } from "@/lib/errors";

export function ToggleAdminButton({
  userId,
  isAdmin,
  isSelf = false,
}: {
  userId: string;
  isAdmin: boolean;
  isSelf?: boolean;
}) {
  const [admin, setAdmin] = useState(isAdmin);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  if (isSelf) {
    return <span className="text-xs text-muted">That&apos;s you</span>;
  }

  function handleClick() {
    const next = !admin;
    const label = next ? "Make admin" : "Remove admin";
    if (!confirm(`${label} for this user?`)) return;

    setAdmin(next); // optimistic
    startTransition(async () => {
      const result = await setCustomerAdminStatus(userId, next);
      if (result.error) {
        setAdmin(!next);
        toast(getErrorMessage(new Error(result.error)));
      } else {
        toast(next ? "Granted admin access." : "Removed admin access.", "success");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
        admin
          ? "bg-accent/15 text-accent hover:bg-red-500/15 hover:text-red-600"
          : "border border-line text-muted hover:border-ink/30 hover:text-ink"
      }`}
    >
      {admin ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
      {admin ? "Admin" : "Make admin"}
    </button>
  );
}
