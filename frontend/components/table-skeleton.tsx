import { Skeleton } from "@/components/skeleton";

export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <table className="mt-6 w-full text-sm">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r} className="border-b border-line">
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className="py-3">
                <Skeleton className="h-4 w-full max-w-[10rem]" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
