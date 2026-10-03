/**
 * Plain inline-styled HTML templates — email clients strip <style> blocks
 * and external stylesheets unpredictably, so every rule lives on the tag.
 * Colors match the site's light-mode tokens in app/globals.css.
 */

import { OTP_TTL_MINUTES } from "@/lib/mfa";

const INK = "#1B1F3B";
const MUTED = "#6B7280";
const ACCENT = "#E1A730";
const BG = "#FAF9F6";
const LINE = "#E5E1D8";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid ${LINE};">
                <span style="font-size:18px;font-weight:700;color:${INK};">E-Shope</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid ${LINE};">
                <span style="font-size:12px;color:${MUTED};">${title} · E-Shope</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 20px;background:${ACCENT};color:${INK};text-decoration:none;font-weight:600;border-radius:8px;font-size:14px;">${label}</a>`;
}

export function welcomeEmail(fullName: string): { subject: string; html: string } {
  const name = fullName?.trim() || "there";
  return {
    subject: "Welcome to E-Shope",
    html: layout(
      "Welcome",
      `<h1 style="margin:0 0 12px;font-size:20px;">Welcome, ${name} 👋</h1>
       <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:${MUTED};">
         Your account is ready. Browse new arrivals, save items you like, and check out whenever you're ready — we'll keep you posted on your orders by email.
       </p>
       ${button(`${siteUrl()}/products`, "Start shopping")}`
    ),
  };
}

export function adminOtpEmail(code: string): { subject: string; html: string } {
  return {
    subject: `${code} is your E-Shope admin login code`,
    html: layout(
      "Admin login verification",
      `<h1 style="margin:0 0 12px;font-size:20px;">Your admin login code</h1>
       <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED};">
         Enter this code to finish logging in. It expires in ${OTP_TTL_MINUTES} minutes.
       </p>
       <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:${INK};background:${BG};border:1px solid ${LINE};border-radius:8px;padding:16px;text-align:center;">
         ${code}
       </div>
       <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:${MUTED};">
         Didn't try to log in? Someone may have your password — consider changing it.
       </p>`
    ),
  };
}

type OrderEmailItem = { name: string; quantity: number; price: number };

function moneyRows(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:6px 0;font-size:13px;color:${INK};">${item.name} × ${item.quantity}</td>
        <td style="padding:6px 0;font-size:13px;color:${INK};text-align:right;">ETB ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");
}

export function orderConfirmationEmail(input: {
  orderId: string;
  items: OrderEmailItem[];
  total: number;
}): { subject: string; html: string } {
  const shortId = input.orderId.slice(0, 8).toUpperCase();
  return {
    subject: `Order ${shortId} confirmed`,
    html: layout(
      "Order confirmation",
      `<h1 style="margin:0 0 12px;font-size:20px;">Payment received ✅</h1>
       <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED};">
         Thanks for your order — we've received your payment and we're getting it ready.
       </p>
       <table role="presentation" width="100%" style="border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};padding:8px 0;">
         ${moneyRows(input.items)}
         <tr>
           <td style="padding-top:10px;font-size:14px;font-weight:700;color:${INK};">Total</td>
           <td style="padding-top:10px;font-size:14px;font-weight:700;color:${INK};text-align:right;">ETB ${input.total.toFixed(2)}</td>
         </tr>
       </table>
       ${button(`${siteUrl()}/orders/${input.orderId}`, "View order")}`
    ),
  };
}

const STATUS_COPY: Record<string, { headline: string; body: string }> = {
  shipped: {
    headline: "Your order has shipped 📦",
    body: "It's on its way — track its progress from your order page.",
  },
  delivered: {
    headline: "Your order was delivered 🎉",
    body: "Hope it was worth the wait. If anything's wrong, just reply to this email.",
  },
  cancelled: {
    headline: "Your order was cancelled",
    body: "This order has been cancelled. If that's unexpected, reply to this email and we'll sort it out.",
  },
};

export function orderStatusEmail(input: {
  orderId: string;
  status: string;
}): { subject: string; html: string } | null {
  const copy = STATUS_COPY[input.status];
  if (!copy) return null; // no customer-facing email for pending/paid transitions here

  const shortId = input.orderId.slice(0, 8).toUpperCase();
  return {
    subject: `Order ${shortId}: ${copy.headline}`,
    html: layout(
      "Order update",
      `<h1 style="margin:0 0 12px;font-size:20px;">${copy.headline}</h1>
       <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${MUTED};">${copy.body}</p>
       ${button(`${siteUrl()}/orders/${input.orderId}`, "View order")}`
    ),
  };
}
