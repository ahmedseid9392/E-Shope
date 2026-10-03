# Implementation Plan

Build in this order. Each phase should be a working, committed state before moving to the next —
don't start Phase 4 with Phase 2 half-done.

- [x] **Phase 1 — Project setup**
  Repo scaffold, `frontend/` runs (`npm run dev`), Supabase project provisioned (hosted), `.env.local`
  configured.

- [x] **Phase 2 — Database + migrations**
  `0001_init.sql` through `0004_avatar_and_oauth.sql` applied. RLS verified working (order_items
  insert gap found and fixed via `0003`). Reference: `docs/database.md`.

- [x] **Phase 3 — Authentication + authorization**
  Signup/login/logout via Supabase Auth, plus Google OAuth (`app/auth/callback`,
  `lib/actions/auth.ts` → `signInWithGoogle`). `middleware.ts` gates `/cart`, `/checkout`,
  `/orders`, `/account`, and `/admin`; each protected page re-checks server-side. Profile row
  auto-created on signup (including avatar from Google when available). Reference:
  `docs/security.md`.

- [x] **Phase 4 — Core backend modules**
  Server Actions for products (list/filter/search + admin CRUD), cart, orders (pending-order
  creation, list/detail, admin status update), reviews (delivered-only), search (log + recent),
  and profile updates. Payment is intentionally still a gap here — see Phase 8.
  Reference: `docs/api.md`, `docs/requirements.md`.

- [ ] **Phase 5 — API documentation**
  `docs/api.md` predates the live-search rework, image upload flow, and Google OAuth — needs a
  pass to match what's actually built (params, response shapes, error format).

- [x] **Phase 6 — Frontend foundation**
  Design system in place: 4-color token set (light + dark, CSS-variable driven), Bricolage
  Grotesque + Work Sans, dark/light toggle with no-flash init, header/footer, product card,
  consistent input/button styling across the app. Reference: `docs/architecture.md`.

- [x] **Phase 7 — Frontend feature implementation**
  Product listing with live search/filter, product detail + related products + reviews (real
  star icons), cart, order history/detail with status stepper, admin dashboard (products +
  orders), new arrivals/deals (both respect scheduled sale windows now, not just "has a
  sale_price"), image upload (Cloudinary) for products and profile avatars, full admin product
  CRUD including edit (was create + soft-delete only), scheduled discounts with start/end dates.
  Icons (cart, edit, delete, star rating) via lucide-react. Remaining P1/P2, not blockers:
  autocomplete suggestions and trending searches.

- [x] **Phase 8 — Integration**
  Chapa checkout end-to-end — initialize → redirect → webhook → server-side verify → mark
  paid → decrement stock → confirmation email — all working. Plus: transactional email via
  Resend (welcome on signup, order confirmation, shipped/delivered/cancelled status emails),
  password reset via Supabase Auth's own email flow, and a second factor (emailed 6-digit
  OTP + short-lived MFA session) gating `/admin` beyond the existing `is_admin` check.
  Reference: `docs/requirements.md` (checkout flow, FR-25), `docs/security.md`.

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
