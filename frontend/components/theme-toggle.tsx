"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  // Start unmounted-safe: the inline script in layout.tsx already set the
  // correct class on <html> before hydration, so read it back rather than
  // guessing (avoids a light/dark mismatch flash).
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    // The header renders one toggle for desktop and one for mobile; watching
    // the <html> class keeps both icons correct whichever one was clicked.
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  if (isDark === null) {
    // Render a fixed-size placeholder so the header doesn't shift on mount.
    return <div className="h-10 w-10 md:h-8 md:w-8" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink md:h-8 md:w-8"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="8" r="3.5" fill="currentColor" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 9.3A6 6 0 1 1 6.7 2a4.7 4.7 0 0 0 7.3 7.3Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
