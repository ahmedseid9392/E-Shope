# Backend (Supabase)

This project has no separate custom API server. "Backend" here means Supabase config only:
database schema (migrations), seed data, and (optionally, later) Edge Functions. All
application server logic — checkout, Chapa webhook handling, admin actions — lives in
`../frontend` as Next.js Server Actions / Route Handlers.

## Local development

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
cd backend
supabase start        # spins up local Postgres, Auth, Studio, etc. in Docker
supabase db reset      # applies migrations/ + seed.sql
```

`supabase start` prints local API URL + anon key — copy those into `frontend/.env.local`.

## Adding a schema change

1. Write a new file in `migrations/`, named `NNNN_description.sql` (next sequential number).2. Run `supabase db reset` locally to verify it applies cleanly against a fresh DB.
3. Update `../docs/database.md` to match.
4. On deploy, run `supabase db push` against the target project (see `../docs/deployment.md`).

## Structure

```
supabase/
  config.toml       Local dev configuration
  migrations/        Schema migrations, applied in filename order
  seed.sql           Sample data for local dev only — never run against production
  functions/          Edge Functions (none yet — reserved for future use)
```
