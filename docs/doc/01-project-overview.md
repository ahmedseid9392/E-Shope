# 01 — Project Overview

## Project Name
`[Your Store Name]` — *(replace this placeholder before you start coding)*

## Problem
Small brands/single-seller shops need a fast, low-cost way to sell products online without
the overhead of a full marketplace platform (no multi-seller complexity, no commission logic).
Off-the-shelf platforms (Shopify, etc.) are either expensive at scale or too rigid for custom flows.

## Target Users
- **Customers** — people browsing and buying products from this one store.
- **Store Admin (owner/staff)** — manages products, orders, and views sales data.
  *(No separate "seller" role — see decision D-001 in `11-decisions.md`.)*

## Main Goal
Ship a production-ready single-store ecommerce web app where a customer can discover products,
add them to a cart, check out with a real payment provider, and track their order — and the
store owner can manage inventory and fulfill orders from an admin dashboard.

## MVP Scope (in)
- Auth (customer signup/login, admin login)
- Product catalog + search/filter (with autocomplete, recent searches)
- New arrivals section
- Product discounts / sale pricing
- Basic recommendations ("related products" / "you may also like")
- Cart
- Checkout + payments (Chapa — supports ETB, bank transfer, mobile money)
- Order history + order status
- Product reviews
- Basic email notifications (order confirmation, status updates)
- Admin dashboard (products, orders, basic stats)

## Out of Scope (for MVP)
- Multi-vendor / seller onboarding
- Subscriptions / recurring billing
- Multi-currency / multi-language
- Advanced recommendation engine
- Native mobile apps

## Tech Stack (summary — full detail in `04-system-architecture.md`)
- **Frontend/Backend**: Next.js (App Router, Server Actions/Route Handlers)
- **Database/Auth/Storage**: Supabase (Postgres, Supabase Auth, Supabase Storage)
- **Payments**: Chapa (Ethiopian payment gateway — ETB, bank transfer, mobile money, cards)
- **Hosting**: Vercel (app) + Supabase Cloud (backend)

## Success Criteria
- A customer can go from landing page → product → cart → paid order in under 5 clicks.
- Admin can add a product and see it live on the storefront in under 1 minute.
- Checkout completes with a real Stripe payment (test mode) end-to-end.
