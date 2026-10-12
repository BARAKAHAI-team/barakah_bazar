# Barakah Bazaar: Build Context

**Read this whole file before starting any phase.** It is the single source of truth for what we are building, how it should look, and how it must behave. `PHASES.md` tells you the order to build it in. If a phase prompt and this file disagree, stop and ask; do not guess.

---

## 0. Working agreement for the agent

1. Work **one phase at a time**, in the order given in `PHASES.md`. Do not start the next phase until the user says "go to phase N".
2. At the start of each phase, write a short plan (files you will create or change). Then implement.
3. At the end of each phase, run `npm run typecheck`, `npm run lint`, `npm run build` and any tests, fix what fails, and then report using the phase's "Report back" list.
4. Never invent business content: no fake certifications, lab reports, awards, review counts, testimonials, farmer names, or statistics. Where real content is needed and not supplied, render a clearly marked placeholder and add it to `TODO-CONTENT.md` (see section 17).
5. Never put secrets in client code. The Supabase service-role key, Razorpay secret and OTP secret are server-only.
6. Prefer boring, standard solutions. Do not add libraries that this file does not mention without saying why.
7. If a Supabase or Razorpay API behaves differently from what is described here, check the current official documentation and tell the user what you changed.

---

## 1. Product summary

Barakah Bazaar is a customer-facing e-commerce site (India, INR, English, mobile-first) with **three categories**:

| Slug | Display name | What it sells |
| --- | --- | --- |
| `bridal` | Barakah Bridal Collections | Bridal wear. Products have **sizes and colours**. |
| `naturals` | Barakah Naturals | Farm-direct natural products: organic turmeric powder, organic chilli powder, and other natural products sourced from farmers. Products have **pack sizes**. |
| `coconut-oil` | Barakah Kerala Pure Coconut Oil | Kerala coconut oil in **a few pack sizes (variants)**. |

**Core behaviour**

- The home page is a **category gate**: the visitor chooses one of the three categories first, then proceeds into that category.
- Guests can browse, search, view products and read reviews.
- **Cart and wishlist need login.** Login is **mobile OTP only**. For now the OTP is generated server-side and **shown in the browser console** (no SMS provider yet). A real provider comes later behind an interface.
- **One shared cart across all three categories, one checkout, one Razorpay payment.**
- Stock is checked at add-to-cart and re-checked at checkout. Stock is **only reduced after successful payment**.
- Reviews: anyone can read. Only users with a **delivered** order containing the product can post. Rating + comment only. Users can edit and delete their own review.

**Out of scope (do not build):** admin portal, shipping charges, courier integration, refunds, reservation or expiry of stock, hosting and deployment, monitoring, Google or email login, multi-language, multi-vendor, tax breakdown (prices are shown inclusive of all taxes).

Admin work is assumed to happen outside this app (Supabase dashboard / SQL): products, variants, images, coupons, and marking orders `DELIVERED`.

---

## 2. Stack

- **Next.js** (App Router, React, TypeScript strict). Use the latest stable version at scaffold time.
- **Tailwind CSS** (latest stable). Design tokens as CSS variables, mapped into the Tailwind theme.
- **Supabase**: Postgres, Storage, Auth (used as the session layer, see section 9), Row Level Security.
- **Razorpay** (Checkout.js + server API + webhook).
- Libraries allowed: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `razorpay` (or plain `fetch` to the Razorpay API), `lucide-react` (icons), `leaflet` + `react-leaflet` (map pin, OpenStreetMap tiles), `vitest` (tests), `clsx`. Anything else needs a reason.
- Fonts via `next/font/google`: a serif for headings (**Newsreader**) and a sans for body (**Public Sans**). Swap if the client supplies brand fonts.
- Package manager: `npm`. Scripts required: `dev`, `build`, `start`, `lint`, `typecheck`, `test`.

Hosting is **not decided**. Do not configure deployment. Keep everything env-driven so hosting can be chosen later.

---

## 3. Routes and information architecture

| Route | Access | Notes |
| --- | --- | --- |
| `/` | public | **Category gate.** Three equal tiles. See 5.6. |
| `/[category]` | public | `bridal`, `naturals`, `coconut-oil`. Unknown slug → `notFound()`. Server-rendered listing with filters and sort via URL search params. |
| `/[category]/[slug]` | public | Product page. Server-rendered. |
| `/search?q=` | public | Searches across all categories. |
| `/login` | public | Mobile OTP. Accepts `?next=`. |
| `/login/profile` | auth | Name-only profile step for new users. |
| `/cart` | **auth** | |
| `/wishlist` | **auth** | |
| `/checkout` | **auth** | Address, optional email, review, coupon, pay. |
| `/checkout/success?order=` | **auth** | |
| `/orders`, `/orders/[id]` | **auth** | |
| `/account` | **auth** | Name, addresses, links to orders and wishlist, log out. |
| `/about`, `/contact`, `/policies/privacy`, `/policies/terms`, `/policies/returns`, `/policies/shipping` | public | Static pages. Placeholder text is allowed but must be marked and listed in `TODO-CONTENT.md`. Mark `noindex` until filled. |
| `/styleguide` | dev only | Component showcase. `noindex`. **Removed in the final phase.** |

