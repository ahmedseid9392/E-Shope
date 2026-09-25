-- 0001_init.sql gave order_items a SELECT policy ("read order items via order") but no
-- INSERT policy, so checkout's insert into order_items was silently blocked by RLS.
-- This adds the missing policy: a user can insert an order_items row only if it's
-- attached to an order they own.
--
-- Wrapped in a existence check so this is safe to run even after 0001_init.sql has
-- already been patched to include this policy directly (e.g. on a freshly reset DB).

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'order_items' and policyname = 'insert own order items'
  ) then
    create policy "insert own order items" on order_items
      for insert with check (
        exists (
          select 1 from orders
          where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        )
      );
  end if;
end $$;
