-- Wishlist ("like") feature + simple color/size product options.
-- See docs/database.md for the overall schema design rationale.

-- ── products: simple attribute lists ─────────────────────────────────────────
-- Kept as plain text[] rather than a full variants table (with per-variant
-- price/stock) to match the existing schema's level of complexity. A color
-- or size is just a customer-facing choice here, not separately tracked stock.
alter table products
  add column if not exists colors text[] not null default '{}',
  add column if not exists sizes text[] not null default '{}';

-- ── cart_items / order_items: remember which option was picked ─────────────
alter table cart_items
  add column if not exists color text,
  add column if not exists size text;

alter table order_items
  add column if not exists color text,
  add column if not exists size text;

-- A user can have the same product in the cart twice if the color/size differ,
-- so the old (user_id, product_id) uniqueness needs to include the option
-- columns. Postgres treats NULL as distinct in a unique index, which is what
-- we want here (no options selected -> still only one such line per product).
alter table cart_items drop constraint if exists cart_items_user_id_product_id_key;
create unique index if not exists cart_items_user_product_variant_idx
  on cart_items (user_id, product_id, coalesce(color, ''), coalesce(size, ''));

-- ── wishlists ─────────────────────────────────────────────────────────────────
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on wishlists (user_id, created_at desc);

alter table wishlists enable row level security;
create policy "own wishlist" on wishlists for all using (auth.uid() = user_id);
