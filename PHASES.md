# Barakah Bazaar: Phased Build Prompts

Use with `CONTEXT.md` in the repo root. Paste **one phase prompt at a time** into the agent. Each prompt is self-contained and always starts by telling the agent to read `CONTEXT.md`.

**Rules that apply to every phase** (they are repeated in each prompt so the agent never loses them):
- Read `CONTEXT.md` fully first. Follow it exactly. If anything conflicts or is unclear, stop and ask.
- Plan first (list the files you will create or change), then implement.
- Run `npm run typecheck`, `npm run lint`, `npm run build` and `npm test` before reporting. Fix failures.
- Run the anti-slop self-check from `CONTEXT.md` section 5.2 before reporting.
- Do not start the next phase. Report back and wait for "go to phase N".
- Do not invent business content. Use marked placeholders and record them in `TODO-CONTENT.md`.

| Phase | Goal |
| --- | --- |
| 0 | Scaffold, tooling, env, design tokens, base layout |
| 1 | Database: migrations, RLS, functions, seed data |
| 2 | Design system components and the category gate |
| 3 | Catalogue: listings, product page, search, SEO |
| 4 | Authentication: mobile OTP (console OTP), session, profile step |
| 5 | Wishlist and cart |
| 6 | Checkout: address with map pin, optional email, stock recheck, coupon |
| 7 | Payments (Razorpay) and orders |
| 8 | Notifications, reviews, account page |
| 9 | Hardening, QA, README, clean-up |

---

## Phase 0: Scaffold, tooling, tokens

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 0 of 9. Do only this phase.

GOAL
Create the project skeleton so every later phase has a stable base.

TASKS
1. Scaffold a Next.js app (App Router, TypeScript strict, Tailwind CSS, ESLint, `src/` directory, import alias `@/*`). Use npm.
2. Add scripts: dev, build, start, lint, typecheck (`tsc --noEmit`), test (vitest). Configure Vitest.
3. Install only the libraries allowed in CONTEXT.md section 2 that this phase needs: @supabase/supabase-js, @supabase/ssr, zod, lucide-react, clsx, vitest. (Leaflet and razorpay come later.)
4. Create the folder structure from CONTEXT.md section 15 (empty folders can hold a .gitkeep).
5. Environment:
   - `.env.example` with every variable from section 14, each with a short comment.
   - `src/lib/env.ts` validating env with zod: a server schema and a public schema. Fail fast with a clear message. Add `import 'server-only'` to server-only modules.
   - Add a startup guard that throws if DEV_OTP_MODE=true and NODE_ENV=production.
6. Supabase client helpers in `src/lib/supabase/`: `server.ts` (cookie-aware, @supabase/ssr), `client.ts` (browser), `admin.ts` (service role, server-only), `public.ts` (cookie-less anon client for cacheable catalog reads). Do not call them from pages yet.
7. Design tokens from CONTEXT.md section 5.3 in `globals.css` as CSS variables, mapped into the Tailwind theme (colours, radii max 2px, font families). Load Newsreader and Public Sans with next/font and expose them as CSS variables. Set body background to --bg and text to --ink. Add global focus-visible styling and `prefers-reduced-motion` handling.
8. Base `layout.tsx`: html lang="en-IN", fonts, a temporary minimal header (text wordmark "Barakah Bazaar") and footer (placeholder links to the static pages), a skip-to-content link, and a `<main id="main">`.
9. Home page `/` temporary stub: just an H1. (The real gate is Phase 2.)
10. Create `TODO-CONTENT.md` (empty headings per section 17) and a first `README.md` (project overview, how to run, env setup).
11. Add a tiny `lib/pricing/money.ts` with `formatINR(paise)` (en-IN, no decimals when the amount is whole rupees, otherwise 2 decimals) and a Vitest test for it.

DO NOT
- Do not build any real UI beyond the layout shell. Do not add pages other than the home stub.
- No gradients, blur, shadows or rounded corners above 2px. No emoji.

ACCEPTANCE
- `npm run dev` serves the stub at http://localhost:3000 without errors.
- typecheck, lint, build and the money test pass.
- Starting the app without required env vars fails with a clear message that lists the missing ones.
- The anti-slop self-check returns no hits.