Rules:
- **Deep links never redirect to the gate.** A visitor arriving on `/coconut-oil/some-product` from Google or WhatsApp sees that product. The gate only lives on `/`.
- Static routes win over `[category]`. `[category]` must validate against the three known slugs.
- Choosing a category on the gate sets a cookie `bz_category=<slug>` (1 year, `SameSite=Lax`). It is used for the header's active state and for the "Continue shopping" link. The header always shows all three categories so the user can switch freely. The **cart is not affected** by switching.
- Guests tapping cart or wishlist go to `/login?next=<current path>`. The pending action (add to cart / add to wishlist, with variant and quantity) is saved in `sessionStorage` and **replayed after login**.

---

## 4. Reference sites and what we take from them

I reviewed these storefronts for structure and content patterns. **Limitation: I read page structure and text, not rendered visuals, so the palette and typography below are my proposals, not copies.** Do not copy any brand's name, copy, imagery or layout wholesale.

| Reference | What to take |
| --- | --- |
| **Sabyasachi** (bridal) | Editorial, collection-led layout: each collection is a full-width block with a title and one plain link ("Explore"). Uppercase navigation. Wishlist and customer care in the header. **No discount banners or promo noise.** Restraint reads as luxury. |
| **Kalki Fashion** (bridal) | A short factual trust strip (only claims that are true for us). Browsing by **occasion** (haldi, mehendi, sangeet, reception, bride, bridesmaid). **Size guide** pages per garment. Phone → OTP → details login flow. Named customer stories with city (only real ones). |
| **Pernia's Pop-Up Shop** (bridal listing) | Faceted listing: category, **size**, **colour**, price, sort. Card = brand line, product title, price, struck-through MRP, % off, small text tags. Sold-out items stay visible with a "Sold out" label. |
| **Two Brothers Organic Farms** (naturals) | Product card = name, **one-line claim**, rating with count, **pack-size selector right on the card**, price with struck MRP, add to cart. Short text badges. A "proof" section (certifications, lab reports) and farm/traceability pages. |
| **Vahdam** (naturals) | Sourcing and origin story, "single origin" labelling, **price per unit** hint (e.g. per 100 g). |

Apply per category:
- **Bridal:** portrait images (3:4), size selector, colour swatches, size-guide link, fabric / work / care in an attributes list, occasion filter (stored in `attributes.occasion`).
- **Naturals and coconut oil:** square images on a flat neutral background, pack-size selector, **unit price** ("₹ per 100 g" / "per 100 ml"), an **Origin and ingredients** block, a **Proof** block that only appears when real proof data exists.

---

## 5. Design direction

### 5.1 Principle
Quiet, flat, typographic, trustworthy. The photography and the product carry the page. If a decoration does not help someone find, judge or buy a product, remove it.

### 5.2 Anti-slop rules (hard rules, not suggestions)

**Forbidden:**
- **Gradients** of any kind (backgrounds, buttons, text, borders, overlays).
- Glow, neon, shimmer, sparkle, glitter, confetti, particle or "aurora" effects.
- Glassmorphism, `backdrop-blur`, frosted panels.
- Emoji used as icons or decoration. No emoji anywhere in UI copy.
- Heavy or coloured drop shadows. Shadows are allowed **only** on overlays (drawer, popover, toast) and must be subtle.
- Large rounded corners and pill shapes everywhere. Max radius is **2px** for inputs, buttons, cards and badges; **0** for images. Full-round is allowed only for colour swatches and the quantity stepper focus ring if needed.
- Auto-playing carousels, marquees, animated counters, scroll-jacking, parallax, cursor effects.
- The default "AI landing page" layout: centred hero with a headline, subhead and two buttons over a blurred blob; three-icon feature row; floating stat cards.
- Purple/indigo/blue default accents.
- Stock illustrations, 3D blobs, abstract shapes. If an image is missing, use a **flat neutral rectangle** with the correct aspect ratio and the product name in small text.
- Lorem ipsum, fake testimonials, fake numbers, fake logos ("As seen in").
- Marketing filler words in copy: *elevate, seamless, unlock, curated experience, crafted with love, discover the magic, game-changing, revolutionise*.

**Required:**
- Flat colour, hairline (1px) borders, generous whitespace, clear hierarchy through size and weight.
- Motion limited to 120-180ms opacity/transform for hover, focus and drawer open. Respect `prefers-reduced-motion`.
- Icons from `lucide-react`, thin stroke (1.5), used only where they carry meaning (cart, heart, search, user, close, chevron, map-pin).
- Real product photography supplied by the client. Product images always have meaningful `alt` text.

