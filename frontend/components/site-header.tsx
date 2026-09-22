import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export async function SiteHeader() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = Boolean(profile?.is_admin);
  }

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          My Store
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/orders" className="text-neutral-700 hover:text-neutral-900">
                Orders
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-neutral-700 hover:text-neutral-900">
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-700 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
