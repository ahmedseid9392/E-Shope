import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { getCartCount } from "@/lib/actions/cart";
import { getWishlistCount } from "@/lib/actions/wishlist";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";

function CountBadge({ count, label, className = "" }: { count: number; label: string; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-onaccent ${className}`}
      aria-label={`${count} item${count === 1 ? "" : "s"} in ${label}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

// Shared look for the rows inside the mobile dropdown.
const MOBILE_LINK =
  "flex min-h-12 items-center border-b border-line py-3 transition hover:text-accent";

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let avatarUrl: string | null = null;
  let cartCount = 0;
  let wishlistCount = 0;
  if (user) {
    const [{ data: profile }, count, likedCount] = await Promise.all([
      supabase
        .from("profiles")
        .select("is_admin, avatar_url")
        .eq("id", user.id)
        .single(),
      getCartCount(),
      getWishlistCount(),
    ]);
    isAdmin = Boolean(profile?.is_admin);
    avatarUrl = profile?.avatar_url ?? null;
    cartCount = count;
    wishlistCount = likedCount;
  }

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="relative z-40 border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" aria-label="E-Shope home" className="shrink-0">
          <Logo />
        </Link>

        {/* ── Desktop / tablet navigation (md and up) ─────────────────────── */}
        <nav aria-label="Main" className="hidden items-center gap-4 text-sm font-medium text-ink md:flex lg:gap-6">
          <Link href="/products" className="transition hover:text-accent">
            Products
          </Link>
          {user ? (
            <>
              <Link
                href="/wishlist"
                className="relative flex items-center transition hover:text-accent"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                <CountBadge count={wishlistCount} label="wishlist" className="-right-3 -top-2" />
              </Link>
              <Link href="/cart" className="relative flex items-center transition hover:text-accent">
                Cart
                <CountBadge count={cartCount} label="cart" className="-right-3 -top-2" />
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
                    {initial}
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

        {/* ── Mobile: quick icons + hamburger (below md) ──────────────────── */}
        <div className="flex items-center gap-2 md:hidden">
          {user && (
            <>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink"
              >
                <Heart size={18} />
                <CountBadge count={wishlistCount} label="wishlist" className="-right-1 -top-1" />
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink"
              >
                <ShoppingCart size={18} />
                <CountBadge count={cartCount} label="cart" className="-right-1 -top-1" />
              </Link>
            </>
          )}
          <ThemeToggle />
          <MobileMenu>
            <Link href="/products" className={MOBILE_LINK}>
              Products
            </Link>
            {user ? (
              <>
                <Link href="/orders" className={MOBILE_LINK}>
                  Orders
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={MOBILE_LINK}>
                    Admin
                  </Link>
                )}
                <Link href="/account" className={`${MOBILE_LINK} gap-3`}>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URL
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-xs font-semibold">
                      {initial}
                    </span>
                  )}
                  Account
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex min-h-12 w-full items-center py-3 text-left text-muted transition hover:text-ink"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className={MOBILE_LINK}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="my-3 flex min-h-12 items-center justify-center rounded-full bg-accent px-4 py-3 text-onaccent transition hover:bg-accent/90"
                >
                  Sign up
                </Link>
              </>
            )}
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
