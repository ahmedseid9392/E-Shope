import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { DeleteProductButton } from "@/components/delete-product-button";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-ink px-4 py-2 text-sm text-white hover:bg-ink/90"
        >
          Add product
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2">Name</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="py-3">{p.name}</td>
              <td className="py-3">
                {formatPrice(p.sale_price ?? p.price)}
                {p.sale_price && (
                  <span className="ml-1 text-muted line-through">
                    {formatPrice(p.price)}
                  </span>
                )}
              </td>
              <td className="py-3">{p.stock}</td>
              <td className="py-3">{p.is_active ? "Active" : "Inactive"}</td>
              <td className="py-3 text-right">
                {p.is_active && <DeleteProductButton id={p.id} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
