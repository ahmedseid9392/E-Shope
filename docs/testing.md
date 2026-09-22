# Testing Strategy

Lean MVP approach: focus test effort on the paths that lose money or trust if broken
(checkout, auth, order status) — not 100% coverage everywhere.

## Levels

| Level | Tool | What it covers |
|-------|------|-----------------|
| Unit | Vitest / Jest | Utility functions, price calculations, Zod schemas |
| Integration | Vitest + Supabase local/test project | Server Actions (create order, update stock), RLS policy checks |
| E2E | Playwright | Full flows: signup → browse → cart → checkout (Chapa sandbox mode) → order confirmation |

## Must-have tests before launch (P0)
1. Signup/login works; unauthenticated user is redirected from admin routes.
2. Add to cart → quantity updates correctly → cart total is correct.
3. Checkout creates an order with correct total; stock is **not** decremented until the webhook
   fires *and* the server-side verify call confirms `paid`.
4. Chapa webhook (simulated) triggers a verify call and marks order `paid`, decrements stock
   exactly once (idempotency check — webhook events can be sent more than once for the same `tx_ref`).
5. A forged/unsigned webhook request is rejected without touching the order.
6. Admin can update order status; customer sees the updated status.
7. RLS: a logged-in user cannot read another user's orders, cart, or search history (test via
   direct Supabase query, not just UI).
8. Discount display: a product with an active `sale_price` shows the discounted price and badge;
   an expired sale window falls back to regular `price`.
9. New arrivals and related-products queries return the expected set/order for known seed data.

## Nice-to-have (P1/P2)
- Review submission only allowed for delivered orders.
- Search/filter returns correct results for edge cases (empty search, no matches).
- Load test on product listing page.

## Environments
- **Local**: Supabase local dev (via CLI) + a tunnel (e.g. ngrok) so Chapa's sandbox can reach your local webhook route.
- **Staging**: Separate Supabase project + Chapa test/sandbox mode, deployed on a Vercel preview branch.
- **Production**: Supabase prod project + Chapa live mode.