REPORT BACK
List the files created, the exact versions of Next.js, React, Tailwind and Supabase libraries installed, any deviations from CONTEXT.md and why, and anything the user must do next (for example: create a Supabase project and fill `.env.local`).
```

---

## Phase 1: Database

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 1 of 9. Do only this phase.

PREREQUISITE
The user has a Supabase project (or local Supabase via the CLI) and has filled `.env.local`. If not, say exactly what is missing and stop.

GOAL
Create the complete database: schema, RLS, functions, views, storage bucket and seed data, all as migrations.

TASKS
1. Initialise the Supabase CLI structure if needed (`supabase/`). Write SQL migrations in `supabase/migrations/` (timestamped, small, ordered):
   a. extensions and helper functions (`set_updated_at` trigger function, `next_order_number()` backed by a sequence; format `BZ-YYMMDD-NNNN`).
   b. catalog tables: categories, products (with generated `search_vector` + GIN index), product_variants, product_images.
   c. user tables: profiles, otp_requests, cart_items, wishlist_items, addresses.
   d. commerce tables: orders, order_items, order_status_history, payments, coupons.
   e. reviews, notifications.
   f. views `public_reviews` and `product_rating_summary` exactly as in CONTEXT.md section 6 (safe columns only, readable by anon).
   g. all indexes from CONTEXT.md section 6, all CHECK constraints (price > 0, stock >= 0, qty > 0, pincode 6 digits, rating 1-5, enum-like status columns via CHECK).
   h. RLS: enable on EVERY table and write policies exactly per the table in CONTEXT.md section 7, including the review-insert policy that requires a DELIVERED order containing the product.
   i. the SQL function `confirm_payment(...)` exactly as specified in CONTEXT.md section 10 (one transaction, idempotent, security definer, EXECUTE granted to service_role only, revoked from public/anon/authenticated).
   j. Storage: public bucket `product-images` (public read; no client write policies).
2. Generate TypeScript types into `src/lib/supabase/database.types.ts` (`supabase gen types typescript`). Add an npm script `db:types`.
3. Seed data in `supabase/seed.sql`:
   - 3 categories with the exact slugs and names from CONTEXT.md section 1.
   - Bridal: 5 products, each with sizes (XS, S, M, L, XL) x 2 colours as variants (varied stock including some 0 and one low stock), prices in the range 15,000 to 90,000 rupees (stored as paise), attributes: fabric, work, care, occasion.
   - Naturals: 6 products (organic turmeric powder, organic chilli powder, and 4 other natural farm products), each with 3 pack-size variants (for example 100 g, 250 g, 500 g) with net_quantity and net_unit set, attributes: origin, ingredients, shelf_life. Do NOT add certifications or lab-report data (no real data exists).
   - Coconut oil: 2 products, each with 3 variants (for example 250 ml, 500 ml, 1 L).
   - Clearly fictional demo descriptions, flagged in a SQL comment as DEMO DATA TO BE REPLACED. No claims about health, certification or farmers.
   - `product_images` rows with `storage_path` NULL (UI will show the flat placeholder).
   - 3 coupons: a percent coupon with a cap, a flat coupon, and an expired one (for testing).
4. `supabase/dev/mark_delivered.sql`: a documented helper that sets a given order to DELIVERED and inserts the status-history row. Dev only.
5. `supabase/tests/rls.sql` (or a script) that proves, using two test users: user A cannot read user B's cart, orders or addresses; a user cannot insert into orders, payments or order_items; a user without a delivered order cannot insert a review; a user with one can, exactly once per product; anon can read active catalog rows and `public_reviews` but nothing else; `confirm_payment` cannot be executed by `authenticated`.
6. A Vitest or script test that calls `confirm_payment` twice for the same payment and proves: stock reduced exactly once, coupon used_count incremented once, cart lines removed, notification rows inserted, and a second call is a no-op.

DO NOT
- Do not build any UI or API routes in this phase.
- Do not weaken RLS to make a test pass. Fix the policy or the test.

ACCEPTANCE
- Migrations apply cleanly on an empty database and are re-runnable from scratch (`supabase db reset`).
- Seed loads. Every table has RLS enabled (include a query in the report that proves it).
- All tests from tasks 5 and 6 pass.
- Types generated and `npm run typecheck` passes.

REPORT BACK
List the migration files, show the query/result proving RLS is enabled on every table, paste the test results, list the seeded categories/products/coupon codes (so the user can test coupons later), and note any decision you made that CONTEXT.md did not cover.
```

---

## Phase 2: Design system and the category gate

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 2 of 9. Do only this phase.