**Self-check before finishing every phase.** Run these and fix any hit:
```
grep -rniE "gradient|backdrop-blur|blur-|glow|shimmer|animate-(pulse|bounce|ping|spin)|rounded-(xl|2xl|3xl|full)|shadow-(md|lg|xl|2xl)" src --include=*.tsx --include=*.ts --include=*.css
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src
```
(`rounded-full` is allowed only on colour swatches. `animate-spin` is allowed only on a loading spinner.)

### 5.3 Tokens (proposals; replace when the client supplies brand colours)

```css
:root {
  --bg: #F8F5EF;          /* warm off-white page background */
  --surface: #FFFFFF;     /* cards, inputs */
  --ink: #1F1B16;         /* body text, primary buttons */
  --ink-muted: #5E574E;   /* secondary text (contrast >= 4.5:1 on --bg) */
  --line: #DDD6CA;        /* hairlines */
  --accent-bridal: #6B1F2A;
  --accent-naturals: #4A6338;
  --accent-coconut: #7A5B2E;
  --danger: #A4262C;
  --success: #2F6B3F;
  --focus: #1F1B16;
}
```
- Primary button: solid `--ink` background, `--bg` text. Secondary: 1px `--ink` border, transparent. No colour gradients, no hover glow; hover = slightly lighter/darker flat colour.
- The category accent colour is used sparingly: the category label, the selected-variant outline, text links inside that category. **Not** for large fills.
- Focus: `outline: 2px solid var(--focus); outline-offset: 2px`. Never remove focus outlines.

### 5.4 Type
- Headings: Newsreader (serif). Body and UI: Public Sans.
- Body 16px (14px for dense UI), caption 12-13px. H1 `clamp(28px, 4vw, 44px)`, H2 24-32px, H3 18-20px. Line height 1.5 body, 1.2 headings.
- Uppercase with letter-spacing (0.08em) only for the primary category navigation and small labels.
- Numbers: `font-variant-numeric: tabular-nums` for prices and quantities.

### 5.5 Layout and components
- Container max width 1200px, side padding 16px (mobile) / 24px (desktop). **Design for 360px width first.**
- Product grid: 2 columns (mobile), 3 (tablet), 4 (desktop). Bridal uses 2/3/3 with larger 3:4 images.
- Product card: image, name, one-line descriptor, price (with struck MRP and % off if discounted), optional text badge (`products.badge`), rating only if reviews exist. No card border, no card shadow. Bridal cards may swap to the second image on hover (opacity only).
- Sold out = all variants stock 0: show "Sold out" label, disable add to cart, keep the card visible.
- Build these shared components: `Button`, `Input`, `Select`, `Textarea`, `Badge`, `Price`, `UnitPrice`, `Swatch`, `OptionPicker`, `QuantityStepper`, `RatingStars`, `Drawer`, `Dialog`, `Toast`, `Skeleton`, `EmptyState`, `Breadcrumbs`, `Field` (label + error), `Stepper` (checkout progress, text only).
- Forms: visible labels (no placeholder-only), inline errors, 44px minimum tap target, correct `inputmode` (`numeric` for OTP/pincode, `tel` for phone).
- Empty states are plain text plus one link. No illustrations.
- Skeletons are flat neutral blocks, no shimmer animation.

### 5.6 Key pages

**Category gate (`/`)**
- Header, then a one-line statement of what Barakah Bazaar is (plain, factual, written by the client; placeholder if not supplied).
- Three equal tiles (stacked on mobile, three columns on desktop). Each tile: small uppercase label "Barakah", category name in serif, one-line description, an image slot (client photo, or flat neutral placeholder), and a single link "Shop <name>". No carousel, no two-button hero.
- Whole tile is one link. Clicking sets `bz_category` and goes to `/[category]`.
- Footer links to About, Contact, policies.

**Listing (`/[category]`)**
- Breadcrumbs, H1, one-line description, then filters (left column on desktop, a "Filters" drawer on mobile) and a sort select. Filters come from data: price range plus option filters derived from variants (bridal: size, colour, occasion; naturals and oil: pack size). Filter state lives in URL search params so pages are shareable and server-rendered. Sort: Newest, Price low to high, Price high to low.
- Pagination: numbered pages (24 per page), not infinite scroll.

**Product page**
- Left: image gallery (primary image, thumbnails, no auto-play). Right: name, price block, option picker (bridal: size + colour; naturals/oil: pack size), quantity stepper, **Add to cart** and **Wishlist** (icon + text), then facts.
- Bridal facts: description, fabric, work, care, size guide link (opens a dialog with a size table; table content from the client, placeholder until then).
- Naturals/oil facts: description, **Origin and ingredients**, **Proof** (only if `attributes.proof` exists), **unit price**, shelf life and storage if provided.
- Selected variant drives the price, stock message and image. Stock message: "In stock", "Only N left" (when N <= 5), or "Sold out". Quantity is capped at current stock.
- Reviews section below: average rating, list (reviewer first name, rating, comment, date), and the "Write a review" control (only shown to eligible users; see section 12).

