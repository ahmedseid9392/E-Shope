"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * Hamburger button + dropdown panel for small screens. The links themselves
 * are passed in as children (rendered on the server by SiteHeader), so this
 * component only owns the open/closed state.
 *
 * The panel is positioned against the (relative) header, so it needs no
 * knowledge of the header's height.
 */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close after navigating to another page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes; lock background scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <>
          {/* Click-away backdrop — starts right under the header so the header
              itself (logo, toggle button) stays fully visible and clickable. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-x-0 top-full z-10 h-screen cursor-default bg-ink/30"
          />
          <div
            id="mobile-menu-panel"
            className="absolute inset-x-0 top-full z-20 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-bg shadow-lg"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-2 text-base font-medium text-ink">
              {children}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
