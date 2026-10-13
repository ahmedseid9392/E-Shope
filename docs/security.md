# Security Review and Remediation Log

**Project:** E-commerce application (Next.js App Router, Supabase Auth/Postgres/RLS, Chapa)  
**Last updated:** 2026-10-13  
**Environment evidence:** Staging database permission queries and browser-client negative tests, as reported during the security review. Source-code findings are distinguished from runtime-verified results.

## 1. Security baseline and operating rules

- Supabase Auth manages authentication and sessions. Protected Server Actions and Route Handlers must verify the current user on the server.
- Enable Row Level Security (RLS) on tables exposed through the Supabase Data API. RLS policies and SQL grants are separate controls: both must be reviewed.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, Chapa secrets, or other privileged credentials to client bundles. Use privileged server clients only in trusted server code.
- Treat all browser-supplied IDs, totals, prices, order status, roles, and payment status as untrusted. Derive authoritative values from the database and payment provider.
- Validate input on the server and apply least-privilege grants. Do not treat a hidden UI control as authorization.
- Test security changes in development/staging with disposable accounts and data before production deployment.

## 2. Verified remediations

### SEC-003 — Customer self-promotion to administrator

**Risk:** A customer could attempt to set `profiles.is_admin = true` through their own profile update if column permissions and the owner-update policy allowed it.

**Remediation and verification:** The staging database was changed to protect `is_admin` while preserving ordinary profile updates. The user reported that the profile-update retest succeeded for the intended behavior.

**Status:** Fixed in staging and retested, based on user-reported test results. Re-run regression tests after schema or profile-policy changes. Ensure the fix is represented in version-controlled migrations.

### SEC-004 — Direct execution of `mark_order_paid()`

**Risk:** The `SECURITY DEFINER` payment RPC could be invoked by ordinary client roles if they had `EXECUTE` permission.

**Remediation applied in staging:**

```sql
REVOKE EXECUTE ON FUNCTION public.mark_order_paid(
  uuid, text, text, numeric
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.mark_order_paid(
  uuid, text, text, numeric
) TO service_role;
```

**Verification:** The user queried function privileges and reported `anon = false`, `authenticated = false`, and `service_role = true`.

**Status:** Direct execution exposure fixed in staging and permission results verified. Keep calls server-side, and review the function body for independent order-total validation, payment idempotency, and safe `SECURITY DEFINER` configuration.

### SEC-006 — Direct client insertion into `orders`

**Risk:** A customer with direct table `INSERT` privileges could attempt to create an order outside the trusted checkout flow, potentially supplying forged order fields.

**Remediation:** Direct table-level and column-level `INSERT` grants were revoked for `anon` and `authenticated`. Order creation is intended to go through the controlled `create_pending_order_from_cart(jsonb)` RPC, which derives the user from `auth.uid()`, validates the cart, calculates the total from database product data, and creates the order and order items in one database transaction.

**Verification evidence:**

- `information_schema.role_table_grants` query for `orders` and `order_items`, roles `anon`/`authenticated`, privilege `INSERT`: **0 rows**.
- `information_schema.role_column_grants` query for the same tables and roles: **0 rows**.
- Browser test using the normal authenticated customer Supabase client returned: `permission denied for table orders`.
- The user previously reported that normal checkout still worked after the grants were revoked.

**Status:** Fixed in staging; SQL privilege checks and browser negative test verified.

### SEC-007 — Direct client insertion into `order_items`

**Risk:** Directly inserting order-item rows could bypass the trusted checkout flow and undermine order integrity.

**Remediation:** Direct table-level and column-level `INSERT` grants were revoked for `anon` and `authenticated`; order items should be created only as part of the trusted checkout RPC.

**Verification evidence:**

- Both grant queries described under SEC-006 returned **0 rows** for `order_items`.
- Browser test using the normal authenticated customer Supabase client returned: `permission denied for table order_items`.
- The user previously reported that normal checkout still worked after the grants were revoked.

**Status:** Fixed in staging; SQL privilege checks and browser negative test verified.

> **Migration tracking note:** The uploaded project archive contains migrations through `0013_create_pending_order_rpc.sql`, but it does not contain a migration recording the manual `orders`/`order_items` `INSERT`-grant revocations or the later permission changes. Add reviewed, version-controlled migrations for these changes before relying on them in another environment. Do not blindly replay SQL in production; inspect current grants and policies first.

## 3. Open findings and follow-up work

### SEC-005 — Chapa webhook signature verification is optional

**Finding:** The webhook handler continues processing when `CHAPA_WEBHOOK_SECRET` is not configured, rather than requiring signature verification. In staging, the user reported that this secret was not configured and chose to defer this work until production.

**Mitigation currently present:** The payment flow also verifies the transaction with Chapa's server-to-server verification endpoint before marking an order paid. This is an additional control, not a replacement for correctly configured webhook authentication.

