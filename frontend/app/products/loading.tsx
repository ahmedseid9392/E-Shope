import { Skeleton } from "@/components/skeleton";
import { ProductGridSkeleton } from "@/components/product-grid-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Products</h1>

      <div className="mt-4 flex gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </main>
  );
}
