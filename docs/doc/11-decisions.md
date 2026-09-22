# 11 — Architecture Decision Records (ADR)

Format: short log of key decisions, why they were made, and what was traded off.

---

### D-001: Merge "Seller Dashboard" into "Admin Dashboard"
**Context**: Original feature list included both "Admin dashboard" and "Seller dashboard."
**Decision**: Since this is a single-store project (one seller = the store owner), a separate
seller dashboard is redundant. Admin dashboard covers all owner/staff needs.
**Consequence**: No multi-seller data model (no `sellers` table, no per-seller order splitting).
If this ever becomes a marketplace, this will need to be revisited.

---

### D-002: Next.js App Router + Supabase over a separate backend
**Context**: Needed to choose an architecture that's fast to build and cheap to run for an MVP.
**Decision**: Use Next.js for both frontend and backend logic (Server Actions/Route Handlers),
Supabase for Postgres + Auth + Storage, instead of a separate Express/NestJS API + custom auth.
**Trade-off**: Less flexibility than a fully custom backend, but far less boilerplate and faster
to ship. Revisit only if we outgrow Supabase's limits (unlikely at MVP scale).

---

### D-003: Stripe webhook is the source of truth for payment success
**Context**: Client-side redirect after payment can be spoofed, delayed, or interrupted (closed tab, network drop).
**Decision**: Order is only marked `paid` — and stock only decremented — inside the verified
Stripe webhook handler, never on the client-side success redirect alone.
**Consequence**: Slightly more setup (webhook + signature verification, local testing via Stripe CLI),
but eliminates a whole class of "I paid but my order shows pending" bugs and fraud risk.

---

### D-004: Row Level Security (RLS) on every table, no exceptions
**Context**: Supabase's client SDK can be called directly from the browser, so the database itself
must enforce access control, not just the app's UI.
**Decision**: RLS enabled on all tables from day one; `payments` table has no client policy at all
(server-only, via service role key).
**Consequence**: Slightly more upfront policy-writing, but removes an entire category of
"forgot to check permissions in the API" bugs.

---

### D-005: Lean MVP scope — cut variants, multi-currency, recommendations
**Context**: Full feature list included things like product variants and richer personalization.
**Decision**: Deferred (see `01-project-overview.md` → Out of Scope) to get a working, sellable
store shipped first.
**Consequence**: Product model for MVP treats each product as a single SKU. Revisit schema
(`05-database-design.md`) if variants are added later — will need a `product_variants` table.

---

### D-006: Chapa over Stripe for payments
**Context**: This is an Ethiopia-based single store; customers pay in Birr (ETB) via local bank
transfer and mobile money (Telebirr, CBE Birr, etc.), which Stripe does not support.
**Decision**: Use Chapa as the payment provider. Server initializes each transaction via
`transaction/initialize`, redirects the customer to Chapa's hosted checkout, and — on
webhook/callback — independently calls Chapa's `transaction/verify/{tx_ref}` before marking an
order paid (same "never trust the callback alone" principle used for Stripe in the original design).
**Consequence**: No card-only assumption in the checkout UI/copy; amounts are always in ETB.
Refunds are handled manually via Chapa's dashboard/API for MVP rather than a fully automated flow.

---

### D-007: Recommendations kept simple (category-based) for MVP
**Context**: True personalized recommendations (collaborative filtering, ML-based) need
meaningful order/browsing history volume and add real engineering cost.
**Decision**: MVP "recommendations" = same-category products on the product detail page, plus
optional "you may also like" on cart/confirmation pages. No ML, no separate recommendations table.
**Consequence**: Cheap to build, works from day one with zero data. Revisit only once there's
enough order volume to make a smarter engine worthwhile — track this as a fast-follow, not a
blocker for launch.

---

*(Add new entries below as decisions are made — keep them short: context, decision, consequence.)*
