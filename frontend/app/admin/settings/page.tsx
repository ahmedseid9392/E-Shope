import Link from "next/link";
import { Mail, ShieldCheck, Inbox } from "lucide-react";
import { getAllCustomersForAdmin } from "@/lib/actions/customers";
import { getContactMessages } from "@/lib/actions/contact";
import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/format";
import { ToggleAdminButton } from "@/components/admin/toggle-admin-button";
import { DeleteContactMessageButton } from "@/components/admin/delete-contact-message-button";

export default async function AdminSettingsPage() {
  const [customers, messages, { data: auth }] = await Promise.all([
    getAllCustomersForAdmin(),
    getContactMessages(),
    createClient().auth.getUser(),
  ]);
  const currentUserId = auth.user?.id;
  const admins = customers.filter((c) => c.is_admin);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">Settings</h1>
      <p className="mt-1 text-sm text-muted">Manage who has admin access and view customer inquiries.</p>

      {/* ── Admin team ───────────────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-accent" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Admin team
          </h2>
        </div>

        <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
          {admins.length === 0 && (
            <p className="p-4 text-sm text-muted">No admins found — that shouldn&apos;t happen.</p>
          )}
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{a.full_name ?? "Unnamed"}</p>
                <p className="truncate text-xs text-muted">{a.email ?? "—"}</p>
              </div>
              <ToggleAdminButton userId={a.id} isAdmin={a.is_admin} isSelf={a.id === currentUserId} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          To grant a customer admin access, find them on the{" "}
          <Link href="/admin/customers" className="text-accent hover:underline">
            Customers page
          </Link>{" "}
          and toggle &ldquo;Make admin.&ldquo;
        </p>
      </section>

      {/* ── Contact inquiries ────────────────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-center gap-2">
          <Inbox size={16} className="text-accent" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Contact messages
          </h2>
        </div>

        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No messages yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {messages.map((m: any) => (
              <div key={m.id} className="flex items-start gap-3 p-4 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Mail size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="font-medium text-ink">{m.name}</p>
                    <span className="text-xs text-muted">{formatRelativeTime(m.created_at)}</span>
                  </div>
                  <a href={`mailto:${m.email}`} className="text-xs text-accent hover:underline">
                    {m.email}
                  </a>
                  <p className="mt-1.5 whitespace-pre-wrap text-ink">{m.message}</p>
                </div>
                <DeleteContactMessageButton id={m.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
