
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/";

  // Prevent external redirect URLs.
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  const response = NextResponse.redirect(
    new URL(safeRedirect, requestUrl.origin)
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin)
    );
  }

  const supabase = createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);

    return NextResponse.redirect(
      new URL("/login?error=oauth_callback_failed", requestUrl.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const metadata = user.user_metadata ?? {};
    const fullName =
      metadata.full_name ?? metadata.name ?? metadata.user_name ?? null;
    const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        ...(fullName ? { full_name: fullName } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      },
      { onConflict: "id" }
    );
  }

  return response;
}