**Cart** — line items (image, name, variant label, unit price, quantity stepper, remove), live stock warnings per line ("Only 2 left", "No longer available"), subtotal, and a "Checkout" button. If any line is out of stock or short, the checkout button explains why and links to the problem line. No coupon field here (coupon is at checkout).

**Checkout** — single page with four blocks in order: Delivery address, Contact email (optional), Order review (items, coupon, totals), Pay. See section 10.

---

## 6. Data model (Postgres on Supabase)

All money is **integer paise** (`*_paise`). Never use floats for money. All tables in `public`, UUID primary keys (`gen_random_uuid()`), `created_at timestamptz default now()`. Add `updated_at` + trigger where noted. Write everything as SQL migrations in `supabase/migrations/` (Supabase CLI), not by clicking in the dashboard.

**categories** — `id`, `slug` (unique: `bridal`, `naturals`, `coconut-oil`), `name`, `tagline`, `description`, `parent_id` (nullable), `sort_order`, `is_active`, `seo_title`, `seo_description`.

**products** — `id`, `category_id`, `slug`, `name`, `short_description`, `description`, `attributes jsonb` (fabric, work, care, occasion, origin, process, ingredients, shelf_life, proof, etc.), `option_names text[]` (e.g. `{Size,Colour}` or `{Pack size}`), `badge text` (nullable, e.g. "New"), `is_active`, `created_at`, `updated_at`, `search_vector tsvector` (generated from name, short_description, description) with a GIN index. `unique(category_id, slug)`.

**product_variants** — `id`, `product_id`, `sku` (unique), `label` (e.g. "M / Red", "500 ml"), `option_values jsonb` (e.g. `{"Size":"M","Colour":"Red"}`), `price_paise int check (price_paise > 0)`, `compare_at_price_paise int null check (compare_at_price_paise >= price_paise)`, `stock int not null default 0 check (stock >= 0)`, `net_quantity numeric null`, `net_unit text null` (`g`, `ml`, `piece`; used for the unit-price display), `is_active`, `sort_order`. **Stock lives on variants.**

**product_images** — `id`, `product_id`, `variant_id` (nullable), `storage_path`, `alt`, `sort_order`, `is_primary`. Images live in the public Storage bucket `product-images`. A missing image falls back to a flat placeholder.

**profiles** — `id` (= `auth.users.id`), `name`, `phone` (unique, E.164, verified at login), `email` (nullable, **unverified, notification only**), `profile_completed boolean default false`, `created_at`.

**otp_requests** — `id`, `phone`, `otp_hash`, `expires_at`, `attempts int default 0`, `consumed_at`, `ip`, `created_at`. **No RLS policies; service role only.**

**cart_items** — `id`, `user_id`, `variant_id`, `qty int check (qty > 0)`, `created_at`, `unique(user_id, variant_id)`. (No guest cart.)

**wishlist_items** — `user_id`, `product_id`, `created_at`, primary key `(user_id, product_id)`.

**addresses** — `id`, `user_id`, `name`, `phone`, `line1`, `line2`, `landmark`, `city`, `state`, `pincode` (check 6 digits), `latitude numeric(9,6)`, `longitude numeric(9,6)`, `is_default`. Latitude and longitude are **required when used for an order**, so the delivery person can navigate to the pin.

**orders** — `id`, `order_number` (unique, human-readable e.g. `BZ-261012-0042`, generated by a sequence-backed function), `user_id`, `address_snapshot jsonb` (including phone, latitude, longitude), `notify_phone` (the verified login phone), `notify_email` (nullable), `subtotal_paise`, `coupon_code` (nullable), `discount_paise default 0`, `total_paise`, `payment_status` (`PENDING` | `PAID`), `order_status` (`PENDING_PAYMENT` | `CONFIRMED` | `DELIVERED`), `created_at`, `updated_at`.

**order_items** — `id`, `order_id`, `product_id`, `variant_id`, `name_snapshot`, `variant_label_snapshot`, `sku_snapshot`, `image_path_snapshot`, `qty`, `unit_price_paise`.

**order_status_history** — `id`, `order_id`, `status`, `note`, `created_at`.

**payments** — `id`, `order_id`, `razorpay_order_id` (unique), `razorpay_payment_id` (unique, nullable), `status` (`CREATED` | `CAPTURED` | `FAILED`), `amount_paise`, `method`, `raw_payload jsonb`, `created_at`, `updated_at`.

