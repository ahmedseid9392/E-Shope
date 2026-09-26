"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateProfile, type ProfileActionState } from "@/lib/actions/profile";
import { ImageUploader } from "@/components/image-uploader";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-accent px-4 py-2 text-sm text-onaccent disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export function AccountForm({
  fullName,
  avatarUrl,
  email,
}: {
  fullName: string | null;
  avatarUrl: string | null;
  email: string;
}) {
  const [state, formAction] = useFormState<ProfileActionState, FormData>(
    updateProfile,
    undefined
  );
  const [avatar, setAvatar] = useState(avatarUrl ?? "");

  return (
    <form action={formAction} className="mt-6 max-w-sm space-y-4">
      <div>
        <label className="block text-sm font-medium">Profile photo</label>
        <div className="mt-1">
          <ImageUploader
            folder="avatars"
            initialUrl={avatar}
            onUploaded={setAvatar}
            shape="circle"
          />
        </div>
        <input type="hidden" name="avatar_url" value={avatar} />
      </div>

      <div>
        <label className="block text-sm font-medium">Full name</label>
        <input
          name="full_name"
          defaultValue={fullName ?? ""}
          required
          className="mt-1 w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          value={email}
          disabled
          className="mt-1 w-full rounded border border-line bg-bg px-3 py-2 text-sm text-muted"
        />
        <p className="mt-1 text-xs text-muted">Email can&apos;t be changed here.</p>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}

      <SubmitButton />
    </form>
  );
}
