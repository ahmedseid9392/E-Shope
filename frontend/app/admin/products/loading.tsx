import { Skeleton } from "@/components/skeleton";
import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
        <Skeleton className="h-9 w-32 rounded" />
      </div>

      <TableSkeleton columns={5} />
    </main>
  );
}
