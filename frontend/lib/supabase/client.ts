"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components.
 * Uses the public anon key — safe to expose to the browser.
 * RLS policies (see backend/supabase/migrations) enforce what this client can actually do.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

}




export async function testDirectOrderInserts() {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("TEST SETUP FAILED: No authenticated customer session.");
    return;
  }

  console.log("Testing as customer:", user.id);

  // Test A: Attempt an order insert with an intentionally invalid status.
  // If INSERT is revoked, the database should reject the request for
  // insufficient privileges before the status constraint becomes relevant.
  const orderTest = await supabase.from("orders").insert({
    user_id: user.id,
    status: "__permission_test_invalid__",
    total: 1,
    shipping_address: {
      full_name: "Permission Test",
      phone: "0000000000",
      address_line: "Test only",
    },
  });

  console.log("Orders INSERT test:", orderTest.error
    ? "REJECTED"
    : "UNEXPECTED SUCCESS");
  console.log("Orders error details:", orderTest.error);

  // Test B: Attempt an order_items insert using a deliberately nonexistent
  // order UUID. This should never create a valid order item.
  const itemTest = await supabase.from("order_items").insert({
    order_id: "00000000-0000-0000-0000-000000000000",
    product_id: "00000000-0000-0000-0000-000000000000",
    quantity: 1,
    price_at_purchase: 1,
  });

  console.log("Order items INSERT test:", itemTest.error
    ? "REJECTED"
    : "UNEXPECTED SUCCESS");
  console.log("Order items error details:", itemTest.error);
}