**coupons** — `id`, `code` (unique, stored uppercase), `type` (`PERCENT` | `FLAT`), `value int` (percent 1-100, or paise), `max_discount_paise` (nullable), `min_order_paise default 0`, `valid_from`, `valid_to`, `is_active`, `used_count default 0`. Managed by admin outside the app.

**reviews** — `id`, `product_id`, `user_id`, `rating int check (rating between 1 and 5)`, `comment`, `created_at`, `updated_at`. `unique(user_id, product_id)`.

**notifications** — `id`, `user_id`, `order_id`, `channel` (`WHATSAPP` | `EMAIL`), `recipient`, `template`, `payload jsonb`, `status` (`PENDING` | `SENT` | `FAILED`), `attempts`, `last_error`, `created_at`, `sent_at`. Service role only.

**Views**
- `public_reviews` — safe columns only: `id`, `product_id`, `rating`, `comment`, `created_at`, `reviewer_name` (first word of `profiles.name`). Readable by `anon`. Never exposes user ids or phone numbers.
- `product_rating_summary` — `product_id`, `avg_rating`, `review_count`. Readable by `anon`.

**Indexes:** `products(category_id, is_active)`, `product_variants(product_id)`, `cart_items(user_id)`, `orders(user_id, created_at desc)`, `order_items(order_id)`, `reviews(product_id)`, GIN on `products.search_vector`.

---

## 7. Row Level Security

Enable RLS on **every** table. Default deny.

| Table | anon | authenticated (own rows) | Notes |
| --- | --- | --- | --- |
| categories, products, product_variants, product_images | `select` where `is_active` | same | Catalog is public read. No client writes. |
| profiles | none | `select`, `update` (name only) own row | Insert/phone changes only by service role. |
| cart_items | none | `select`, `insert`, `update`, `delete` own | Stock validation happens in the route handler. |
| wishlist_items | none | `select`, `insert`, `delete` own | |
| addresses | none | full CRUD own | |
| orders, order_items, order_status_history | none | `select` own | **No client inserts or updates.** Only service role writes. |
| payments | none | none | Service role only. |
| coupons | none | none | Validated server-side only. |
| reviews | none (use `public_reviews` view) | `insert` only if eligible (below), `update`/`delete` own | |
| otp_requests, notifications | none | none | Service role only. |

**Review insert policy:** allowed only when an order exists with `orders.user_id = auth.uid()`, `orders.order_status = 'DELIVERED'` and an `order_items` row for that `product_id` on that order. The `unique(user_id, product_id)` constraint prevents a second review.

Write an automated check (SQL test or script) that proves: a user cannot read another user's cart/orders/addresses; a user cannot insert an order; a user without a delivered order cannot insert a review.

---

## 8. Server logic and API

Use **Next.js Route Handlers** (Node runtime) for all mutations. Validate every body with `zod`. Return JSON `{ ok: true, ... }` or `{ ok: false, error: { code, message } }` with correct HTTP status. Identify the caller with the Supabase session cookie (`@supabase/ssr`). Use the **service-role client only** in server code that genuinely needs it, behind `import 'server-only'`.

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `POST /api/auth/otp/request` | public | Generate and "send" OTP. |
| `POST /api/auth/otp/verify` | public | Verify OTP, create session. |
| `POST /api/auth/logout` | auth | Sign out. |
| `GET/PATCH /api/me` | auth | Read profile; set name (and later optional email). |
| `GET /api/cart` | auth | Cart with live prices and stock flags. |
| `POST /api/cart/items` | auth | `{variantId, qty}`: add or increase. Rejects if qty would exceed stock. |
| `PATCH /api/cart/items/[id]` | auth | Set quantity (capped to stock). |
| `DELETE /api/cart/items/[id]` | auth | Remove. |
| `GET/POST/DELETE /api/wishlist` | auth | Product-level wishlist. |
| `GET/POST /api/addresses`, `PATCH/DELETE /api/addresses/[id]` | auth | Address CRUD. |
| `POST /api/orders` | auth | **Checkout start.** Recheck stock, snapshot, create `PENDING_PAYMENT` order. |
| `POST/DELETE /api/orders/[id]/coupon` | auth | Apply or remove a coupon before payment. |
| `GET /api/orders`, `GET /api/orders/[id]` | auth | Own orders. |
| `POST /api/payments/create` | auth | Create (or reuse) the Razorpay order for an order. |
| `POST /api/payments/verify` | auth | Verify Razorpay signature, then finalise (idempotent). |
| `POST /api/payments/webhook` | public (signature) | Razorpay webhook. Idempotent. |
| `GET /api/products/[id]/reviews` | public | Reviews via `public_reviews`. |
| `GET /api/products/[id]/review-eligibility` | auth | `{canReview, reason}`. |
| `POST /api/products/[id]/reviews`, `PUT/DELETE /api/reviews/[id]` | auth | Review CRUD. |
| `POST /api/jobs/notifications` | secret header | Process pending notifications. |

