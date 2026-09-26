"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/cloudinary";

export function ImageUploader({
  folder,
  initialUrl,
  onUploaded,
  shape = "square",
}: {
  folder: string;
  initialUrl?: string | null;
  onUploaded: (url: string) => void;
  shape?: "square" | "circle";
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setPreview(URL.createObjectURL(file)); // instant local preview while it uploads
    setIsUploading(true);

    try {
      const url = await uploadImage(file, folder);
      setPreview(url);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-20 w-20 items-center justify-center overflow-hidden border border-line bg-bg text-xs text-muted ${
          shape === "circle" ? "rounded-full" : "rounded-lg"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview may be a local blob: URL
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          "No image"
        )}
      </div>

      <div>
        <label className="cursor-pointer rounded border border-line bg-surface px-3 py-2 text-sm text-ink hover:border-ink">
          {isUploading ? "Uploading..." : preview ? "Change image" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
