# API Specification

Using Next.js **Route Handlers** for external-facing/webhook endpoints and **Server Actions**
for internal app mutations (cart, checkout, admin CRUD). Listed here as if they were REST
endpoints for clarity.

## Auth
Handled by Supabase Auth client SDK directly (no custom endpoints needed):
- Sign up / sign in / sign out / password reset — via `supabase.auth.*` calls.

## Products
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| GET | `/api/products` | Public | List products (query: search, category, price range, sort) |
| GET | `/api/products/[slug]` | Public | Product detail |
| GET | `/api/products/[slug]/related` | Public | Related products (same category) |
| GET | `/api/products/new-arrivals` | Public | Most recently added active products |
| GET | `/api/products/deals` | Public | Currently-discounted active products |
| POST | `/api/admin/products` | Admin | Create product |
| PATCH | `/api/admin/products/[id]` | Admin | Update product (incl. `sale_price`, sale window) |
| DELETE | `/api/admin/products/[id]` | Admin | Delete (soft-delete via `is_active`) |

## Search
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| GET | `/api/search/suggestions` | Public | Autocomplete suggestions as user types (query: `q`) |
| GET | `/api/search/recent` | Authenticated | Current user's last 5–10 searches |
| POST | `/api/search/recent` | Authenticated | Log a search query `{ query }` |
| GET | `/api/search/trending` | Public | Most-searched terms across all users (aggregated) |

## Cart
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| GET | `/api/cart` | Authenticated | Get current user's cart |
| POST | `/api/cart` | Authenticated | Add item `{ product_id, quantity }` |
| PATCH | `/api/cart/[itemId]` | Authenticated | Update quantity |
| DELETE | `/api/cart/[itemId]` | Authenticated | Remove item |

## Checkout / Orders
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| POST | `/api/checkout` | Authenticated | Creates a `pending` order + a Chapa transaction (`transaction/initialize`), returns Chapa checkout redirect URL |
| GET | `/api/checkout/return` | Public (browser redirect target) | Where Chapa sends the customer back; shows a "confirming payment" state, does **not** itself mark the order paid |
| POST | `/api/webhooks/chapa` | Chapa only (signature-verified) | On event, calls Chapa's verify-transaction endpoint server-to-server, then marks order paid, decrements stock, sends email |
| GET | `/api/orders` | Authenticated | Current user's order history |
| GET | `/api/orders/[id]` | Authenticated (own order) or Admin | Order detail |
| PATCH | `/api/admin/orders/[id]` | Admin | Update status (shipped/delivered/cancelled) |

## Reviews
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| GET | `/api/products/[id]/reviews` | Public | List reviews for product |
| POST | `/api/products/[id]/reviews` | Authenticated (must have delivered order) | Submit review |
| DELETE | `/api/admin/reviews/[id]` | Admin | Remove review |

## Admin
| Method | Path | Access | Description |
|--------|------|--------|--------------|
| GET | `/api/admin/stats` | Admin | Total sales, order count, top products |

## Conventions
- All error responses: `{ "error": { "code": string, "message": string } }`.
- All list endpoints support pagination via `?page=&limit=` (default limit 20).
- Every admin/write endpoint re-validates the user's `is_admin` server-side — never trust a
  client-side role flag.
- The Chapa webhook route verifies the request signature (HMAC) before processing anything, and
  then makes its own server-to-server call to Chapa's verify-transaction endpoint before trusting
  the event — the webhook payload alone is never sufficient to mark an order paid.
