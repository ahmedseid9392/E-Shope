/**
 * Minimal wrapper around Chapa's REST API (https://developer.chapa.co).
 * Deliberately plain `fetch` rather than an SDK — Chapa's API is small
 * enough that a dependency isn't worth it, and this keeps the secret key
 * handling in one obvious place.
 *
 * Import this ONLY from server actions / route handlers. CHAPA_SECRET_KEY
 * must never reach a client bundle.
 */

const CHAPA_BASE_URL = "https://api.chapa.co/v1";

function secretKey(): string {
  const key = process.env.CHAPA_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Payments aren't configured yet — CHAPA_SECRET_KEY is missing from the server environment."
    );
  }
  return key;
}

export type ChapaInitializeInput = {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  /** Local Ethiopian format (09xxxxxxxx / 07xxxxxxxx). Omit if unknown/invalid — optional unless Chapa flags the account as high-risk. */
  phoneNumber?: string;
  txRef: string;
  /** Where Chapa sends the browser after payment. */
  returnUrl: string;
  /** Where Chapa also sends a server-side GET with the result — works without any dashboard webhook setup. */
  callbackUrl: string;
  title: string;
  description: string;
};

/**
 * Calls `transaction/initialize` and returns the hosted checkout URL to
 * redirect the customer to.
 */
/**
 * Chapa rejects `tx_ref` over 50 chars with a 400 — fail fast with a clear
 * message here instead of letting that surface as an opaque "bad response"
 * from Chapa.
 */
function assertValidTxRef(txRef: string): void {
  if (txRef.length > 50) {
    throw new Error(
      `tx_ref "${txRef}" is ${txRef.length} chars — Chapa requires 50 or fewer.`
    );
  }
}

/**
 * Chapa's error payload shape varies: `message` can be a plain string, or
 * (for 422-style validation failures) an object of field -> array of
 * messages, e.g. { tx_ref: ["The tx ref must not exceed 50 characters."] }.
 * Flatten whichever shape shows up into one readable string so the real
 * reason reaches the caller instead of a generic fallback.
 */
function formatChapaError(data: unknown): string {
  const fallback = "Couldn't start the payment. Please try again.";
  if (!data || typeof data !== "object") return fallback;
  const message = (data as { message?: unknown }).message;

  if (typeof message === "string") return message;

  if (message && typeof message === "object") {
    const parts = Object.values(message as Record<string, unknown>)
      .flat()
      .filter((v): v is string => typeof v === "string");
    if (parts.length > 0) return parts.join(" ");
  }

  return fallback;
}

export async function initializeChapaTransaction(input: ChapaInitializeInput): Promise<string> {
  assertValidTxRef(input.txRef);

  let res: Response;
  try {
    res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amount.toFixed(2),
        currency: "ETB",
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName,
        ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}),
        tx_ref: input.txRef,
        return_url: input.returnUrl,
        callback_url: input.callbackUrl,
        customization: {
          // Chapa has historically rejected titles with spaces/over ~16
          // chars — keep it short and put the real detail in description.
          title: input.title.replace(/\s+/g, "").slice(0, 16),
          description: input.description.slice(0, 180),
        },
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("[chapa.initialize] network error", err);
    throw new Error("Couldn't reach the payment provider. Please try again.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || data.status !== "success" || !data.data?.checkout_url) {
    console.error("[chapa.initialize] bad response", res.status, data);
    throw new Error(formatChapaError(data));
  }

  return data.data.checkout_url as string;
}

export type ChapaVerifyResult = {
  /** "success" | "failed" | "pending" | other Chapa-defined states. */
  status: string;
  amount: number;
  currency: string;
  txRef: string;
  /** Chapa's own reference for the transaction, stored for support/lookup. */
  reference: string | null;
};

/**
 * Calls `transaction/verify/:tx_ref` — the only source of truth for whether
 * a payment actually succeeded. Never trust a webhook payload or a
 * return-URL query string without this.
 */
export async function verifyChapaTransaction(txRef: string): Promise<ChapaVerifyResult> {
  let res: Response;
  try {
    res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(txRef)}`, {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[chapa.verify] network error", err);
    throw new Error("Couldn't reach the payment provider to confirm this payment.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    console.error("[chapa.verify] bad response", res.status, data);
    throw new Error("Couldn't verify this payment with Chapa.");
  }

  return {
    status: data.data?.status ?? data.status ?? "failed",
    amount: Number(data.data?.amount ?? 0),
    currency: data.data?.currency ?? "ETB",
    txRef: data.data?.tx_ref ?? txRef,
    reference: data.data?.reference ?? null,
  };
}

/** Splits a single "full name" field into what Chapa's API wants. */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Customer", lastName: "Customer" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "Customer" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Normalizes a phone number to the 09xxxxxxxx / 07xxxxxxxx format Chapa
 * expects. Returns null (rather than guessing) for anything that doesn't
 * clearly map to a 9-digit Ethiopian subscriber number — the field is
 * optional, so it's safer to omit it than send something Chapa will reject.
 */
export function normalizeEthiopianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local: string | null = null;

  if (digits.length === 12 && digits.startsWith("251")) {
    local = digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith("0")) {
    local = digits.slice(1);
  } else if (digits.length === 9) {
    local = digits;
  }

  if (!local || !/^[79]\d{8}$/.test(local)) return null;
  return `0${local}`;
}
