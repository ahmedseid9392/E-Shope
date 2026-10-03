/**
 * Helpers for the admin login OTP / MFA-session gate. Deliberately built on
 * only `crypto.subtle` + `crypto.getRandomValues` (both globally available
 * in Node 18+ and in Next.js edge middleware, no import needed) — unlike
 * `createAdminClient()`, this file is safe to use from middleware.ts.
 */

export const ADMIN_MFA_COOKIE = "admin_mfa";
export const OTP_TTL_MINUTES = 10;
export const MFA_SESSION_TTL_HOURS = 12;
/** Minimum gap between OTP sends, so a "resend" button can't be hammered. */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Hex-encoded SHA-256 of `input`. Used so DB rows never hold a usable secret. */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 6-digit numeric OTP, zero-padded, from a proper CSPRNG (not Math.random). */
export function generateOtpCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

/** Random 32-byte, base64url token for the MFA session cookie. */
export function generateMfaToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
