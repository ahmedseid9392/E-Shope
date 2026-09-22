# 03 — Use Cases

Written as short user stories: **As a [role], I want [action], so that [benefit].**
Each maps back to FR IDs in `02-requirements.md`.

## Customer

| ID | Story | Related FR |
|----|-------|-------------|
| UC-1 | As a visitor, I want to browse products without an account, so I can decide if I want to buy. | FR-10, FR-11 |
| UC-2 | As a visitor, I want to sign up, so I can check out and track orders. | FR-1 |
| UC-3 | As a customer, I want to search/filter products, so I can find what I need quickly. | FR-10, FR-11, FR-12 |
| UC-4 | As a customer, I want to add items to my cart, so I can buy multiple things at once. | FR-13, FR-14 |
| UC-5 | As a customer, I want to check out securely with a card, so I can complete my purchase. | FR-20, FR-21 |
| UC-6 | As a customer, I want to see my order status, so I know when to expect delivery. | FR-18 |
| UC-7 | As a customer, I want to leave a review on something I bought, so I can share feedback. | FR-23 |
| UC-8 | As a customer, I want an email when my order ships, so I don't have to check the site. | FR-25 |
| UC-8a | As a customer, I want to see my recent searches, so I can quickly get back to what I was browsing. | FR-12a |
| UC-8b | As a customer, I want to see new arrivals and current deals on the home page, so I discover fresh/discounted products. | FR-12d, FR-12g |
| UC-8c | As a customer, I want to see related products on a product page, so I can find similar items I might like. | FR-12h |
| UC-8d | As a customer, I want to pay in Birr via bank/mobile money or card through Chapa, so I can check out using a payment method I actually have. | FR-20 |

## Admin (Store Owner/Staff)

| ID | Story | Related FR |
|----|-------|-------------|
| UC-9 | As an admin, I want to log in to a protected dashboard, so only I can manage the store. | FR-5, FR-27 |
| UC-10 | As an admin, I want to add/edit/delete products, so the catalog stays accurate. | FR-6, FR-7, FR-8 |
| UC-11 | As an admin, I want to view and update order statuses, so customers get correct info. | FR-19 |
| UC-12 | As an admin, I want to see basic sales stats, so I understand store performance. | FR-28 |
| UC-13 | As an admin, I want to moderate reviews, so spam/abuse doesn't stay visible. | FR-24 |

## Primary Flow — Checkout (UC-5, the critical path)
1. Customer has items in cart → clicks "Checkout."
2. App shows shipping address form (or uses saved one).
3. Server creates an order (`status: pending`), generates a unique `tx_ref`, and calls Chapa's
   `transaction/initialize` endpoint with amount (in ETB), customer info, and `tx_ref`.
4. Customer is redirected to the Chapa-hosted checkout page, pays via bank transfer, mobile
   money (Telebirr/CBE Birr/etc.), or card.
5. Chapa redirects the customer back to `return_url`, and separately sends a webhook/callback to our server.
6. Webhook handler independently calls Chapa's `transaction/verify/{tx_ref}` endpoint to confirm
   status server-to-server, then marks the order `paid`, decrements stock, and triggers a confirmation email.
7. Customer lands on an order confirmation page.

> Note: Step 6 (server-side verify call) is the *source of truth* for payment success — the
> redirect in step 5 is only used to bring the customer back to the UI, never trusted on its own.
