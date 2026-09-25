import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Add product</h1>

      <div className="mt-6 max-w-lg space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded" />
        ))}
        <Skeleton className="h-32 w-full rounded" />
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </main>
  );
}
