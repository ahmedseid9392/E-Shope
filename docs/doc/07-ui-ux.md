# 07 — UI / UX

## Storefront Pages
| Page | Path | Key elements |
|------|------|--------------|
| Home | `/` | Hero, "New Arrivals" carousel, "Deals" section (discounted products), featured products, category links |
| Product listing | `/products` | Grid, search bar (with autocomplete + recent searches dropdown), category/price filters, sort |
| Product detail | `/products/[slug]` | Images, price (or strikethrough + sale price if discounted), stock badge, add-to-cart, "Related products" section, reviews list |
| Cart | `/cart` | Line items, quantity controls, subtotal, checkout button |
| Checkout | `/checkout` | Shipping address form → redirect to Stripe |
| Order confirmation | `/orders/[id]?success=1` | Thank-you message, order summary |
| Order history | `/orders` | List of past orders with status badges |
| Order detail | `/orders/[id]` | Line items, status timeline, shipping info |
| Login / Signup | `/login`, `/signup` | Email + password form |

## Admin Pages
| Page | Path | Key elements |
|------|------|--------------|
| Dashboard | `/admin` | Sales total, order count, recent orders |
| Product list | `/admin/products` | Table, add/edit/delete actions |
| Product form | `/admin/products/[id]` (or `new`) | Name, price, stock, category, image upload |
| Order list | `/admin/orders` | Table with status filter |
| Order detail | `/admin/orders/[id]` | Line items, status dropdown to update |

## Core User Flow
```
Home (New Arrivals / Deals) → Product Listing (search + filters) → Product Detail (+ Related products)
  → Add to Cart → Cart → Checkout → Chapa Payment (bank/mobile money/card, in ETB)
  → Order Confirmation → Order History
```

## Search Behavior
- Focusing the search input (empty) shows: recent searches (if logged in) + trending searches.
- Typing shows live autocomplete suggestions (debounced, matching product names/categories).
- Submitting a search logs the query to `search_history` (logged-in users only).

## New Arrivals / Deals / Recommendations — Display Rules
- "New Arrivals": last N active products by `created_at`, shown as a horizontal carousel on home.
- "Deals": active products with a currently-active `sale_price`; each card shows a "Sale" badge
  and strikethrough original price.
- "Related products": shown on product detail page, same category, excludes current product.

## Design Principles for MVP
- Mobile-first responsive layout (most storefront traffic is mobile).
- Stock/availability always visible before add-to-cart is enabled.
- Order status shown as a clear step indicator (pending → paid → shipped → delivered).
- Prices displayed in ETB (Birr) formatting throughout.
- Admin UI can be simpler/plainer than storefront — function over polish for MVP.
- Use a component library (e.g. shadcn/ui + Tailwind) to move fast without custom CSS for every element.

> Wireframes/mockups are intentionally left out of this lean MVP doc — build directly in
> Tailwind components and refine visually once the core flow works end-to-end.
