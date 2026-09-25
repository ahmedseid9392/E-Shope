/**
 * Uploads a file directly from the browser to Cloudinary using an UNSIGNED
 * upload preset — no API secret is ever exposed to the client. Configure the
 * preset in the Cloudinary dashboard (Settings -> Upload -> Upload presets):
 * set it to "Unsigned", and restrict allowed formats / max file size /
 * folder there rather than trusting the client.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary isn't configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Image upload failed.");
  }

  const data = await response.json();
  return data.secure_url as string;
}
