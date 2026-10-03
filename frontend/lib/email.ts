/**
 * Thin wrapper around Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * Plain `fetch`, same style as lib/chapa.ts — no SDK dependency to install.
 *
 * Email is a side effect of the real action (signup, payment, status
 * update), never the main event: sendEmail() never throws. It logs and
 * returns `{ ok: false }` on any failure, and callers for whom a failed
 * send genuinely blocks the user (admin OTP) check `ok` and surface a
 * message themselves; every other caller fires-and-forgets.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

function fromAddress(): string {
  return process.env.EMAIL_FROM || "E-Shope <onboarding@resend.dev>";
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(`[email] RESEND_API_KEY is not set — "${input.subject}" to ${input.to} not sent`);
    return { ok: false };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] send failed (${res.status}) for "${input.subject}" to ${input.to}`, body);
      return { ok: false };
    }

    return { ok: true };
  } catch (err) {
    console.error(`[email] send threw for "${input.subject}" to ${input.to}`, err);
    return { ok: false };
  }
}
