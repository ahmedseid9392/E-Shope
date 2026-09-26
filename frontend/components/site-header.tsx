import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, avatar_url")
      .eq("id", user.id)
      .single();
    isAdmin = Boolean(profile?.is_admin);
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link href="/products" className="transition hover:text-accent">
            Products
          </Link>
          {user ? (
            <>
              <Link href="/cart" className="transition hover:text-accent">
                Cart
              </Link>
              <Link href="/orders" className="transition hover:text-accent">
                Orders
              </Link>
              {isAdmin && (
                <Link href="/admin" className="transition hover:text-accent">
                  Admin
                </Link>
              )}
              <Link href="/account" className="flex items-center" aria-label="Your account">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URL
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full border border-line object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-xs font-semibold text-ink">
                    {(user.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-muted transition hover:text-ink">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="transition hover:text-accent">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-2 text-onaccent transition hover:bg-accent/90"
              >
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