**Catalog reads** (home, listing, product, search, sitemap) use a **cookie-less public Supabase client** (anon key) in server components with `export const revalidate = 300`, so pages are cacheable and fast. Auth-dependent bits (header user state, wishlist heart, add to cart) are small client components that call the API. Do not read cookies in catalog pages; it would make them fully dynamic.

---

## 9. Authentication: mobile OTP with a console OTP for now

### 9.1 Flow
1. `POST /api/auth/otp/request {phone}`
   - Normalise and validate an Indian mobile number (10 digits starting 6-9, optional `+91`/`91`/`0` prefix) to E.164 `+91XXXXXXXXXX`.
   - Rate limit using `otp_requests`: resend cooldown 30 s; at most 5 requests per phone per 15 min; at most 20 per IP per hour.
   - Generate a 6-digit code with `crypto.randomInt`. Store `HMAC-SHA256(OTP_HMAC_SECRET, phone + ":" + otp)` and `expires_at = now + 5 min`. **Never store the OTP in plain text.**
   - Call `otpSender.send(phone, otp)`.
2. `POST /api/auth/otp/verify {phone, otp}`
   - Use the latest unconsumed, unexpired request for the phone. Reject after 5 wrong attempts (increment `attempts`). Compare hashes with `crypto.timingSafeEqual`. Mark `consumed_at` on success.
   - Find the user by `profiles.phone`; if none, create the auth user and the `profiles` row.
   - Create the browser session (9.3). Respond `{ profileCompleted }`.
3. If `profileCompleted` is false, redirect to `/login/profile`: **one field, name only**. Save to `profiles.name` and set `profile_completed = true`. Then go to `next`.

### 9.2 OtpSender interface (so a real provider is a one-file swap)
```ts
interface OtpSender { send(phone: string, otp: string): Promise<void> }
```
- `ConsoleOtpSender` (used when `DEV_OTP_MODE=true`): logs `[DEV OTP] +91XXXXXXXXXX -> 123456` on the server, and the request route **also returns `devOtp` in the JSON**. The client logs `console.log('[DEV OTP]', devOtp)` and shows the text **"OTP sent. Check the browser console."** under the input.
- `SmsOtpSender`: a stub that throws `Not configured`. The real SMS provider is chosen later. Indian SMS typically needs DLT registration, so mention this in the README.
- **Safety:** the app must **refuse to start** (throw at module load) if `DEV_OTP_MODE=true` and `NODE_ENV=production`. In any non-dev mode the response must never contain the OTP.

### 9.3 Session bridge (our OTP, Supabase session)
Supabase's built-in phone login sends its own SMS, so we verify the OTP ourselves and then ask Supabase for a session:
- Create the user with the admin API: `admin.createUser({ phone, phone_confirm: true, email: '<digits>@phone.barakah.invalid', email_confirm: true })`. The `.invalid` address is a synthetic placeholder that is never shown or emailed.
- Mint a session server-side: `admin.generateLink({ type: 'magiclink', email })` to get a hashed token, then `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` using the **cookie-aware server client**, which sets the session cookies.
- In Supabase Auth settings, **disable public sign-ups** (users are only created by our server).
- **Verify this against the current Supabase documentation before building.** If the API differs, tell the user and propose the closest safe alternative. Do not hand-sign JWTs unless the user approves.

### 9.4 Route protection
- `middleware.ts` refreshes the Supabase session and redirects unauthenticated requests for `/cart`, `/wishlist`, `/checkout`, `/orders`, `/account` to `/login?next=<path>`.
- Authorisation never relies on middleware alone: every API route checks the session, and RLS enforces ownership.

---

## 10. Cart, checkout, coupon, payment and stock rules

These rules are exactly what the client specified.

**Cart**
- A user may add a variant up to its current `stock`. **Adding does not reduce or hold stock.**
- Two different users can hold the same variant in their carts at the same time.
- The cart page shows live warnings if a line is now short or unavailable.

