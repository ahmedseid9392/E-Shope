import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { ADMIN_MFA_COOKIE, sha256Hex } from "@/lib/mfa";

const CUSTOMER_PROTECTED_PREFIXES = ["/cart", "/checkout", "/orders", "/account"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always call getUser() here (not getSession()) — it revalidates
  // the token against Supabase Auth rather than just trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isCustomerProtected = CUSTOMER_PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  const isAdminPath = path.startsWith("/admin");

  if (!user && (isCustomerProtected || isAdminPath)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  if (user && isAdminPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Second factor: an admin account alone isn't enough past this point —
    // they also need a still-valid OTP-verified session (see
    // lib/actions/auth.ts verifyAdminOtp / lib/mfa.ts).
    const mfaToken = request.cookies.get(ADMIN_MFA_COOKIE)?.value;
    let mfaOk = false;

    if (mfaToken) {
      const tokenHash = await sha256Hex(mfaToken);
      const { data: mfaSession } = await supabase
        .from("admin_mfa_sessions")
        .select("expires_at")
        .eq("user_id", user.id)
        .eq("token_hash", tokenHash)
        .maybeSingle();

      mfaOk = !!mfaSession && new Date(mfaSession.expires_at) > new Date();
    }

    if (!mfaOk) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-otp";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