GOAL
Build the shared UI components, the real site header/footer, and the category gate home page, following the design direction in CONTEXT.md section 5. The visual restraint rules in 5.2 are hard rules.

TASKS
1. Build the shared components from CONTEXT.md section 5.5 in `src/components/ui/`: Button (primary, secondary, text variants; sizes), Input, Select, Textarea, Field (label + hint + error), Badge, Price (with struck MRP and % off), UnitPrice, Swatch (flat colour circle with hairline border; selected state is a 2px ink ring PLUS the colour name shown as text), OptionPicker (buttons for sizes/pack sizes; disabled and sold-out states), QuantityStepper, RatingStars (flat SVG), Drawer, Dialog (focus trap, Esc to close, return focus), Toast, Skeleton (flat block, no shimmer), EmptyState, Breadcrumbs, Stepper (text-only checkout progress).
2. A dev-only `/styleguide` page that shows every component in all states. Mark it `noindex` and add it to robots disallow later. (It is removed in Phase 9.)
3. Real header (`components/layout/Header`): text wordmark "Barakah Bazaar" linking to `/`; primary navigation with the three category names (uppercase, letter-spaced, the active category underlined using the category accent colour, read from the `bz_category` cookie or the current route); a search input/icon (links to `/search`); wishlist icon, cart icon, account icon (account links to `/account`). Cart count badge is a placeholder (0) until Phase 5. Mobile: category links in a left Drawer, search icon opens a search field.
4. Footer: links to About, Contact, and the four policy pages; no newsletter box, no social icon row unless the client supplies URLs (placeholder-free: omit if absent).
5. Static pages `/about`, `/contact`, `/policies/privacy`, `/policies/terms`, `/policies/returns`, `/policies/shipping` with clearly marked placeholder text, `noindex`, and entries in `TODO-CONTENT.md`.
6. The category gate at `/` exactly as in CONTEXT.md 5.6: statement line (placeholder), three equal tiles, each a single link; clicking sets the `bz_category` cookie (use a small client component or a route handler redirect; the links must still be real `<a href>` to `/[category]` for SEO) and navigates to `/[category]`. Image slots show a flat neutral rectangle with the correct aspect ratio until the client supplies photos. Fetch category names/descriptions from the database through the public client; if the DB is empty fall back to the constants in CONTEXT.md section 1.
7. `/[category]` stub that validates the slug (notFound for unknown) and shows the category name H1 (full listing comes in Phase 3).
8. Add Organization JSON-LD to the home page.

DO NOT
- No carousels, no hero with two buttons, no gradients, no shadows except Drawer/Dialog/Toast overlays, no radius above 2px, no emoji, no stock imagery.
- Do not build auth, cart or catalogue logic yet.

ACCEPTANCE
- All components render in `/styleguide`, are keyboard operable, and have visible focus.
- The gate shows three equal tiles at 360px, 768px and 1280px with no horizontal scroll.
- Keyboard-only: you can reach every header link, open/close the mobile drawer, and activate each tile.
- Lighthouse accessibility score of 95+ on `/` (report the number).
- Anti-slop self-check returns no hits.

