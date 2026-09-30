"use client";

import { useEffect } from "react";

/**
 * Only fires if the ROOT LAYOUT itself throws (header/footer data fetch,
 * font loading, etc.) — app/error.tsx handles everything else. Next.js
 * requires this file to render its own <html>/<body> since the layout that
 * would normally provide them is what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console -- surfaces the real error in dev/server logs
    console.error("[app/global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
          backgroundColor: "#faf9f6",
          color: "#1b1f3b",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#6b6f76", margin: 0, maxWidth: "24rem" }}>
          The page couldn&apos;t load. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: "0.5rem",
            borderRadius: "999px",
            padding: "0.6rem 1.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            backgroundColor: "#e1a730",
            color: "#1b1f3b",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
