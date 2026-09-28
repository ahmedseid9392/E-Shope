import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            tone === "warning" ? "bg-red-500/10 text-red-600" : "bg-accent/15 text-accent"
          }`}
        >
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 truncate font-display text-xl font-bold text-ink sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
