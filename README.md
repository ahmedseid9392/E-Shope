<div align="center">

# My Store

**A full-stack single-store e-commerce application built with Next.js and Supabase.**

Customer storefront, product and order management, secure checkout, and an admin dashboard — with Chapa payment integration for Ethiopian Birr (ETB).

</div>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#technology-stack">Technology</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#deployment">Deployment</a>
</p>

---

## Overview

My Store is a single-store e-commerce application. The Next.js application provides the storefront, administrative interface, and server-side application logic. Supabase provides PostgreSQL and authentication, while Chapa handles payment initialization and verification.

The repository's `backend/` directory contains Supabase configuration, database migrations, and seed data. It is not a separate Express or Node.js API server.

## Features

### Customer experience
- Browse products and view product details.
- Search and filter the product catalog.
- Add products to a cart and manage quantities.
- Create an account, sign in, and manage account information.
- Sign in with Google.
- Manage a wishlist.
- Submit and view product ratings and reviews.
- Place orders and view order history and order details.
- Contact the store through the contact form.

### Checkout and payments
- Server-side order creation and validation.
- Chapa payment initialization in ETB.
- Payment callback and webhook route handlers.
- Server-side transaction verification before an order is marked as paid.
- Order and inventory updates through database operations.

> Payment processing should be tested in Chapa sandbox mode before enabling live credentials. Review the security and deployment documentation before production launch.

### Administration
- Admin dashboard with order and store information.
- Create, edit, and delete products.
- View and manage customer information.
- View orders and update order statuses.
- Manage store settings.
- Review low-stock information.

### Integrations
- Supabase PostgreSQL and Supabase Auth.
- Cloudinary for product image uploads.
- Chapa for payment processing.
- Nodemailer with Gmail SMTP for application email.
- Docker and Docker Compose for local containerized frontend runs.

## Screenshots

Add screenshots captured from the running application to `docs/screenshots/`. The screenshot files are not included in the supplied project archive.

Suggested screenshots:

| Screen | Suggested filename |
|---|---|
| Storefront / home page | `storefront.png` |
| Product catalog | `products.png` |
| Product details | `product-details.png` |
| Shopping cart | `cart.png` |
| Checkout | `checkout.png` |
| Admin dashboard | `admin-dashboard.png` |
| Admin product management | `admin-products.png` |

After adding the image files, uncomment and update the relevant Markdown image references below:

<!--
### Storefront

![Storefront](docs/screenshots/storefront.png)

### Product catalog

![Product catalog](docs/screenshots/products.png)

### Product details

![Product details](docs/screenshots/product-details.png)

### Shopping cart and checkout

![Shopping cart](docs/screenshots/cart.png)

![Checkout](docs/screenshots/checkout.png)

### Admin dashboard

![Admin dashboard](docs/screenshots/admin-dashboard.png)

### Admin product management

![Admin product management](docs/screenshots/admin-products.png)
-->

Before committing screenshots, remove or obscure private information such as customer names, email addresses, phone numbers, delivery addresses, order identifiers, and credentials.

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js 14.2 |
| UI library | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Validation | Zod |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Database access control | PostgreSQL Row Level Security (RLS) |
| Image hosting | Cloudinary |
| Payments | Chapa |
| Email | Nodemailer and Gmail SMTP |
| Charts | Recharts |
| Testing | Vitest, Playwright |
| Containerization | Docker, Docker Compose |
| Deployment | Vercel |

## Architecture

The application follows a Next.js full-stack architecture. Pages and UI components run in the Next.js application, while Server Actions and Route Handlers implement server-side operations.

```text
                         Customer / Admin
                                |
                                v
                       Next.js Application
                       (Vercel deployment)
                                |
              +-----------------+------------------+
              |                 |                  |
              v                 v                  v
        Supabase Auth     Supabase Database     Route Handlers
                               (RLS)                  |
                                                     Chapa
                                                      |
                                                Payment events

              Next.js server integrations
                    |               |
                    v               v
                Cloudinary       Gmail SMTP
```

### Main application areas

- `app/` — Next.js App Router pages and API route handlers.
- `components/` — reusable UI components.
- `lib/actions/` — server-side application actions.
- `lib/payments/` — payment confirmation logic.
- `lib/supabase/` — Supabase client and server utilities.
- `lib/validations/` — validation schemas.
- `backend/supabase/migrations/` — versioned database schema and policy changes.

## Repository Structure

The supplied archive contains the frontend as `front.zip`. Extract it into a directory named `frontend/` at the repository root so the project has this structure:

```text
my-store/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
├── backend/
│   └── supabase/
│       ├── migrations/
│       ├── functions/
│       ├── config.toml
│       └── seed.sql
├── docker/
│   ├── frontend.Dockerfile
│   └── README.md
├── docs/
│   ├── screenshots/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── deployment.md
│   ├── security.md
│   └── testing.md
├── docker-compose.yml
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 22 recommended.
- npm.
- Git.
- Supabase CLI for local Supabase development.
- Docker Desktop if you want to run the frontend in a container.

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd my-store
```