REPORT BACK
Screenshots (or a precise description) of `/`, `/styleguide` at 360px and 1280px, the Lighthouse accessibility result, the list of placeholders added to TODO-CONTENT.md, and any component you could not finish.
```

---

## Phase 3: Catalogue, product page, search, SEO

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 3 of 9. Do only this phase.

GOAL
Real, fast, crawlable catalogue pages for all three categories, driven by the database.

TASKS
1. Catalog data layer in `src/lib/catalog/` using the cookie-less public Supabase client: listCategoryProducts (filters, sort, pagination), getProduct (with variants, images, rating summary), listReviews (from `public_reviews`), searchProducts (Postgres full-text via `search_vector`, with a prefix match so partial words work). Pages that use it set `export const revalidate = 300` and never read cookies.
2. `/[category]` listing:
   - Breadcrumbs, H1, description, product grid (2/3/4 columns; bridal 2/3/3 with 3:4 images), numbered pagination (24 per page).
   - Filters from data, kept in URL search params (server-rendered): price range; bridal: size, colour, occasion; naturals and coconut oil: pack size. Mobile: a "Filters" Drawer. Sort: Newest, Price low to high, Price high to low.
   - Product card per CONTEXT.md 5.5: image (flat placeholder if no image), name, short descriptor, price with struck MRP and % off, optional badge, rating only if reviews exist, sold-out label when every variant has stock 0.
3. `/[category]/[slug]` product page per CONTEXT.md 5.6:
   - Gallery (primary + thumbnails, keyboard operable), name, price block driven by the selected variant, OptionPicker(s) built from `option_names` and variants (disable combinations that don't exist; show sold-out options as unavailable), colour Swatches for bridal, quantity stepper capped at stock, stock message ("In stock" / "Only N left" when N <= 5 / "Sold out"), Add to cart and Wishlist buttons (wired in Phase 5; for now render them and make them no-ops that show a Toast "Coming in a later phase" in dev only).
   - Bridal: attributes list (fabric, work, care), size guide Dialog (placeholder table + TODO).
   - Naturals/oil: UnitPrice, "Origin and ingredients" block, "Proof" block ONLY when `attributes.proof` exists, shelf life if provided.
   - Reviews section: average rating + count only if reviews exist, list of reviews (first name, rating, comment, date), empty state "No reviews yet". The write-review control comes in Phase 8.
   - Deep link works without the gate and without login.
4. `/search?q=`: results grid across categories, a plain "no results" state, search term in H1 and title. `noindex` for search result pages.
5. SEO per CONTEXT.md section 13: `generateMetadata` on category/product/search, canonical URLs, Open Graph, JSON-LD (Product with offers and availability, aggregateRating only when real reviews exist, BreadcrumbList), `app/sitemap.ts`, `app/robots.ts` (disallow cart, wishlist, checkout, orders, account, login, api, styleguide). Configure `images.remotePatterns` for the Supabase Storage host and use next/image with width/height, `sizes`, alt text and `priority` on the first product image.
6. Unit tests: unit-price calculation (per 100 g / 100 ml), % off calculation, filter-to-query parsing.

DO NOT
- No client-side data fetching for catalogue content. No infinite scroll. No auto-playing anything.
- Do not make cart/wishlist work yet.

ACCEPTANCE
- `curl` of a category page and a product page returns full HTML containing the product names, prices and JSON-LD (view-source shows content without JavaScript).
- `/sitemap.xml` lists categories and all active products; `/robots.txt` is correct.
- Filters and sort change the URL and results; reloading the URL reproduces the same view.
- At 360px nothing overflows horizontally. Lighthouse (mobile) on a product page: SEO 95+, accessibility 95+, and report LCP.
- Layout shift is not caused by images (aspect ratio reserved).
- Anti-slop self-check returns no hits.

REPORT BACK
The Lighthouse numbers, a sample of the JSON-LD output for one bridal and one naturals product, the sitemap URL count, and a list of placeholders added to TODO-CONTENT.md.
```

---

## Phase 4: Authentication (mobile OTP, console OTP)

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 4 of 9. Do only this phase. Section 9 of CONTEXT.md is the specification.

GOAL
Mobile OTP login where the OTP is generated server-side and printed to the BROWSER CONSOLE for now, behind an interface so a real SMS provider is a one-file swap later.

BEFORE CODING
Check the current Supabase documentation for: `auth.admin.createUser`, `auth.admin.generateLink` (magiclink) and `auth.verifyOtp` with `token_hash`, and the `@supabase/ssr` cookie helpers. Confirm the session-bridge approach in CONTEXT.md 9.3 works. If anything differs, tell the user what you changed. Do not hand-sign JWTs.

