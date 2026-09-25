import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-48" />
      <Skeleton className="mt-2 h-3 w-40" />

      <Skeleton className="mt-6 h-2 w-full rounded" />

      <div className="mt-8 space-y-3 divide-y divide-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between pt-3 first:pt-0">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-20 w-full rounded" />
      </div>
    </main>
  );
}
