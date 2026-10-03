-- Admin login gets a second factor: after password check succeeds for an
-- admin account, a 6-digit code is emailed and must be entered before
-- /admin becomes reachable (enforced in middleware — see
-- frontend/lib/supabase/middleware.ts and frontend/lib/mfa.ts).
--
-- Only hashes are ever stored (sha256, computed in app code with Web Crypto
-- so the same helper works in both Node server actions and edge
-- middleware) — a DB read of either table never exposes a usable code or
-- session token, only something to compare a hash against.

-- ── admin_login_otps ──────────────────────────────────────────────────────────
-- One row per OTP sent. consumed_at is set the moment a code is used, so a
-- code can't be replayed even within its expiry window.
create table admin_login_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index admin_login_otps_user_id_idx on admin_login_otps (user_id);

-- ── admin_mfa_sessions ───────────────────────────────────────────────────────
-- A row here is proof "this browser completed OTP verification for this
-- admin", checked by middleware on every /admin/** request. The raw token
-- lives only in an httpOnly cookie on the client; token_hash is what's
-- stored, so a DB read alone can never grant access.
create table admin_mfa_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index admin_mfa_sessions_user_id_idx on admin_mfa_sessions (user_id);
create unique index admin_mfa_sessions_token_hash_idx on admin_mfa_sessions (token_hash);

alter table admin_login_otps enable row level security;
alter table admin_mfa_sessions enable row level security;

-- Unlike `payments` (zero client policies — service-role only, because a
-- client must never be able to influence payment state), these two tables
-- are scoped to "your own rows only". That's safe here because every value
-- stored is a hash, not a usable secret, AND because middleware (edge
-- runtime) can't use the service-role admin client — createAdminClient()
-- does a dynamic require() of @supabase/supabase-js, which isn't available
-- outside Node. Owner-scoped RLS lets middleware reuse the same
-- cookie-based session client it already has for the is_admin check,
-- instead of needing a second client type there.
create policy "own otp rows" on admin_login_otps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own mfa session rows" on admin_mfa_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