TASKS
1. `lib/auth/phone.ts`: normalise/validate Indian mobile numbers to E.164 (+91XXXXXXXXXX). Tests for valid and invalid inputs.
2. `lib/auth/otp.ts`: generate 6-digit OTP (`crypto.randomInt`), HMAC-SHA256 hash with `OTP_HMAC_SECRET`, constant-time verify. Tests.
3. `lib/auth/senders.ts`: `OtpSender` interface, `ConsoleOtpSender`, `SmsOtpSender` stub that throws "Not configured". Select by env. The app already refuses to start with DEV_OTP_MODE=true in production (Phase 0).
4. `POST /api/auth/otp/request`: validate, rate limit via `otp_requests` (30 s resend cooldown, 5 per phone per 15 min, 20 per IP per hour), store hash + 5-minute expiry, send via the sender. In dev mode the JSON includes `devOtp`; otherwise never.
5. `POST /api/auth/otp/verify`: latest unconsumed unexpired request, max 5 attempts, constant-time compare, mark consumed, find-or-create the auth user and `profiles` row (service role), bridge to a session with cookies per 9.3, respond `{ profileCompleted }`.
6. `POST /api/auth/logout`, `GET/PATCH /api/me` (PATCH accepts name only for now).
7. `middleware.ts`: refresh the session and redirect unauthenticated requests for `/cart`, `/wishlist`, `/checkout`, `/orders`, `/account` to `/login?next=<path>`.
8. UI:
   - `/login`: step 1 phone input (with a fixed "+91" prefix, `inputmode="tel"`), step 2 OTP input (6 digits, `inputmode="numeric"`, `autocomplete="one-time-code"`), resend with a 30 s countdown, inline errors, a "Change number" link. Under the OTP input show **"OTP sent. Check the browser console."** and call `console.log('[DEV OTP]', devOtp)` when `devOtp` is present. Only in dev mode.
   - `/login/profile`: one field, name only; required; saves and continues to `next`.
   - Header: shows "Log in" for guests and an account link for users; Log out in `/account` stub.
   - Pending-action replay: a small utility that saves `{type, payload}` to `sessionStorage` before redirecting a guest to `/login?next=`, and a client component that runs it once after login and clears it (the actions themselves are implemented in Phase 5; implement the utility and a registry now).
9. In the README, document: DEV_OTP_MODE, that real SMS needs a provider plus India's DLT registration, and the disabled public sign-ups requirement (the user must switch "Allow new users to sign up" OFF in Supabase Auth settings; add this as a manual step in the report).

DO NOT
- Never log or store a plain OTP anywhere except the dev console output and the dev-only response field.
- Do not build Google or email login.

ACCEPTANCE
- New number: request OTP → read it in the browser console → verify → name screen → logged in and returned to `next`.
- Returning number skips the name screen.
- Wrong OTP 5 times locks that code. Expired OTP is rejected. Resend within 30 s is rejected.
- With DEV_OTP_MODE unset, the request response contains no `devOtp` (test it).
- Visiting `/cart` as a guest redirects to `/login?next=/cart`.
- Unit tests for phone, OTP and rate limiting pass. Anti-slop self-check passes.

REPORT BACK
The tests run, the exact manual steps the user must do in the Supabase dashboard, any change to the session bridge, and a short note on what will change when a real SMS provider is added.
```

---

## Phase 5: Wishlist and cart

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 5 of 9. Do only this phase.

GOAL
Working wishlist and a shared cart across all three categories, with the stock rules from CONTEXT.md section 10.

TASKS
1. API routes per CONTEXT.md section 8: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/[id]`, `DELETE /api/cart/items/[id]`, `GET/POST/DELETE /api/wishlist`. All validated with zod and authenticated; rely on RLS plus an explicit ownership check.
2. Cart rules (exactly as the client specified):
   - A user may add a variant up to its current stock. Adding does NOT reduce or hold stock.
   - Two users can hold the same variant at once.
   - Adding more than available is rejected with a clear message; quantity is capped to stock on update.
   - `GET /api/cart` returns each line with CURRENT price (from the variant), image, product/variant names, and flags: `unavailable` (inactive or stock 0) and `short` (stock < qty, with `available`).
3. Wire the product page: Add to cart (variant + quantity) and Wishlist (heart toggle) buttons; for guests, save the pending action with the Phase 4 utility and go to `/login?next=...`; after login, the action is replayed once and a Toast confirms it. Wishlist hearts on product cards too (client component; the catalogue pages themselves stay cacheable).
4. `/wishlist` page: grid of wishlisted products with remove, and "View product" links. Empty state is plain text plus a link.
5. `/cart` page: lines with image, name, variant label, unit price, QuantityStepper, remove; live warnings per line ("Only N left", "No longer available") shown on load; subtotal; "Checkout" button that is disabled with an explanation when any line is unavailable or short (and links to that line). No coupon field here.
6. Header cart count (sum of quantities) and wishlist indicator, updated after actions without a full reload. Use a small client store or SWR-style refetch; keep it simple.
7. Tests: quantity cap logic; cart response flags (`unavailable`, `short`).

DO NOT
- No guest cart. No stock reservation. No checkout work.

