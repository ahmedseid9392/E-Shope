import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type LowStockProduct = { id: string; name: string; stock: number };

export function LowStockList({ products }: { products: LowStockProduct[] }) {
  if (products.length === 0) {
    return <p className="text-sm text-muted">All products are well stocked.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {products.map((p) => (
        <li key={p.id}>
          <Link
            href={`/admin/products/${p.id}`}
            className="flex items-center justify-between gap-3 py-3 text-sm transition hover:text-accent"
          >
            <span className="flex items-center gap-2 truncate text-ink">
              <AlertTriangle size={14} className="shrink-0 text-red-500" />
              <span className="truncate">{p.name}</span>
            </span>
            <span className="shrink-0 text-xs font-medium text-red-600">
              {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
