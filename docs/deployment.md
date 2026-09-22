# Deployment

## Environments
| Env | Frontend | Database | Payments |
|-----|----------|----------|----------|
| Local | `next dev` | Supabase local (CLI) | Chapa test/sandbox mode + a tunnel (e.g. ngrok) for webhook delivery |
| Staging | Vercel preview deploy | Separate Supabase project | Chapa test/sandbox mode |
| Production | Vercel production | Supabase production project | Chapa live mode |

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never exposed to client
CHAPA_SECRET_KEY=                # server-only
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=                  # or other email provider
```

## Docker (local containerized run)
`docker-compose.yml` at the repo root runs the frontend in a container (`docker/frontend.Dockerfile`).
Supabase is **not** run through this compose file — it's managed by the Supabase CLI
(`supabase start`, from `backend/`), which runs its own set of containers. See `backend/README.md`.

```bash
docker compose up --build   # starts the frontend container on http://localhost:3000
```

## Deployment Steps (MVP)
1. Create Supabase project → run schema migrations (from `backend/supabase/migrations/`) → enable RLS policies.
2. Create a Chapa account (test/sandbox mode) → get the secret key → configure the webhook
   endpoint pointing to `https://<domain>/api/webhooks/chapa`.
3. Push repo to GitHub → connect to Vercel → set environment variables in Vercel project settings.
4. Deploy → verify: signup, add product (via admin), full checkout using Chapa's sandbox test
   payment methods (bank/mobile money simulator, or test card if available).
5. Switch Chapa to live mode + update the key + webhook only after a full sandbox checkout has
   been verified end-to-end.

## CI/CD (lean MVP version)
- GitHub Actions: run lint + unit/integration tests on every PR.
- Vercel auto-deploys preview on every PR, production deploy on merge to `main`.
- Supabase migrations tracked in repo (`supabase/migrations/`) and applied via `supabase db push`
  as part of the deploy step (manual for MVP, automated later).

## Monitoring (minimal for MVP)
- Vercel's built-in logs/analytics.
- Chapa dashboard for payment/transaction events.
- Supabase dashboard for DB/auth logs.
- Add proper error tracking (e.g. Sentry) as a fast-follow, not required for first launch.