ACCEPTANCE
- Items from bridal, naturals and coconut-oil can all be in one cart.
- User A and user B can both have the same variant in their carts.
- Setting a quantity above stock is capped/rejected with a message.
- If a variant's stock is set to 0 in the DB, the cart page shows the warning and disables checkout.
- Guest add-to-cart goes to login and the item is in the cart after login.
- Anti-slop self-check passes.

REPORT BACK
What you tested manually (steps and results), any limitation, and the test results.
```

---

## Phase 6: Checkout

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 6 of 9. Do only this phase. Section 10 of CONTEXT.md is the specification.

GOAL
A single checkout page that collects the delivery address with a map pin, an optional email, rechecks stock, creates a PENDING_PAYMENT order, and applies a coupon. No payment yet.

TASKS
1. Install `leaflet` and `react-leaflet`. Load the map client-side only (dynamic import, no SSR). Use OpenStreetMap tiles with the required attribution. Leaflet's default marker images need a fix in bundlers; handle it properly.
2. Address API per CONTEXT.md section 8 (CRUD) with zod: name, phone, line1, line2, landmark, city, state, pincode (6 digits), latitude, longitude. Phone is pre-filled from the login phone and editable. Latitude and longitude are required for checkout.
3. `/checkout` page, four blocks in order, with a text Stepper:
   a. Delivery address: list saved addresses (select one) or add a new one. The form has a map where the user drops/drags a pin and a "Use my current location" button (browser geolocation; handle denial gracefully). Show the chosen coordinates as plain text so the user can see them. Mark one address default.
   b. Contact email (optional, unverified). Helper text: "Order updates are also sent here." Save it on the order and on `profiles.email` so it is pre-filled next time.
   c. Order review: items (all categories), subtotal, coupon field, discount line, total, "Inclusive of all taxes".
   d. Pay button (disabled with an explanation until a payment is wired in Phase 7; for now it calls order creation and shows the created order number and total in a Toast, dev only).
4. `POST /api/orders` exactly per CONTEXT.md section 10:
   - Recheck every cart line (active, stock >= qty). If any line fails, return `409` with per-line details and create NOTHING. The UI blocks checkout, shows per-line messages, and links back to the cart.
   - Otherwise one transaction: order (PENDING_PAYMENT / PENDING), order_items snapshots, address_snapshot (including phone, latitude, longitude), notify_phone (login phone), notify_email (optional), subtotal, total, status history row. Stock is NOT changed.
5. Coupon: `POST/DELETE /api/orders/[id]/coupon` with the rules in CONTEXT.md section 10 (exists, active, date window, min order; percent with cap or flat; one coupon per order). Recompute and return totals. Show clear inline errors ("This code has expired", "Minimum order is ₹X"). `used_count` is NOT changed here.
6. Server-side money logic in `lib/pricing/coupon.ts` with thorough unit tests: percent, percent cap, flat larger than subtotal, min order, expired, not yet valid, inactive, unknown code.
7. If the user already has a PENDING_PAYMENT order with an identical cart, reuse it instead of creating a duplicate (keep this simple: compare variant ids, quantities and unit prices).

DO NOT
- No Razorpay yet. No notifications. No reservation or expiry of pending orders.

ACCEPTANCE
- Full path works in the browser: cart → checkout → address with pin → optional email → coupon → order created with the right snapshot.
- If stock changes to below the requested quantity before clicking, the order is NOT created and the user sees which line is short.
- A coupon recomputes the total correctly and cannot be applied twice; removing it restores the total.
- `address_snapshot` in the DB contains latitude and longitude.
- Coupon unit tests pass. Anti-slop self-check passes.

REPORT BACK
The manual test steps and results (including the stock-recheck failure case), the coupon test table, and any decision CONTEXT.md did not cover.
```

---

## Phase 7: Payments and orders

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 7 of 9. Do only this phase. Section 10 of CONTEXT.md is the specification.

PREREQUISITE
Razorpay TEST mode keys and a webhook secret in `.env.local`. If missing, say exactly what is needed and stop.

GOAL
Pay for the order through Razorpay; confirm it idempotently; reduce stock only after successful payment; show orders.

