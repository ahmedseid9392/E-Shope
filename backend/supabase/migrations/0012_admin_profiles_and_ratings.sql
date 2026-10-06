-- Until now, "read own profile" was the only SELECT policy on profiles, so
-- an admin querying another user's profile (via a direct query OR a nested
-- `profiles(...)` embed on orders/reviews/etc.) silently got nothing back —
-- RLS applies to embedded resources too. This is what the admin dashboard's
-- customer count and "recent orders" customer names have been missing.
--
-- Added as a new permissive policy (not a replacement) — "read own profile"
-- still applies for everyone, this just additionally opens things up for
-- admins. Postgres OR's permissive policies together.
create policy "admins can read all profiles" on profiles
  for select
  using (is_admin());

-- Needed for the admin Settings page to promote/demote other users' admin
-- access. `with check` re-runs the same condition on the row *after* the
-- update, so an admin can't use this to do something RLS wouldn't allow
-- anyway — it's scoped to "is still an admin", not "can edit anything".
create policy "admins can update all profiles" on profiles
  for update
  using (is_admin())
  with check (is_admin());

-- ── product ratings ──────────────────────────────────────────────────────────
-- Pre-aggregated avg rating + review count per product, so listing pages can
-- show stars without an N+1 query per card. `security_invoker` makes the view
-- respect the querying role's own RLS on `reviews` (which is public-read
-- anyway) rather than running as the view's owner.
create view product_ratings
  with (security_invoker = true)
  as
  select
    product_id,
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*) as review_count
  from reviews
  group by product_id;

grant select on product_ratings to anon, authenticated;
