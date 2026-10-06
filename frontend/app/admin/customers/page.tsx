import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { getAllCustomersForAdmin } from "@/lib/actions/customers";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { ToggleAdminButton } from "@/components/admin/toggle-admin-button";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { highlight?: string };
}) {
  const [customers, { data: auth }] = await Promise.all([
    getAllCustomersForAdmin(),
    createClient().auth.getUser(),
  ]);
  const currentUserId = auth.user?.id;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Customers</h1>
      <p className="mt-1 text-sm text-muted">
        {customers.length} account{customers.length === 1 ? "" : "s"}
      </p>

      {customers.length === 0 && <p className="mt-6 text-sm text-muted">No customers yet.</p>}

      {/* Phones: one card per customer */}
      <ul className="mt-6 space-y-3 md:hidden">
        {customers.map((c) => (
          <li
            key={c.id}
            id={c.id === searchParams.highlight ? "highlighted" : undefined}
            className={`rounded-xl border p-4 ${
              c.id === searchParams.highlight ? "border-accent" : "border-line"
            } bg-surface`}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-bg">
                {c.avatar_url ? (
                  <Image src={c.avatar_url} alt="" fill sizes="40px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted">
                    <User size={16} />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{c.full_name ?? "Unnamed"}</p>
                <p className="truncate text-xs text-muted">{c.email ?? "—"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted">
                {c.order_count} order{c.order_count === 1 ? "" : "s"} · {formatPrice(c.total_spent)}
              </span>
              <ToggleAdminButton userId={c.id} isAdmin={c.is_admin} isSelf={c.id === currentUserId} />
            </div>
            <Link
              href={`/admin/orders?customer=${c.id}`}
              className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
            >
              View orders →
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      {customers.length > 0 && (
        <div className="mt-6 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-2">Customer</th>
                <th className="py-2">Joined</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Total spent</th>
                <th className="py-2">Access</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  className={`border-b border-line ${
                    c.id === searchParams.highlight ? "bg-accent/5" : ""
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-bg">
                        {c.avatar_url ? (
                          <Image src={c.avatar_url} alt="" fill sizes="32px" className="object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted">
                            <User size={13} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{c.full_name ?? "Unnamed"}</p>
                        <p className="truncate text-xs text-muted">{c.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-muted">{formatRelativeTime(c.created_at)}</td>
                  <td className="py-3">
                    <Link
                      href={`/admin/orders?customer=${c.id}`}
                      className="text-accent hover:underline"
                    >
                      {c.order_count}
                    </Link>
                  </td>
                  <td className="py-3">{formatPrice(c.total_spent)}</td>
                  <td className="py-3">
                    <ToggleAdminButton userId={c.id} isAdmin={c.is_admin} isSelf={c.id === currentUserId} />
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
