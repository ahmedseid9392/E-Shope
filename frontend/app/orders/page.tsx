import { createClient } from "@/lib/supabase/server";

export default async function OrdersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-2xl font-semibold">Your orders</h1>
      <p className="mt-2 text-neutral-600">
        Signed in as {user?.email}. Order history and status tracking land here in Phase 7.
      </p>
    </main>
  );
}