If you are starting from the supplied archive, extract `front.zip` into `frontend/`:

```powershell
Expand-Archive -Path .\front.zip -DestinationPath .\frontend
```

### 2. Start the local Supabase environment

```bash
cd backend
supabase start
supabase db reset
```

The Supabase CLI displays the local API URL and anon key. Use these values in the frontend environment file.

`supabase db reset` applies the local migrations and seed data. The seed data is for local development only; do not run it against a production database.

### 3. Configure frontend environment variables

Create `frontend/.env.local` and configure the variables listed in [Environment Variables](#environment-variables).

Do not commit `.env.local` or any file containing real credentials.

### 4. Install dependencies and start Next.js

From the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available frontend scripts

Run these commands from `frontend/`:

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run Next.js lint checks
npm test          # Run Vitest tests
```

## Environment Variables

Configure local variables in `frontend/.env.local`. For Vercel, add them in **Project Settings → Environment Variables**.

| Variable | Purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key used by the application | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side privileged Supabase operations | **Secret — server only** |
| `CHAPA_SECRET_KEY` | Chapa payment API authentication | **Secret — server only** |
| `CHAPA_WEBHOOK_SECRET` | Chapa webhook verification, when configured | **Secret — server only** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Public |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Public |
| `NEXT_PUBLIC_SITE_URL` | Application base URL used by the application | Public |
| `GMAIL_USER` | Gmail SMTP account | Server configuration |
| `GMAIL_APP_PASSWORD` | Gmail App Password | **Secret — server only** |
| `EMAIL_FROM` | Optional sender address used by email configuration | Server configuration |

Only values intentionally prefixed with `NEXT_PUBLIC_` should be exposed to the browser. Never expose service-role keys, payment secrets, webhook secrets, or email credentials in client-side code or public repository files.

## Docker

Docker is provided for running the Next.js frontend in a local container. Supabase is managed separately by the Supabase CLI; it is not part of the root Docker Compose application.

From the repository root, configure the environment variables required by the Compose file, then run:

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
docker compose ps
docker compose logs -f frontend
docker compose down
```

See [`docker/README.md`](docker/README.md) and [`docs/deployment.md`](docs/deployment.md) for additional details.

## Deployment

### Vercel — Next.js application

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Set the Vercel **Root Directory** to `frontend`.
4. Select Next.js as the framework. Keep the default build and output settings unless your project configuration requires otherwise.
5. Add the required environment variables in Vercel Project Settings.
6. Deploy and review the build logs.
7. Configure the production site URL and Supabase authentication redirect URLs.
8. Test customer authentication, product browsing, image loading, checkout, payment verification, and administrative workflows.

Vercel deploys the Next.js application directly. The Docker image and `docker-compose.yml` are for local containerized runs; they are not required for the standard Vercel deployment.

### Supabase — database and authentication

Use a separate Supabase project for production. Link the local CLI to the intended project and apply the committed migrations:

```bash
cd backend
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Review the migration changes and production database before applying them. Do not run the development seed file against production.

Configure the production Supabase Site URL and allowed authentication redirect URLs to match your deployed domain.

### Chapa — payments

- Start with Chapa sandbox credentials.
- Configure the callback and webhook endpoints for the deployed domain.
- Verify transactions on the server before marking orders as paid.
- Test the complete checkout flow, including order status and stock updates.
- Enable live credentials only after successful end-to-end sandbox testing.

The webhook endpoint implemented by this project is:

```text
https://YOUR_DOMAIN/api/webhooks/chapa
```

For the full deployment workflow, see [`docs/deployment.md`](docs/deployment.md).

## Security Notes

- Keep service-role keys and integration secrets on the server.
- Keep Row Level Security enabled and review policies for every application table.
- Validate sensitive operations on the server; do not rely only on client-side validation.
- Confirm payment status through server-side provider verification, not only through a browser redirect.
- Do not commit `.env.local`, credentials, private customer data, or production database dumps.
- Review [`docs/security.md`](docs/security.md) before production deployment.

## Project Documentation

| Document | Description |
|---|---|
| [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) | Implementation phases and build order |
| [`docs/requirements.md`](docs/requirements.md) | Project requirements |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and design decisions |
| [`docs/database.md`](docs/database.md) | Database design and schema rationale |
| [`docs/api.md`](docs/api.md) | Application API and Server Action documentation |
| [`docs/security.md`](docs/security.md) | Authentication, authorization, RLS, and payment security |
| [`docs/testing.md`](docs/testing.md) | Testing strategy |
| [`docs/deployment.md`](docs/deployment.md) | Environments and deployment workflow |
| [`backend/README.md`](backend/README.md) | Supabase local development |
| [`docker/README.md`](docker/README.md) | Docker setup |

## License

No license file was included in the supplied project archive. Add a `LICENSE` file if you intend to distribute or reuse this project under an open-source license.
