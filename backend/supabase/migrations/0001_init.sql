-- Initial schema for my-project
-- See ../../../docs/database.md for the full design rationale.

create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── categories ──────────────────────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- ── products ────────────────────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  stock int not null default 0 check (stock >= 0),
  category_id uuid references categories (id),
  image_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);
create index products_created_at_idx on products (created_at desc);

-- ── cart_items ──────────────────────────────────────────────────────────────
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  unique (user_id, product_id)
);

-- ── orders ──────────────────────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total numeric(12, 2) not null check (total >= 0),
  shipping_address jsonb not null,
  created_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);

-- ── order_items ─────────────────────────────────────────────────────────────
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity int not null check (quantity > 0),
  price_at_purchase numeric(12, 2) not null check (price_at_purchase >= 0)
);

create index order_items_order_id_idx on order_items (order_id);

-- ── payments (Chapa) ─────────────────────────────────────────────────────────
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id),
  tx_ref text not null unique,
  chapa_reference text,
  status text not null default 'pending',
  amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index payments_order_id_idx on payments (order_id);

-- ── reviews ──────────────────────────────────────────────────────────────────
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on reviews (product_id);

-- ── search_history ───────────────────────────────────────────────────────────
create table search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  query text not null,
  created_at timestamptz not null default now()
);

create index search_history_user_id_idx on search_history (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table search_history enable row level security;

-- helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$ language sql stable security definer;

-- profiles
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- categories: public read, admin write
create policy "public read categories" on categories for select using (true);
create policy "admin write categories" on categories for all using (is_admin());

-- products: public read (active only for anonymous), admin write
create policy "public read active products" on products
  for select using (is_active = true or is_admin());
create policy "admin write products" on products for all using (is_admin());

-- cart_items: owner only
create policy "own cart" on cart_items for all using (auth.uid() = user_id);

-- orders: owner or admin
create policy "own or admin orders" on orders
  for select using (auth.uid() = user_id or is_admin());
create policy "create own orders" on orders
  for insert with check (auth.uid() = user_id);
create policy "admin update orders" on orders
  for update using (is_admin());

-- order_items: readable if you can read the parent order
create policy "read order items via order" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or is_admin())
    )
  );

-- payments: no client policies at all — server only, via service role key.

-- reviews: public read; insert restricted to users with a delivered order for that product
create policy "public read reviews" on reviews for select using (true);
create policy "insert review if delivered" on reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from order_items
      join orders on orders.id = order_items.order_id
      where orders.user_id = auth.uid()
        and orders.status = 'delivered'
        and order_items.product_id = reviews.product_id
    )
  );
create policy "admin delete reviews" on reviews for delete using (is_admin());

-- search_history: owner only
create policy "own search history" on search_history for all using (auth.uid() = user_id);
