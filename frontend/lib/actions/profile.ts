"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!fullName) return { error: "Name can't be empty." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_url: avatarUrl || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Header and anywhere else showing name/avatar should reflect the change immediately.
  revalidatePath("/", "layout");
  return { success: true };
}
