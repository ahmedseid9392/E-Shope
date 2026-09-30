-- cart_items had no created_at column, so the cart page's ordering had no
-- stable sort key (rows could reorder on every render). Add it, backfilling
-- existing rows to "now" since we don't know their real insert time.
alter table cart_items
  add column if not exists created_at timestamptz not null default now();
