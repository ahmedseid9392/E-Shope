import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Admin dashboard</h1>
      <Skeleton className="mt-2 h-4 w-48" />

      <div className="mt-6 flex gap-4">
        <Skeleton className="h-9 w-36 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
      </div>
    </main>
  );
}
