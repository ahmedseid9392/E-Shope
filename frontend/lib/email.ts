/**
 * Thin wrapper around Gmail SMTP (via nodemailer) — same style as before
 * (lib/chapa.ts), just swapped from Resend's HTTP API to SMTP.
 *
 * Email is a side effect of the real action (signup, payment, status
 * update), never the main event: sendEmail() never throws. It logs and
 * returns `{ ok: false }` on any failure, and callers for whom a failed
 * send genuinely blocks the user (admin OTP) check `ok` and surface a
 * message themselves; every other caller fires-and-forgets.
 *
 * Setup: Gmail requires an "App Password", not your normal login password,
 * once 2-Step Verification is on (which it must be, to generate one).
 *   1. Enable 2-Step Verification: https://myaccount.google.com/security
 *   2. Create an App Password: https://myaccount.google.com/apppasswords
 *      (choose "Mail" as the app) — Google gives you a 16-character code.
 *   3. Set GMAIL_USER to the full @gmail.com address and GMAIL_APP_PASSWORD
 *      to that 16-character code (spaces don't matter, both work).
 *
 * Gmail SMTP tops out around 500 messages/day on a normal account — fine
 * for an MVP, but swap providers before that becomes a real bottleneck.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function fromAddress(): string {
  return process.env.EMAIL_FROM || process.env.GMAIL_USER || "E-Shope";
}

// Reused across calls (and, on a long-lived server, across requests) rather
// than reconnecting to Gmail's SMTP server on every send.
let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.error(
      `[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — "${input.subject}" to ${input.to} not sent`
    );
    return { ok: false };
  }

  try {
    await transporter.sendMail({
      from: fromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return { ok: true };
  } catch (err) {
    console.error(`[email] send failed for "${input.subject}" to ${input.to}`, err);
    return { ok: false };
  }
}