TASKS
1. `lib/payments/razorpay.ts`: create order (amount in paise, INR, receipt = order_number, notes.order_id), signature verification for checkout (`order_id|payment_id`) and for webhook (raw body). Constant-time comparisons. Unit tests for both signature checks with known vectors.
2. `POST /api/payments/create {orderId}`: user owns the order, status PENDING_PAYMENT, amount from `orders.total_paise` in the database only. Reuse an existing non-captured Razorpay order for the same order. Insert/update the `payments` row (CREATED). Return `{ razorpayOrderId, keyId, amount }`.
3. Checkout "Pay" button: load Razorpay Checkout.js only on this page; open it with the returned data; on success post `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `/api/payments/verify`; on dismissal or failure show "Payment not completed" and keep the order pending.
4. `POST /api/payments/verify`: verify the signature, then call `confirm_payment` via the service role. Respond so the UI can navigate to `/checkout/success?order=...`.
5. `POST /api/payments/webhook`: read the raw body with `await req.text()`; verify `X-Razorpay-Signature`; handle `payment.captured` (call `confirm_payment`) and `payment.failed` (mark the payment FAILED; order stays PENDING_PAYMENT); always respond quickly with 200 for valid signatures; 400/401 for invalid. Idempotent by design (the SQL function is idempotent).
6. Confirm that `confirm_payment` (already built in Phase 1) does exactly: payment CAPTURED, order PAID/CONFIRMED + history row, stock = greatest(stock - qty, 0), coupon used_count + 1, remove purchased variants from the cart, insert notification rows. Add a code comment and a README line about the accepted "last unit paid twice" edge case. Do not build extra handling.
7. Pages:
   - `/checkout/success?order=`: order number, items, total, address summary, "Continue shopping" (back to the remembered category) and "View order".
   - `/orders`: list (order number, date, total, status label: "Payment pending", "Confirmed", "Delivered").
   - `/orders/[id]`: items with variant labels, address, totals, payment state, status timeline from `order_status_history`, and for `PENDING_PAYMENT` orders a **Retry payment** button that reopens Razorpay on the same order.
8. A short README section: how to run a test payment with Razorpay test cards/UPI, how to expose the dev server for webhooks (tunnel), and that `verify` also finalises so local testing works without the webhook.

DO NOT
- No refunds, no stock reservation, no order expiry, no shipping charges.
- Never trust an amount, order total or status sent by the client.

ACCEPTANCE
- Successful test payment: order CONFIRMED, payment CAPTURED, stock reduced by the purchased quantities, cart lines removed, coupon used_count incremented once, notification rows created.
- Calling verify and the webhook for the same payment (in any order, twice each) changes nothing the second time.
- Closing the tab after paying and then delivering the webhook still confirms the order.
- Failed/cancelled payment leaves the order PENDING_PAYMENT, the cart intact, stock unchanged, and Retry payment works.
- A forged signature on verify and on webhook is rejected.
- User A cannot open user B's order or create a payment for it.
- Signature unit tests pass. Anti-slop self-check passes.

REPORT BACK
Test evidence for each acceptance item (what you did and the DB state afterwards), and anything surprising about the Razorpay integration.
```

---

## Phase 8: Notifications, reviews, account

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 8 of 9. Do only this phase.

GOAL
Send order confirmations (console implementations for now), let eligible buyers review products, and finish the account page.

TASKS
1. Notifications (CONTEXT.md section 11):
   - `EmailSender` and `WhatsAppSender` interfaces with Console implementations that log the full message (order number, items with variant labels and quantities, total, address summary) and mark rows SENT.
   - `lib/notify/process.ts` processes PENDING rows with up to 3 attempts, recording `last_error`.
   - Trigger processing inline (fire and forget) after a successful payment confirmation, and expose `POST /api/jobs/notifications` protected by the `x-jobs-secret` header.
   - Recipients: WhatsApp → `orders.notify_phone` (the verified login phone); Email → `orders.notify_email` if present.
   - Message copy: plain and factual. No emoji, no marketing language.
   - README: WhatsApp Business needs pre-approved templates; email provider TBD.
2. Reviews (CONTEXT.md section 12):
   - `GET /api/products/[id]/review-eligibility` → `{ canReview, reason }` where reason is one of `not_logged_in`, `no_delivered_order`, `already_reviewed`.
   - `POST /api/products/[id]/reviews`, `PUT/DELETE /api/reviews/[id]` (rating 1-5, comment required, max 1000 chars). Enforce eligibility server-side AND rely on the RLS policy.
   - Product page: the "Write a review" control appears only when eligible; a guest sees a "Log in to review" link that goes through login and back; a user who already reviewed sees their review with Edit and Delete.
   - After deleting, the user may post again.
   - Update product `aggregateRating` JSON-LD and card ratings to read the real data (only when reviews exist).
