# Requirements

## Project Overview

**Project name:** `[Your Store Name]` — replace this before launch.

**Problem:** Small brands/single-seller shops need a fast, low-cost way to sell online without
the overhead of a full marketplace platform.

**Target users:**
- **Customers** — browse and buy products from this one store.
- **Store Admin** (owner/staff) — manages products, orders, and sales data. There is no separate
  "seller" role — this is a single-store project, not a marketplace (see `architecture.md`, D-001).

**Main goal:** Ship a production-ready single-store ecommerce app where a customer can discover
products, cart them, pay via Chapa (ETB, bank transfer, mobile money, or card), and track their
order — and the admin can manage inventory and fulfill orders from a dashboard.

**MVP scope (in):** auth, product catalog + search (autocomplete, recent searches), new arrivals,
product discounts, related-product recommendations, cart, checkout + Chapa payments, order
history/status, reviews, email notifications, admin dashboard.

**Out of scope (for MVP):** multi-vendor/seller onboarding, subscriptions, multi-currency/language,
a full recommendation engine, native mobile apps.

**Success criteria:**
- Customer can go from landing page → product → cart → paid order in under 5 clicks.
- Admin can add a product and see it live on the storefront in under 1 minute.
- Checkout completes with a real Chapa payment (sandbox mode) end-to-end.

---

## Functional Requirements

`P0` = must-have for MVP, `P1` = nice-to-have, `P2` = later.

### Authentication
- FR-1 (P0): Sign up with email + password.
- FR-2 (P0): Log in / log out.
- FR-3 (P0): Passwords handled entirely by Supabase Auth.
- FR-4 (P1): Password reset via email.
- FR-5 (P0): Admin role is a flag on the profile, enforced via RLS + server-side checks.

### Product Management
- FR-6 (P0): Admin can create/edit/delete products (name, price, description, images, stock, category).
- FR-7 (P0): Out-of-stock products are visible but not purchasable.
- FR-8 (P0): Products belong to a category.
- FR-9 (P1): Product variants (size/color) — stubbed as single SKU for MVP.

### Search
- FR-10 (P0): Search products by name/keyword.
- FR-11 (P0): Filter by category and price range.
- FR-12 (P1): Sort by price, newest, rating.
- FR-12a (P0): Recent searches (last 5–10) shown when the search box is focused.
- FR-12b (P1): Autocomplete suggestions while typing.
- FR-12c (P2): Trending searches shown when the search box is empty.

### New Arrivals & Discounts
- FR-12d (P0): Home page "New Arrivals" section — most recently added active products.
- FR-12e (P0): Admin can set a discount (sale price) with an optional start/end date.
- FR-12f (P0): Discounted products show original price (strikethrough) + sale price + badge.
- FR-12g (P1): Home page "Deals" section listing currently-discounted products.

### Recommendations
- FR-12h (P0): "Related products" on product detail — same category, excludes current product.
- FR-12i (P1): "You may also like" on cart/order-confirmation pages.
- FR-12j (P2): Personalized recommendations based on history — deferred, see `architecture.md` D-007.

### Cart
- FR-13 (P0): Add/remove/update quantity of cart items.
- FR-14 (P0): Cart persists in the DB for logged-in users.
- FR-15 (P1): Guest cart (local storage) merges into DB cart on login.

### Orders
- FR-16 (P0): Checkout creates an order with line items, total, address, status.
- FR-17 (P0): Status flow: `pending → paid → shipped → delivered` (+ `cancelled`).
- FR-18 (P0): Customer can view order history and order detail/status.
- FR-19 (P0): Admin can view all orders and update status.

### Payments
- FR-20 (P0): Checkout integrates Chapa (sandbox mode for MVP) — ETB, bank transfer, mobile money, cards.
- FR-21 (P0): Order marked `paid` only after a server-side verify call to Chapa confirms it.
- FR-21a (P0): Every transaction has a unique `tx_ref`, used to reconcile the verify response.
- FR-22 (P1): Refunds handled manually via Chapa's dashboard/API for MVP.

### Reviews
- FR-23 (P0): Logged-in customer who purchased a product can leave a rating + text review.
- FR-24 (P1): Admin can moderate/delete reviews.

### Notifications
- FR-25 (P0): Email on order confirmation and status change.
- FR-26 (P2): In-app notification bell.

### Admin Dashboard
- FR-27 (P0): Admin-only route, protected by role check.
- FR-28 (P0): Product CRUD, order list/detail, basic stats.
- FR-29 (P1): Sales-over-time chart.

---

## Non-Functional Requirements
- NFR-1: Customer-facing pages load in < 2s on a typical connection.
- NFR-2: All admin actions and payment logic run server-side — never trust client input for price/stock.
- NFR-3: Database access controlled by RLS — no table is fully open.
- NFR-4: Fully responsive, mobile-first.
- NFR-5: All secrets live in environment variables, never in client code.
- NFR-6: Automated tests exist for checkout and auth flows before launch (see `testing.md`).

---

## Use Cases

| ID | Story | Related FR |
|----|-------|-------------|
| UC-1 | As a visitor, I want to browse products without an account, so I can decide if I want to buy. | FR-10, FR-11 |
| UC-2 | As a visitor, I want to sign up, so I can check out and track orders. | FR-1 |
| UC-3 | As a customer, I want to search/filter products, so I can find what I need quickly. | FR-10–FR-12 |
| UC-4 | As a customer, I want to add items to my cart, so I can buy multiple things at once. | FR-13, FR-14 |
| UC-5 | As a customer, I want to check out securely, so I can complete my purchase. | FR-20, FR-21 |
| UC-6 | As a customer, I want to see my order status, so I know when to expect delivery. | FR-18 |
| UC-7 | As a customer, I want to leave a review on something I bought, so I can share feedback. | FR-23 |
| UC-8 | As a customer, I want an email when my order ships, so I don't have to check the site. | FR-25 |
| UC-8a | As a customer, I want to see my recent searches, so I can quickly get back to what I was browsing. | FR-12a |
| UC-8b | As a customer, I want to see new arrivals and deals on the home page, so I discover fresh/discounted products. | FR-12d, FR-12g |
| UC-8c | As a customer, I want to see related products on a product page, so I can find similar items. | FR-12h |
| UC-8d | As a customer, I want to pay in Birr via bank/mobile money or card, so I can use a payment method I actually have. | FR-20 |
| UC-9 | As an admin, I want to log in to a protected dashboard, so only I can manage the store. | FR-5, FR-27 |
| UC-10 | As an admin, I want to add/edit/delete products, so the catalog stays accurate. | FR-6–FR-8 |
| UC-11 | As an admin, I want to view and update order statuses, so customers get correct info. | FR-19 |
| UC-12 | As an admin, I want to see basic sales stats, so I understand store performance. | FR-28 |
| UC-13 | As an admin, I want to moderate reviews, so spam/abuse doesn't stay visible. | FR-24 |

### Primary flow — Checkout (UC-5, the critical path)
1. Customer has items in cart → clicks "Checkout."
2. Server creates an order (`pending`), generates a unique `tx_ref`, calls Chapa's
   `transaction/initialize` endpoint.
3. Customer is redirected to Chapa's hosted checkout, pays via bank/mobile money/card.
4. Chapa redirects back to the app *and* sends a webhook.
5. Webhook handler independently calls Chapa's `transaction/verify/{tx_ref}` before marking the
   order `paid`, decrementing stock, and sending a confirmation email.
6. Customer lands on an order confirmation page.

> The server-side verify call is the source of truth — the redirect is only used to bring the
> customer back to the UI.
