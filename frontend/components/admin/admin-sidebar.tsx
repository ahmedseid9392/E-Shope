"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, Menu, X, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-accent text-onaccent"
                : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar with menu toggle */}
      <div className="flex items-center justify-between border-b border-line px-4 py-2 md:hidden">
        <span className="min-w-0 truncate font-display text-sm font-bold text-ink">Admin · {name}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line text-ink"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto bg-bg p-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-ink">Admin</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close admin menu"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-ink"
            >
              <ArrowLeft size={16} />
              Back to store
            </Link>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r border-line px-4 py-6 md:flex">
        <div>
          <p className="font-display text-lg font-bold text-ink">Admin</p>
          <p className="truncate text-xs text-muted">{name}</p>
        </div>
        <SidebarLinks pathname={pathname} />
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>
      </aside>
    </>
  );
}
