# Frontend

Next.js (App Router) app. Handles all UI and all server-side logic (Server Actions /
Route Handlers) — there is no separate custom API service; Supabase is the backend.

## Getting started

```bash
cp .env.example .env.local   # fill in Supabase + Chapa keys
npm install
npm run dev
```

## Structure

```
app/            Routes (App Router). Group storefront vs admin routes as they're built,
                e.g. app/(storefront)/products/[slug]/page.tsx, app/(admin)/admin/page.tsx
                Auth: app/login, app/signup. Protected placeholders: app/cart, app/checkout,
                app/orders, app/admin (gated by middleware.ts + a server-side re-check).
components/     Shared UI components (site-header.tsx reflects auth state)
lib/actions/    Server Actions (auth.ts: signUp/signIn/signOut)
lib/supabase/   Supabase client helpers (browser, server, admin, middleware)
public/         Static assets
middleware.ts   Refreshes the Supabase session on every request and redirects
                unauthenticated users away from customer-protected routes, and
                non-admins away from /admin
```

## UX notes (from planning docs)

- Mobile-first, responsive down to small screens.
- Home page: New Arrivals carousel + Deals (discounted products) section.
- Search: autocomplete suggestions while typing, recent searches when the box is focused (logged-in users).
- Product detail: strikethrough price + sale badge when discounted; "Related products" (same category) below.
- Prices always formatted in ETB (Birr).
- Order status shown as a step indicator: pending → paid → shipped → delivered.

See `../docs/architecture.md` and `../docs/api.md` for what each page/route should call.