3. `/account` page: edit name; addresses (list, add, edit, delete, set default — reuse the Phase 6 form with the map); links to Orders and Wishlist; Log out. Optional email shown and editable here too.
4. Tests: eligibility logic for all three reasons; notification processing (success, failure with retry, max attempts).

DO NOT
- No real email/WhatsApp provider. No review photos or helpful votes. No admin moderation UI.

ACCEPTANCE
- After a paid order, the server console shows one WhatsApp message to the login number and one email only if an email was entered at checkout; rows are SENT.
- A simulated sender failure retries up to 3 times and ends FAILED with last_error, without affecting the order.
- Using `supabase/dev/mark_delivered.sql` on a paid order makes the review control appear for the products in it, and only those; posting works once; editing and deleting work; a second post is rejected (409).
- A user without a delivered order gets 403 on the API even if they bypass the UI.
- Account page works end to end. Tests pass. Anti-slop self-check passes.

REPORT BACK
The manual test steps and results, and the console output of a sample notification.
```

---

## Phase 9: Hardening, QA, README, clean-up

```
Read CONTEXT.md fully before doing anything. Follow it exactly. This is Phase 9 of 9, the final phase. Do only this phase.

GOAL
Make the app production-ready in quality (not deployed) and leave clear documentation.

TASKS
1. Security review: confirm RLS is enabled on every table and rerun the RLS test script; confirm the service-role client is only imported in server-only modules (grep and report); confirm no secret appears in client bundles (check the build output for key names); confirm zod validation and ownership checks on every API route (produce a table: route, auth, validation, ownership check); confirm OTP and webhook protections; confirm the DEV_OTP_MODE production guard still works (write a test).
2. Accessibility pass: keyboard-only walkthrough of the full purchase path; check focus order, focus traps in Drawer/Dialog, labels, error announcements (aria-live for inline errors and toasts), contrast AA, `alt` text, heading order. Fix issues. Report Lighthouse accessibility for: `/`, a category page, a product page, `/cart`, `/checkout`, `/login`.
3. Performance pass: Lighthouse mobile for `/`, a category page and a product page. Targets: LCP under 2.5 s on a throttled mobile profile, no layout shift from images, minimal client JS on catalogue pages. Fix regressions (image sizes, font loading, unnecessary client components).
4. SEO check: validate JSON-LD, sitemap, robots, canonicals, titles/descriptions unique per page, `noindex` on auth/account/search/placeholder pages. Report anything missing.
5. Visual QA against CONTEXT.md section 5: run the anti-slop self-check, walk every page at 360px, 768px and 1280px, remove any decoration that does not serve a purpose, and make sure there are no emoji, gradients, blur, glow, oversized radii or heavy shadows. Fix hits.
6. Remove `/styleguide` (and its robots entry).
7. Error and empty states: 404, 500 (error boundary), loading states for cart/checkout/orders, network failure messages on every form. Plain text, no illustrations.
8. Write a complete `README.md`: prerequisites; local setup (Supabase project/CLI, env vars, migrations, seed, types); how to run; how the dev OTP works; how to mark an order delivered; Razorpay test setup and webhook tunnel; project structure; the API table; the known accepted edge cases (last unit paid by two buyers; no reservation of stock; abandoned pending orders stay pending); and a **"Before going live" checklist**: set `DEV_OTP_MODE=false`; integrate an SMS provider (with DLT registration) behind `OtpSender`; integrate email and WhatsApp providers (WhatsApp templates approval); replace demo data; fill every item in `TODO-CONTENT.md`; Razorpay live keys and webhook URL; choose hosting; turn off Supabase public sign-ups (confirm it is off); review RLS once more.
9. Finalise `TODO-CONTENT.md` so it lists every placeholder still in the app, grouped by owner.
10. Add a manual end-to-end test script to the README (the "Definition of done" in CONTEXT.md section 18 as numbered steps).

DO NOT
- Do not add new features. Do not deploy. Do not weaken any security control to pass a check.

ACCEPTANCE
- typecheck, lint, build and all tests pass. RLS tests pass.
- The end-to-end script in the README passes when you run it (report each step).
- Lighthouse numbers reported and targets met, or the gaps listed honestly.
- Anti-slop self-check returns no hits.

REPORT BACK
The route/security table, Lighthouse results, the end-to-end test result, the final TODO-CONTENT.md, and a short list of what the user must do before launch.
```
