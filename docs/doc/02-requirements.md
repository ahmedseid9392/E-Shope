# 02 — Requirements

Format: **FR** = Functional Requirement, **NFR** = Non-Functional Requirement.
Priority: `P0` = must-have for MVP, `P1` = nice-to-have, `P2` = later.

## Authentication
- FR-1 (P0): User can sign up with email + password.
- FR-2 (P0): User can log in / log out.
- FR-3 (P0): Passwords handled entirely by Supabase Auth (never stored/hashed manually).
- FR-4 (P1): Password reset via email.
- FR-5 (P0): Admin role is a flag on the user profile, checked via Supabase RLS + middleware.

## Product Management
- FR-6 (P0): Admin can create, edit, delete products (name, price, description, images, stock, category).
- FR-7 (P0): Product has stock quantity; out-of-stock products are shown but not purchasable.
- FR-8 (P0): Products belong to a category.
- FR-9 (P1): Support product variants (size/color) — can be stubbed as a single SKU for MVP.

## Search
- FR-10 (P0): Customer can search products by name/keyword.
- FR-11 (P0): Customer can filter by category and price range.
- FR-12 (P1): Sort by price, newest, rating.
- FR-12a (P0): Customer sees their recent searches (last 5–10) when they focus the search box.
- FR-12b (P1): Autocomplete/suggestions appear as the customer types (matching product names/categories).
- FR-12c (P2): "Trending searches" — most-searched terms across all users, shown when search box is empty.

## New Arrivals & Discounts
- FR-12d (P0): Home page has a "New Arrivals" section — most recently added active products.
- FR-12e (P0): Admin can set a discount (sale price or % off) on any product, with an optional start/end date.
- FR-12f (P0): Discounted products show original price (strikethrough) + sale price + a "Sale" badge, storefront-wide.
- FR-12g (P1): Home page has a "Deals" section listing currently-discounted products.

## Recommendations
- FR-12h (P0): Product detail page shows "Related products" — same category, excluding the current product.
- FR-12i (P1): Order confirmation / cart page shows "You may also like" based on category of items just purchased/added.
- FR-12j (P2): Personalized recommendations based on purchase + browsing history (deferred — see D-007).

## Cart
- FR-13 (P0): Customer can add/remove/update quantity of items in cart.
- FR-14 (P0): Cart persists for logged-in users (stored in DB, not just local state).
- FR-15 (P1): Guest cart (local storage) merges into DB cart on login.

## Orders
- FR-16 (P0): Checkout creates an order with line items, total, shipping address, status.
- FR-17 (P0): Order status flow: `pending → paid → shipped → delivered` (+ `cancelled`).
- FR-18 (P0): Customer can view their order history and order detail/status.
- FR-19 (P0): Admin can view all orders and update order status.

## Payments
- FR-20 (P0): Checkout integrates Chapa (test/sandbox mode for MVP) — supports payment via ETB, bank transfer, mobile money (Telebirr, CBE Birr, etc.) and cards.
- FR-21 (P0): Order is only marked `paid` after Chapa's webhook/callback confirms payment — never on client-side redirect alone.
- FR-21a (P0): Every transaction has a unique `tx_ref`; before trusting a webhook, the server independently calls Chapa's verify-transaction endpoint to confirm status.
- FR-22 (P1): Support refunds from admin dashboard (manual, via Chapa dashboard/API where supported).

## Reviews
- FR-23 (P0): Logged-in customer who purchased a product can leave a rating (1–5) + text review.
- FR-24 (P1): Admin can moderate/delete reviews.

## Notifications
- FR-25 (P0): Email sent on order confirmation and on status change (shipped/delivered).
- FR-26 (P2): In-app notification bell for order updates.

## Admin Dashboard
- FR-27 (P0): Admin-only route, protected by role check.
- FR-28 (P0): Views: product list/CRUD, order list/detail, basic stats (total sales, order count).
- FR-29 (P1): Basic charts (sales over time).

---

## Non-Functional Requirements
- NFR-1: All customer-facing pages load in < 2s on a typical connection.
- NFR-2: All admin actions and payment logic run server-side (Server Actions/Route Handlers) — never trust client input for price/stock.
- NFR-3: Database access controlled by Supabase Row Level Security (RLS) — no table is fully open.
- NFR-4: App must be usable on mobile viewports (responsive).
- NFR-5: All secrets (Stripe keys, Supabase service role key) live in environment variables, never in client code.
- NFR-6: Basic automated tests exist for checkout and auth flows before launch (see `09-testing.md`).
