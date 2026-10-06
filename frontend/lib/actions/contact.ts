"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertNoDbError, dbErrorMessage } from "@/lib/errors";

export type ContactActionState = { error?: string; success?: boolean } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Please fill in your name, email, and message." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (message.length > 5000) {
    return { error: "Message is too long — please keep it under 5000 characters." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });

  if (error) {
    return { error: dbErrorMessage(error, "submitContactMessage") };
  }

  return { success: true };
}

// ── Admin ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not authorized.");

  return supabase;
}

/** Inbox for the admin Settings page — backed by the "admins can read
 *  contact messages" RLS policy (0009_contact_messages.sql). */
export async function getContactMessages() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  assertNoDbError(error, "getContactMessages");
  return data ?? [];
}

export async function deleteContactMessage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  assertNoDbError(error, "deleteContactMessage");
  revalidatePath("/admin/settings");
}
