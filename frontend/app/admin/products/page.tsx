import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { isOnSale } from "@/lib/sale";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (products ?? []).map((p) => {
    const active = isOnSale(p);
    const scheduled =
      !active && p.sale_price && p.sale_starts_at && new Date(p.sale_starts_at) > new Date();
    const saleLabel = active ? "Active" : scheduled ? "Scheduled" : p.sale_price ? "Expired" : "—";
    return { p, active, saleLabel };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded bg-accent px-4 py-2.5 text-sm text-onaccent hover:bg-accent/90 sm:py-2"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {rows.length === 0 && <p className="mt-6 text-sm text-muted">No products yet.</p>}

      {/* Phones: one card per product */}
      <ul className="mt-6 space-y-3 md:hidden">
        {rows.map(({ p, active, saleLabel }) => (
          <li key={p.id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words font-medium text-ink">{p.name}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.is_active ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-line/50 text-muted"
                }`}
              >
                {p.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Price</dt>
                <dd className="text-ink">
                  {formatPrice(active ? p.sale_price : p.price)}
                  {active && (
                    <span className="block text-xs text-muted line-through">{formatPrice(p.price)}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Sale</dt>
                <dd className={active ? "text-accent" : "text-muted"}>{saleLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Stock</dt>
                <dd className="text-ink">{p.stock}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-end gap-5 border-t border-line pt-3 text-sm">
              <Link
                href={`/admin/products/${p.id}`}
                className="flex min-h-9 items-center gap-1 text-muted hover:text-ink"
                aria-label={`Edit ${p.name}`}
              >
                <Pencil size={14} />
                Edit
              </Link>
              {p.is_active && <DeleteProductButton id={p.id} />}
            </div>
          </li>
        ))}
      </ul>

      {/* Tablets & desktop: table */}
      {rows.length > 0 && (
        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2">Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Sale</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ p, active, saleLabel }) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-3 pr-3">{p.name}</td>
                  <td className="py-3">
                    {formatPrice(active ? p.sale_price : p.price)}
                    {active && (
                      <span className="ml-1 text-muted line-through">{formatPrice(p.price)}</span>
                    )}
                  </td>
                  <td className="py-3 text-muted">
                    {active ? <span className="text-accent">Active</span> : saleLabel}
                  </td>
                  <td className="py-3">{p.stock}</td>
                  <td className="py-3">{p.is_active ? "Active" : "Inactive"}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-1 text-muted hover:text-ink"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      {p.is_active && <DeleteProductButton id={p.id} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