**Checkout start (`POST /api/orders`)**
1. Load the user's cart lines (all categories together).
2. **Recheck every line**: variant and product active, `stock >= qty`. If any line fails, respond `409` with `[{variantId, requested, available}]` and **do not create an order**. The UI shows per-line messages and sends the user to the cart. Checkout is blocked until the user fixes the cart.
3. If all pass: in one transaction create the order (`PENDING_PAYMENT`, `payment_status = PENDING`), `order_items` (snapshots of name, variant label, SKU, image path, unit price), `address_snapshot` (name, phone, lines, city, state, pincode, **latitude, longitude**), `notify_phone` (the user's login phone), `notify_email` (optional, from the checkout form; also saved to `profiles.email`), `subtotal_paise`, `total_paise = subtotal`, and an `order_status_history` row. **Stock is not changed.**

**Coupon (`POST /api/orders/[id]/coupon {code}`)**
- Only for the user's own `PENDING_PAYMENT` order. Normalise the code to uppercase.
- Valid if: exists, `is_active`, within `valid_from..valid_to`, and `subtotal >= min_order_paise`. Discount = percent of subtotal (capped by `max_discount_paise` if set) or flat amount (never more than subtotal). **One coupon per order.**
- Recompute `discount_paise` and `total_paise`. Return the new totals. `DELETE` removes it.
- `coupons.used_count` increases **only on payment confirmation**.

**Payment**
- `POST /api/payments/create {orderId}`: order must be the user's own and `PENDING_PAYMENT`. Amount **always** comes from `orders.total_paise` in the database, never from the client. If a `payments` row with a `razorpay_order_id` already exists for the order and is not captured, reuse it. Otherwise create a Razorpay order (`currency: INR`, `receipt: order_number`, `notes: { order_id }`). Return `{ razorpayOrderId, keyId, amount }`.
- Client opens Razorpay Checkout (load the script only on the checkout page).
- `POST /api/payments/verify`: verify `HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)` with constant-time comparison, then call the finalise function.
- `POST /api/payments/webhook`: read the **raw body** (`await req.text()`), verify the `X-Razorpay-Signature` header with `RAZORPAY_WEBHOOK_SECRET`, handle `payment.captured` (finalise) and `payment.failed` (mark payment `FAILED`; order stays `PENDING_PAYMENT`). Respond 200 quickly. The webhook covers the case where the user closes the tab after paying.
- **Both `verify` and `webhook` call the same idempotent SQL function**, so whichever arrives second is a no-op.

**Finalise: SQL function `confirm_payment(...)`** (one transaction, `security definer`, callable only by the service role)
1. Lock the `payments` row for the Razorpay order. If already `CAPTURED`, return (idempotent).
2. Set payment `CAPTURED` (store `razorpay_payment_id`, method, raw payload).
3. Set the order `payment_status = PAID`, `order_status = CONFIRMED`; add an `order_status_history` row.
4. **Reduce stock** for each order item: `stock = greatest(stock - qty, 0)`. (If two buyers pay for the last unit at the same moment, stock clamps at 0 and the order still confirms. This is a known, accepted edge case for now. Add a code comment and a line in the README. Do not build extra handling.)
5. If `coupon_code` is set, `used_count = used_count + 1`.
6. Remove the purchased variants from the user's `cart_items`.
7. Insert `notifications` rows: WhatsApp to `notify_phone`, and email to `notify_email` if present.

**On failure or cancel:** the order stays `PENDING_PAYMENT`, the cart stays intact, and the user sees "Payment not completed" with a **Retry payment** button on the order page that re-opens Razorpay for the same order. No reservation, no expiry, no refund logic.

**Delivered:** admin marks `DELIVERED` outside the app. Provide `supabase/dev/mark_delivered.sql` (documented, dev only) so reviews can be tested.

---

## 11. Notifications

- Table `notifications` is an outbox. `confirm_payment` inserts rows; sending happens **outside** that transaction so a send failure never affects the order.
- Interfaces `EmailSender` and `WhatsAppSender`, each with a **Console implementation** for now that logs the full message to the server console and marks the row `SENT`. Real providers come later (WhatsApp Business needs pre-approved templates, which take time; say so in the README).
- After a successful confirmation, trigger processing inline (fire and forget) and also expose `POST /api/jobs/notifications` (requires `x-jobs-secret` header matching `JOBS_SECRET`) so a scheduler can call it later. Retry failed rows up to 3 attempts.
- Content: order number, items with variant labels and quantities, total, delivery address summary. WhatsApp goes to the verified login phone. Email goes to the optional (unverified) email entered at checkout. Later status changes, such as delivered, will reuse the same table and templates (not built now).

---

## 12. Reviews

- Public read for everyone (via `public_reviews`). Product pages show average and count only when at least one review exists.
- "Write a review" is shown only if `GET /api/products/[id]/review-eligibility` returns `canReview: true` (user has a `DELIVERED` order containing this product and has no review yet). A guest tapping it is sent to login first.
- Fields: rating (1-5) and comment (required, max 1000 chars). Users can edit and delete their own review. After deleting, they may post again (still one live review per product).
- Reviews are per **product** (not per variant).

---

## 13. SEO (non-negotiable)

- All catalog pages are **server-rendered with real HTML** (no client-only rendering of product data).
- `generateMetadata` on category, product and search pages: unique `<title>` and meta description, canonical URL, Open Graph (title, description, primary image), Twitter card.
- URLs: `/{category}` and `/{category}/{slug}`. Slugs are lowercase, hyphenated, stable.
- **JSON-LD** on product pages: `Product` with `name`, `image`, `description`, `sku`, `brand` ("Barakah"), `offers` (`price`, `priceCurrency: INR`, `availability` from stock, `url`), and `aggregateRating` / `review` **only when real reviews exist**. `BreadcrumbList` on category and product pages. `Organization` on the home page.
- `app/sitemap.ts` lists the home page, the three categories, active products (with `lastModified`), and static pages. `app/robots.ts` allows the catalog and **disallows** `/cart`, `/wishlist`, `/checkout`, `/orders`, `/account`, `/login`, `/api`, `/styleguide`. Auth and account pages also send `noindex`.
- Images: `next/image` with width/height, correct `sizes`, `alt` from `product_images.alt`, the first product image `priority`. Configure `images.remotePatterns` for the Supabase Storage host.
- Performance targets on a mid-range phone: LCP under 2.5 s, no layout shift on images (reserve aspect ratio), minimal client JS on catalog pages.
- The gate page and category pages must contain crawlable `<a href>` links to categories and products.

---

## 14. Environment variables (`.env.example` must list all, with comments)

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only
OTP_HMAC_SECRET=                      # server only, long random string
DEV_OTP_MODE=true                     # must be false/unset in production
RAZORPAY_KEY_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=                  # server only
RAZORPAY_WEBHOOK_SECRET=              # server only
JOBS_SECRET=                          # server only
```
Validate env at startup with `zod` (a `lib/env.ts` with separate server and public schemas). Fail fast with a clear message.

Local webhook testing needs a public URL to the dev server (a tunnel). Because `verify` also finalises idempotently, the full flow can be tested locally without the webhook.

---

## 15. Folder structure

```
src/
  app/
    (shop)/page.tsx                      # category gate
    (shop)/[category]/page.tsx
    (shop)/[category]/[slug]/page.tsx
    (shop)/search/page.tsx
    (account)/{cart,wishlist,checkout,orders,account}/...
    login/...
    about/ contact/ policies/...
    api/...                              # route handlers from section 8
    sitemap.ts  robots.ts  layout.tsx  globals.css
  components/{ui,layout,shop}/
  lib/
    supabase/{server,client,admin,public}.ts
    auth/{otp.ts,phone.ts,session.ts,senders.ts}
    pricing/{money.ts,coupon.ts}
    payments/razorpay.ts
    notify/{email.ts,whatsapp.ts,process.ts}
    validation/*.ts
    env.ts
  middleware.ts
supabase/
  migrations/*.sql
  seed.sql
  dev/mark_delivered.sql
  tests/rls.sql
TODO-CONTENT.md
README.md
```

---

## 16. Quality bar

- **TypeScript strict**, no `any` without a comment. Generate DB types with `supabase gen types` into `src/lib/supabase/database.types.ts`.
- **Accessibility:** semantic landmarks and headings, labels on all inputs, keyboard-operable everything (including option pickers, drawers, dialogs with focus trap and `Esc`), `alt` text, colour contrast AA, visible focus, no information by colour alone (a selected colour swatch also shows its name).
- **Security:** RLS on every table; zod validation on every route; ownership checks on every user-scoped route; OTP and webhook rate limiting/signature checks as specified; service-role key never imported from client code; no secrets in logs; Razorpay amount only from the database.
- **Tests (Vitest):** money formatting and unit-price maths; coupon calculation (percent cap, flat, min order, dates); phone normalisation; OTP hashing and verification; Razorpay signature verification (checkout and webhook); the cart-quantity cap. Add the SQL RLS checks from section 7.
- **Formatting:** `en-IN` locale, currency via a single `formatINR(paise)` helper; dates in `Asia/Kolkata`.

---

## 17. Content and decisions the client must supply

Create `TODO-CONTENT.md` listing every placeholder you add, grouped by owner. Expected items:
- Logo and brand colours (otherwise: text wordmark "Barakah Bazaar" in the serif font, tokens as above).
- Category photographs (3), product photography, alt text.
- Real product data for each category (names, descriptions, variants, prices, stock, SKUs).
- Bridal size chart and size-guide content; fabric/work/care text.
- Naturals and coconut oil: origin, process, ingredients, shelf life, and any **real** certifications or lab reports.
- Policy pages (privacy, terms, returns, shipping), About, Contact details.
- Delivery area rules and a decision on shipping charges (currently none).
- SMS, email and WhatsApp providers (all currently console stubs).

---

## 18. Definition of done (for the whole project)

A guest can pick a category, browse, filter, search and read reviews. A new user can log in with a phone number and the console OTP, give a name, add items from different categories to one cart and a wishlist, check out with an address (with map pin) and optional email, apply a coupon, pay through Razorpay test mode, and see the order confirmed with stock reduced. The console shows the WhatsApp and email messages. After the order is marked delivered in the database, the user can review the product. The design passes the anti-slop self-check, the build/lint/typecheck/tests are green, and `README.md` explains setup, the dev OTP, how to mark an order delivered, and what must change before going live (provider swaps, `DEV_OTP_MODE`, hosting).
