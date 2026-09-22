# 08 — Security

## Authentication
- Supabase Auth handles password hashing, session tokens (JWT) — never implement custom auth.
- Sessions verified server-side on every protected Server Action / Route Handler via Supabase's
  server client (reads the JWT from cookies).

## Authorization (Row Level Security)
All tables have RLS **enabled** by default. Example policies:

```sql
-- profiles: users can only read/update their own row
create policy "read own profile" on profiles
  for select using (auth.uid() = id);

create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- products: public read, admin-only write
create policy "public read products" on products
  for select using (true);

create policy "admin write products" on products
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- orders: users see only their own; admins see all
create policy "own orders" on orders
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

- `payments` table: **no** client-facing policy at all — only the server (using the Supabase
  service role key, never exposed to the browser) can write to it, from the Stripe webhook handler.

## Payments Security
- Chapa secret key lives only in server environment variables — never sent to the client.
- Every incoming webhook request is verified against its signature (HMAC, using the secret key)
  before any processing happens.
- Even after signature verification, the webhook handler does **not** trust the payload's status
  directly — it makes its own server-to-server call to Chapa's `transaction/verify/{tx_ref}`
  endpoint and only marks the order `paid` based on that response. This guards against replayed
  or forged webhook calls.
- `tx_ref` is generated server-side per order and is unique — used to match the webhook/verify
  response back to the correct order, never trusted from client input.
- Order totals are recalculated server-side from the DB cart at checkout time — the client never
  sends a price that gets trusted directly.
- Amount sent to Chapa is always in ETB and computed server-side from `order.total`.

## General
- All admin routes double-check `is_admin` server-side on every request (not just hidden in the UI).
- Environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `CHAPA_SECRET_KEY`)
  are never exposed to client bundles — only used inside Server Actions/Route Handlers.
- Input validation (e.g. with Zod) on every Server Action before touching the database.
- Rate limiting on auth and checkout endpoints (basic MVP: Vercel/Supabase built-in protections;
  revisit if abuse appears).
- HTTPS enforced everywhere (default on Vercel + Supabase).
