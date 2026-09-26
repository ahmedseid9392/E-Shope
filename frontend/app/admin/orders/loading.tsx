import { TableSkeleton } from "@/components/table-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>

      <TableSkeleton columns={5} />
    </main>
  );
}
