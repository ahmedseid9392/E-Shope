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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm text-onaccent hover:bg-accent/90"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
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
          {(products ?? []).map((p) => {
            const active = isOnSale(p);
            const scheduled = !active && p.sale_price && p.sale_starts_at && new Date(p.sale_starts_at) > new Date();

            return (
              <tr key={p.id} className="border-b border-line">
                <td className="py-3">{p.name}</td>
                <td className="py-3">
                  {formatPrice(active ? p.sale_price : p.price)}
                  {active && (
                    <span className="ml-1 text-muted line-through">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="py-3 text-muted">
                  {active ? (
                    <span className="text-accent">Active</span>
                  ) : scheduled ? (
                    "Scheduled"
                  ) : p.sale_price ? (
                    "Expired"
                  ) : (
                    "—"
                  )}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