**Status:** Deferred; not fixed. Before enabling production webhook processing, configure the correct provider secret, require valid signature verification for webhook requests, and test valid, missing, and invalid signatures. Confirm the current Chapa signature scheme from its official documentation before implementing verification.

### SEC-008 — Inventory overselling race condition

**Finding from source review:** `create_pending_order_from_cart` checks stock and locks product rows while validating checkout, but does not reserve/decrement stock at pending-order creation. Stock is deducted in `mark_order_paid` after payment success. Multiple pending orders can therefore pass stock validation against the same available quantity. The current `GREATEST(stock - quantity, 0)` prevents negative stock but can conceal an oversold order.

**Status:** Open; potential race condition identified by source review. The user has not performed a concurrent-order test, and the project is still in development. This is not a confirmed production incident.

**Recommended remediation before production:** Make inventory deduction and payment/order state transitions transactional and concurrency-safe. At payment confirmation, lock relevant product rows and verify that every order item has sufficient stock before deducting anything; ensure the order is not marked paid if inventory handling fails. Define an explicit business response for the case where Chapa payment has succeeded but stock is insufficient. Consider inventory reservations only if the product requirements call for holding stock while an order is pending; if reservations are added, implement one-time release on expiry/cancellation and avoid double reservation or release.

**Required tests:** Two competing orders for the last unit; duplicate payment callback; multi-item order with one item out of stock; repeated payment confirmation; cancellation/retry behavior. Use staging and simulated/test payments only.

### SEC-009 — Sale price validity is not checked by checkout RPC

**Finding from source review:** The checkout RPC calculates price using `coalesce(sale_price, price)` but does not check `sale_starts_at` or `sale_ends_at`. A scheduled or expired sale price may therefore be used outside its intended period.

**Status:** Open; source-code finding, not yet fixed or runtime-tested.

**Recommended remediation:** Use the same authoritative sale-window rules as the product display/admin logic when calculating the checkout total. Add tests for a sale that has not started, an active sale, an expired sale, and a product without a sale price. Confirm the intended timezone/boundary semantics before changing the SQL.

### SEC-010 — `mark_order_paid()` defense-in-depth and `SECURITY DEFINER` hardening

**Finding from source review:** The function is `SECURITY DEFINER` and uses `SET search_path = public`. Its body should independently enforce relevant invariants, including matching the verified amount against the authoritative order total and safe/idempotent state transitions. The ordinary client execution privilege issue is fixed separately under SEC-004.

**Status:** Follow-up review required; not yet remediated in this log.

**Recommended remediation:** Review all object references and qualify them explicitly; consider `SET search_path = ''` with fully qualified object names; validate the order total and payment reference within the trusted transaction; and test duplicate/concurrent confirmations. Do not change the function until the existing payment flow and constraints have been reviewed.

## 4. Important implementation details

### Checkout RPC

The `create_pending_order_from_cart(jsonb)` function in migration `0013_create_pending_order_rpc.sql`:

- derives the customer from `auth.uid()` and rejects unauthenticated calls;
- validates required shipping-address fields and a non-empty cart;
- locks the relevant product rows while validating active status and stock;
- calculates totals from database product data rather than trusting a browser-supplied total;
- creates the pending order and order items in the same database transaction;
- grants execution to `authenticated` and revokes it from `PUBLIC` and `anon`.

The function currently does not reserve inventory, and it does not apply sale-window checks when choosing `sale_price`; see SEC-008 and SEC-009.

### Do not overstate webhook security

Do not document that every webhook is always signature-verified while the handler allows processing without `CHAPA_WEBHOOK_SECRET`. The current status is explicitly deferred under SEC-005.

## 5. Verification checklist

- [x] Customer cannot self-promote to admin in staging, based on reported retest.
- [x] `mark_order_paid()` execution revoked from `PUBLIC`, `anon`, and `authenticated`; only `service_role` retains execution, based on staging privilege query.
- [x] No table-level or column-level `INSERT` grants for `anon`/`authenticated` on `orders` and `order_items` in staging.
- [x] Browser-client direct insert to `orders` rejected with `permission denied for table orders`.
- [x] Browser-client direct insert to `order_items` rejected with `permission denied for table order_items`.
- [x] Normal checkout reportedly continued working after direct `INSERT` grants were revoked.
- [ ] Add grant revocations and other manual security changes to version-controlled migrations.
- [ ] Require webhook signature verification before production webhook use.
- [ ] Fix/test sale-window pricing in checkout RPC.
- [ ] Harden and test payment confirmation invariants and `SECURITY DEFINER` function configuration.
- [ ] Test competing orders and implement concurrency-safe inventory handling.
- [ ] Add automated regression tests for authorization, checkout, and payment flows.

## 6. Review scope and evidence quality

This log combines source-code inspection, staging SQL permission queries, and browser-client tests reported during development. A status marked **verified in staging** applies to the specific tests listed; it does not mean the whole application has been penetration-tested or is production-ready. Open findings remain open until code changes and appropriate tests provide evidence of remediation.
