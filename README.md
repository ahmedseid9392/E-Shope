# My Store

Single-store ecommerce app. Next.js (App Router) frontend, Supabase backend (Postgres, Auth,
Storage), Chapa for payments (ETB, bank transfer, mobile money, cards).

## Structure

```
my-project/
├── frontend/          Next.js app — UI + all server logic
├── backend/           Supabase config (migrations, seed, edge functions)
├── docs/              Requirements, architecture, database, API, security, testing, deployment
├── docker/            Dockerfiles
├── .github/workflows/ CI
├── docker-compose.yml Local containerized frontend
└── IMPLEMENTATION_PLAN.md   Build order (12 phases) — start here
```

## Quickstart

```bash
# 1. Backend: start Supabase locally
cd backend
supabase start
supabase db reset       # applies migrations + seed data
# copy the printed API URL + anon key

# 2. Frontend
cd ../frontend
cp .env.example .env.local   # paste in Supabase URL/keys + Chapa key
npm install
npm run dev                  # http://localhost:3000
```

## Docs

| File | Covers |
|------|--------|
| `docs/requirements.md` | Problem, users, goals, functional/non-functional requirements, use cases |
| `docs/architecture.md` | System design, folder structure, ADRs |
| `docs/database.md` | Schema rationale (source of truth is `backend/supabase/migrations/`) |
| `docs/api.md` | Every route/Server Action, request/response shape |
| `docs/security.md` | Auth, RLS policies, payment security |
| `docs/testing.md` | Test strategy and what must be covered before launch |
| `docs/deployment.md` | Environments, env vars, Docker, CI/CD, monitoring |

## Build order

See `IMPLEMENTATION_PLAN.md` — 12 phases, in order, from project setup through monitoring.
