import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-lg" />

        <div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="mt-3 h-6 w-24" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-6 h-10 w-40 rounded" />
        </div>
      </div>
    </main>
  );
}
