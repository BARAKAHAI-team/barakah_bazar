# Barakah Bazaar

A customer-facing e-commerce storefront (India, INR, English, mobile-first) built with Next.js (App Router), Tailwind CSS, Supabase (Postgres, Auth, Storage, RLS), and Razorpay.

The store features three distinct product categories:
1. **Barakah Bridal Collections** (`bridal`) – Bridal wear with sizes, colours, and occasion filtering.
2. **Barakah Naturals** (`naturals`) – Farm-direct natural spices and products with pack sizes and unit pricing.
3. **Barakah Kerala Pure Coconut Oil** (`coconut-oil`) – Pure coconut oil in pack sizes.

---

## Tech Stack & Architecture

- **Framework**: Next.js (App Router, TypeScript strict)
- **Styling**: Tailwind CSS with custom CSS variable design tokens and strict visual restraint
- **Database & Auth**: Supabase (Postgres, RLS on every table, phone OTP authentication)
- **Payments**: Razorpay (Checkout.js + Server API + Webhook signature verification)
- **Testing**: Vitest

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ (v22 recommended)
- npm 10+
- A Supabase account (or local Supabase CLI)
- A Razorpay account (test mode)

### 2. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the following variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public API key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service_role key (server-only).
- `OTP_HMAC_SECRET`: A long random secret string (min 16 chars).
- `DEV_OTP_MODE`: Set to `true` for local development (shows OTP in browser console).
- `RAZORPAY_KEY_ID`: Razorpay Key ID (`rzp_test_...`).
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Same key ID for client checkout.
- `RAZORPAY_KEY_SECRET`: Razorpay Secret Key.
- `RAZORPAY_WEBHOOK_SECRET`: Razorpay Webhook secret.
- `JOBS_SECRET`: Secret token for notification worker endpoints.

> **Security Guard**: The application will refuse to start if `DEV_OTP_MODE=true` when `NODE_ENV=production`.

### 3. Database Setup

Migrations and seed data are located in `supabase/migrations/` and `supabase/seed.sql`.
You can execute them in your Supabase SQL Editor or using the Supabase CLI:
```bash
# If using Supabase CLI locally:
supabase db reset
```

### 4. Running Locally

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

- `npm run dev` – Starts the development server.
- `npm run build` – Creates the production build.
- `npm run start` – Runs the built production application.
- `npm run lint` – Runs ESLint.
- `npm run typecheck` – Runs TypeScript checks (`tsc --noEmit`).
- `npm run test` – Runs unit tests via Vitest.
- `npm run db:types` – Regenerates Supabase TypeScript database types.

---

## Development OTP Mode

During local development (`DEV_OTP_MODE=true`), no SMS gateway is required.
When a user requests an OTP on `/login`, the OTP is:
1. Logged to the server console (`[DEV OTP] +91... -> 123456`).
2. Returned in the API JSON response so the client code logs it to the browser developer console (`console.log('[DEV OTP]', devOtp)`).
3. The UI informs the user to check the console.
