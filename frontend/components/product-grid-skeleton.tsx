import { Skeleton } from "@/components/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/3" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
