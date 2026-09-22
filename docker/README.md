# Docker

- `frontend.Dockerfile` — multi-stage build for the Next.js app (used by the root `docker-compose.yml`).

Supabase is intentionally **not** containerized here. Local Supabase runs via the Supabase CLI
(`supabase start`, from `backend/`), which manages its own Postgres/Auth/Storage containers.
Keeping it separate avoids duplicating what the CLI already does well.
