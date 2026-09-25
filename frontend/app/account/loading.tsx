import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your account</h1>
      <Skeleton className="mt-2 h-4 w-40" />

      <div className="mt-8 max-w-sm space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-9 w-full rounded" />
        <Skeleton className="h-9 w-full rounded" />
      </div>
    </main>
  );
}
