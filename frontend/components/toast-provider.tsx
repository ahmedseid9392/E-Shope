"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type Toast = { id: number; message: string; variant: "error" | "success" };
type ShowToast = (message: string, variant?: Toast["variant"]) => void;

const ToastContext = createContext<ShowToast | null>(null);

/**
 * Global toast host, mounted once in the root layout. Any client component
 * can call `useToast()` to surface a server action failure (or success) to
 * the person, instead of the error silently vanishing or crashing the
 * nearest error boundary for something as minor as "couldn't update quantity".
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message, variant = "error") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={show}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.variant === "error"
                ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950 dark:text-red-200"
                : "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-950 dark:text-green-200"
            }`}
          >
            {t.variant === "error" ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="min-w-0 flex-1 break-words">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-70 transition hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns a `show(message, variant?)` function. Falls back to a no-op with
 *  a console warning if used outside the provider, so a missing provider
 *  never crashes the app — it just silently drops the toast in dev. */
export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return (message: string) => {
      // eslint-disable-next-line no-console -- dev-time misuse warning only
      console.warn("useToast() called outside <ToastProvider>:", message);
    };
  }
  return ctx;
}
