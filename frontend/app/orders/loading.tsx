import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Your orders</h1>

      <div className="mt-6 divide-y divide-line">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}
