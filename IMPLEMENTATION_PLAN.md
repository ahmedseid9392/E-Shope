# Implementation Plan

Build in this order. Each phase should be a working, committed state before moving to the next —
don't start Phase 4 with Phase 2 half-done.

- [ ] **Phase 1 — Project setup**
  Repo scaffold (this structure), `frontend/` installs and runs (`npm run dev` shows the
  placeholder home page), `.env.example` filled in, Supabase project created (or `supabase start`
  locally).

- [ ] **Phase 2 — Database + migrations**
  Apply `backend/supabase/migrations/0001_init.sql`, run `seed.sql`, confirm RLS policies work
  (try querying another user's cart/orders and confirm it's denied). Reference: `docs/database.md`.

- [x] **Phase 3 — Authentication + authorization**
  Signup/login/logout via Supabase Auth (`app/login`, `app/signup`, `lib/actions/auth.ts`).
  `middleware.ts` redirects unauthenticated users away from `/cart`, `/checkout`, `/orders`, and
  non-admins away from `/admin`; each protected page also re-checks server-side. A DB trigger
  (`0002_handle_new_user.sql`) auto-creates the `profiles` row on signup. Reference: `docs/security.md`.

- [ ] **Phase 4 — Core backend modules**
  Server Actions / Route Handlers for: products (CRUD + list/filter/search), cart, orders,
  reviews, search history. This is the bulk of business logic — no payment integration yet.
  Reference: `docs/api.md`, `docs/requirements.md`.

- [ ] **Phase 5 — API documentation**
  Once real routes exist, verify `docs/api.md` matches what was actually built (params, response
  shapes, error format) and correct any drift.

- [ ] **Phase 6 — Frontend foundation**
  Layout, navigation, design tokens/Tailwind setup, shared components (product card, price
  display with sale-price handling, button/input primitives). Reference: `docs/architecture.md`,
  `frontend/README.md`.

- [ ] **Phase 7 — Frontend feature implementation**
  Wire up every page in `docs/requirements.md`'s use-cases against Phase 4's backend: product
  listing/search/filter, product detail + related products, cart, order history, reviews,
  admin dashboard, new arrivals/deals sections.

- [ ] **Phase 8 — Integration**
  Chapa checkout end-to-end: initialize → redirect → webhook → server-side verify → mark paid →
  decrement stock → send confirmation email. Test with Chapa sandbox. Reference: `docs/requirements.md`
  (checkout flow), `docs/security.md`.

- [ ] **Phase 9 — Testing**
  Unit tests for utilities/schemas, integration tests for Server Actions + RLS, Playwright E2E
  for signup → browse → cart → checkout → confirmation. Reference: `docs/testing.md`.

- [ ] **Phase 10 — Docker + CI/CD**
  Confirm `docker compose up --build` works locally, GitHub Actions (`.github/workflows/ci.yml`)
  passes lint/type-check/test/build on a PR.

- [ ] **Phase 11 — Deployment**
  Push to Vercel + production Supabase project, switch Chapa to live mode after a verified
  sandbox run. Reference: `docs/deployment.md`.

- [ ] **Phase 12 — Monitoring + optimization**
  Add error tracking (e.g. Sentry), watch Vercel/Supabase/Chapa dashboards for the first real
  traffic, optimize slow queries/pages as real usage reveals them.
