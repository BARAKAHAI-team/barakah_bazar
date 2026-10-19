-- =============================================================================
-- BARAKAH BAZAAR: COMPLETE DATABASE SETUP SCRIPT
-- =============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard -> SQL Editor.
-- 2. Create a new query, paste this entire file, and click "Run".
-- 3. This script will:
--    - Enable necessary extensions
--    - Create all tables with strict constraints, triggers, and indexes
--    - Create views (public_reviews, product_rating_summary)
--    - Create the idempotent confirm_payment() transaction function
--    - Enable Row Level Security (RLS) on EVERY table with strict policies
--    - Configure the public 'product-images' storage bucket
--    - Populate full seed data (3 categories, 13 products with variants & coupons)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: EXTENSIONS & HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create sequence if not exists public.order_number_seq;

create or replace function public.next_order_number()
returns text as $$
declare
  prefix text;
  seq_val int;
begin
  prefix := 'BZ-' || to_char(now(), 'YYMMDD') || '-';
  seq_val := (nextval('public.order_number_seq') % 10000);
  return prefix || lpad(seq_val::text, 4, '0');
end;
$$ language plpgsql;

-- -----------------------------------------------------------------------------
-- SECTION 2: CATALOG SCHEMA
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('bridal', 'naturals', 'coconut-oil')),
  name text not null,
  tagline text,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null,
  name text not null,
  short_description text,
  description text,
  attributes jsonb not null default '{}'::jsonb,
  option_names text[] not null default '{}',
  badge text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  seo_title text null,
  seo_description text null,
  seo_keywords text[] not null default '{}',
  thumbnail_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, ''))
  ) stored,
  unique(category_id, slug)
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists idx_products_category_active on public.products(category_id, is_active);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique not null,
  label text not null,
  option_values jsonb not null default '{}'::jsonb,
  price_paise int not null check (price_paise > 0),
  compare_at_price_paise int null check (compare_at_price_paise is null or compare_at_price_paise >= price_paise),
  stock int not null default 0 check (stock >= 0),
  net_quantity numeric null check (net_quantity is null or net_quantity > 0),
  net_unit text null check (net_unit is null or net_unit in ('g', 'ml', 'piece')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  storage_path text null,
  alt text not null default '',
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on public.product_images(product_id);

-- -----------------------------------------------------------------------------
-- SECTION 3: USER & COMMERCE SCHEMA
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text unique not null,
  email text null,
  role text not null default 'customer' check (role in ('customer', 'admin', 'manager')),
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table if not exists public.otp_requests (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz null,
  ip text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_requests_phone_expires on public.otp_requests(phone, expires_at);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  qty int not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, variant_id)
);

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  line1 text not null,
  line2 text null,
  landmark text null,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create index if not exists idx_addresses_user_id on public.addresses(user_id);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code = upper(code)),
  type text not null check (type in ('PERCENT', 'FLAT')),
  value int not null check (value > 0),
  max_discount_paise int null check (max_discount_paise is null or max_discount_paise > 0),
  min_order_paise int not null default 0 check (min_order_paise >= 0),
  valid_from timestamptz not null,
  valid_to timestamptz not null,
  is_active boolean not null default true,
  used_count int not null default 0 check (used_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default public.next_order_number(),
  user_id uuid not null references auth.users(id) on delete restrict,
  address_snapshot jsonb not null,
  notify_phone text not null,
  notify_email text null,
  subtotal_paise int not null check (subtotal_paise >= 0),
  coupon_code text null references public.coupons(code),
  discount_paise int not null default 0 check (discount_paise >= 0),
  total_paise int not null check (total_paise >= 0),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'PAID')),
  order_status text not null default 'PENDING_PAYMENT' check (order_status in ('PENDING_PAYMENT', 'CONFIRMED', 'DELIVERED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  name_snapshot text not null,
  variant_label_snapshot text not null,
  sku_snapshot text not null,
  image_path_snapshot text null,
  qty int not null check (qty > 0),
  unit_price_paise int not null check (unit_price_paise > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  razorpay_order_id text unique not null,
  razorpay_payment_id text unique null,
  status text not null default 'CREATED' check (status in ('CREATED', 'CAPTURED', 'FAILED')),
  amount_paise int not null check (amount_paise > 0),
  method text null,
  raw_payload jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create index if not exists idx_payments_order_id on public.payments(order_id);

create table if not exists public.site_banners (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  highlight_text text null,
  link_url text null,
  badge_text text null,
  bg_color text not null default '#0F3E2E',
  text_color text not null default '#F9F6EE',
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_banners_updated_at on public.site_banners;
create trigger trg_site_banners_updated_at
  before update on public.site_banners
  for each row execute function public.set_updated_at();

create index if not exists idx_site_banners_active on public.site_banners(is_active, starts_at, ends_at);
create index if not exists idx_payments_razorpay_order on public.payments(razorpay_order_id);

-- -----------------------------------------------------------------------------
-- SECTION 4: REVIEWS & NOTIFICATIONS
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null check (length(comment) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create index if not exists idx_reviews_product_id on public.reviews(product_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  channel text not null check (channel in ('WHATSAPP', 'EMAIL')),
  recipient text not null,
  template text not null,
  payload jsonb not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'FAILED')),
  attempts int not null default 0,
  last_error text null,
  created_at timestamptz not null default now(),
  sent_at timestamptz null
);

create index if not exists idx_notifications_status_created on public.notifications(status, created_at);

-- -----------------------------------------------------------------------------
-- SECTION 5: VIEWS & SQL FUNCTIONS
-- -----------------------------------------------------------------------------
create or replace view public.public_reviews as
select
  r.id,
  r.product_id,
  r.rating,
  r.comment,
  r.created_at,
  coalesce(nullif(split_part(trim(p.name), ' ', 1), ''), 'Verified Customer') as reviewer_name
from public.reviews r
left join public.profiles p on p.id = r.user_id;

create or replace view public.product_rating_summary as
select
  p.id as product_id,
  coalesce(round(avg(r.rating)::numeric, 1), 0.0) as avg_rating,
  count(r.id)::int as review_count
from public.products p
left join public.reviews r on r.product_id = p.id
group by p.id;

create or replace function public.confirm_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_method text default null,
  p_raw_payload jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_wa_payload jsonb;
  v_email_payload jsonb;
begin
  select * into v_payment
  from public.payments
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'PAYMENT_NOT_FOUND');
  end if;

  if v_payment.status = 'CAPTURED' then
    return jsonb_build_object(
      'ok', true,
      'status', 'ALREADY_CAPTURED',
      'order_id', v_payment.order_id
    );
  end if;

  select * into v_order
  from public.orders
  where id = v_payment.order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND');
  end if;

  update public.payments
  set
    status = 'CAPTURED',
    razorpay_payment_id = p_razorpay_payment_id,
    method = coalesce(p_method, method),
    raw_payload = coalesce(p_raw_payload, raw_payload),
    updated_at = now()
  where id = v_payment.id;

  update public.orders
  set
    payment_status = 'PAID',
    order_status = 'CONFIRMED',
    updated_at = now()
  where id = v_order.id;

  insert into public.order_status_history (order_id, status, note)
  values (v_order.id, 'CONFIRMED', 'Payment verified and captured via Razorpay (' || p_razorpay_payment_id || ')');

  update public.product_variants v
  set
    stock = greatest(v.stock - oi.qty, 0),
    updated_at = now()
  from public.order_items oi
  where oi.order_id = v_order.id and v.id = oi.variant_id;

  if v_order.coupon_code is not null then
    update public.coupons
    set used_count = used_count + 1
    where code = v_order.coupon_code;
  end if;

  delete from public.cart_items
  where user_id = v_order.user_id
    and variant_id in (
      select variant_id from public.order_items where order_id = v_order.id
    );

  v_wa_payload := jsonb_build_object(
    'order_number', v_order.order_number,
    'total_paise', v_order.total_paise,
    'notify_phone', v_order.notify_phone,
    'address', v_order.address_snapshot
  );

  insert into public.notifications (user_id, order_id, channel, recipient, template, payload)
  values (
    v_order.user_id,
    v_order.id,
    'WHATSAPP',
    v_order.notify_phone,
    'ORDER_CONFIRMATION',
    v_wa_payload
  );

  if v_order.notify_email is not null and length(trim(v_order.notify_email)) > 0 then
    v_email_payload := jsonb_build_object(
      'order_number', v_order.order_number,
      'total_paise', v_order.total_paise,
      'notify_email', v_order.notify_email,
      'address', v_order.address_snapshot
    );

    insert into public.notifications (user_id, order_id, channel, recipient, template, payload)
    values (
      v_order.user_id,
      v_order.id,
      'EMAIL',
      v_order.notify_email,
      'ORDER_CONFIRMATION',
      v_email_payload
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', 'CONFIRMED',
    'order_id', v_order.id,
    'order_number', v_order.order_number
  );
end;
$$;

revoke all on function public.confirm_payment from public;
revoke all on function public.confirm_payment from anon;
revoke all on function public.confirm_payment from authenticated;
grant execute on function public.confirm_payment to service_role;

-- -----------------------------------------------------------------------------
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.otp_requests enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow anon and auth read active categories" on public.categories;
drop policy if exists "Allow anon and auth read active products" on public.products;
drop policy if exists "Allow anon and auth read active variants" on public.product_variants;
drop policy if exists "Allow anon and auth read product images" on public.product_images;
drop policy if exists "Allow users to read own profile" on public.profiles;
drop policy if exists "Allow users to update own profile" on public.profiles;
drop policy if exists "Allow users to read own cart items" on public.cart_items;
drop policy if exists "Allow users to insert own cart items" on public.cart_items;
drop policy if exists "Allow users to update own cart items" on public.cart_items;
drop policy if exists "Allow users to delete own cart items" on public.cart_items;
drop policy if exists "Allow users to read own wishlist" on public.wishlist_items;
drop policy if exists "Allow users to insert own wishlist" on public.wishlist_items;
drop policy if exists "Allow users to delete own wishlist" on public.wishlist_items;
drop policy if exists "Allow users to read own addresses" on public.addresses;
drop policy if exists "Allow users to insert own addresses" on public.addresses;
drop policy if exists "Allow users to update own addresses" on public.addresses;
drop policy if exists "Allow users to delete own addresses" on public.addresses;
drop policy if exists "Allow users to read own orders" on public.orders;
drop policy if exists "Allow users to read own order items" on public.order_items;
drop policy if exists "Allow users to read own order history" on public.order_status_history;
drop policy if exists "Allow users to read own reviews" on public.reviews;
drop policy if exists "Allow review insert only if product was delivered to user" on public.reviews;
drop policy if exists "Allow users to update own review" on public.reviews;
drop policy if exists "Allow users to delete own review" on public.reviews;

-- Catalog policies
create policy "Allow anon and auth read active categories"
  on public.categories for select using (is_active = true);

create policy "Allow anon and auth read active products"
  on public.products for select using (is_active = true);

create policy "Allow anon and auth read active variants"
  on public.product_variants for select using (is_active = true);

create policy "Allow anon and auth read product images"
  on public.product_images for select using (true);

-- Profile policies
create policy "Allow users to read own profile"
  on public.profiles for select to authenticated using (auth.uid() = id);

create policy "Allow users to update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Cart policies
create policy "Allow users to read own cart items"
  on public.cart_items for select to authenticated using (auth.uid() = user_id);

create policy "Allow users to insert own cart items"
  on public.cart_items for insert to authenticated with check (auth.uid() = user_id);

create policy "Allow users to update own cart items"
  on public.cart_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow users to delete own cart items"
  on public.cart_items for delete to authenticated using (auth.uid() = user_id);

-- Wishlist policies
create policy "Allow users to read own wishlist"
  on public.wishlist_items for select to authenticated using (auth.uid() = user_id);

create policy "Allow users to insert own wishlist"
  on public.wishlist_items for insert to authenticated with check (auth.uid() = user_id);

create policy "Allow users to delete own wishlist"
  on public.wishlist_items for delete to authenticated using (auth.uid() = user_id);

-- Address policies
create policy "Allow users to read own addresses"
  on public.addresses for select to authenticated using (auth.uid() = user_id);

create policy "Allow users to insert own addresses"
  on public.addresses for insert to authenticated with check (auth.uid() = user_id);

create policy "Allow users to update own addresses"
  on public.addresses for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow users to delete own addresses"
  on public.addresses for delete to authenticated using (auth.uid() = user_id);

-- Order policies (Users select own; Service Role handles inserts and updates)
create policy "Allow users to read own orders"
  on public.orders for select to authenticated using (auth.uid() = user_id);

create policy "Allow users to read own order items"
  on public.order_items for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Allow users to read own order history"
  on public.order_status_history for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = auth.uid()
    )
  );

-- Review policies
create policy "Allow users to read own reviews"
  on public.reviews for select to authenticated using (auth.uid() = user_id);

create policy "Allow review insert only if product was delivered to user"
  on public.reviews for insert to authenticated with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.user_id = auth.uid()
        and o.order_status = 'DELIVERED'
        and oi.product_id = reviews.product_id
    )
  );

create policy "Allow users to update own review"
  on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow users to delete own review"
  on public.reviews for delete to authenticated using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- SECTION 7: STORAGE BUCKET SETUP
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public Access to product-images'
  ) then
    create policy "Public Access to product-images"
      on storage.objects for select
      using (bucket_id = 'product-images');
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- SECTION 8: SEED DATA
-- -----------------------------------------------------------------------------
insert into public.categories (id, slug, name, tagline, description, sort_order, is_active, seo_title, seo_description)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'bridal',
    'Barakah Bridal Wear & Fine Ornaments',
    'Curated bridal couture & heritage jewellery',
    'Handcrafted bridal lehengas, pure silk sarees, kundan sets, temple jewellery & bridal ornaments tailored for wedding celebrations.',
    1,
    true,
    'Bridal Wear & Fine Ornaments | Barakah Bazaar',
    'Explore Barakah Bridal Collections: handcrafted bridal wear, lehengas, sarees, kundan choker sets, and temple jewellery.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'naturals',
    'Barakah Naturals',
    'Farm-direct natural products',
    'Single-origin natural spices and farm produce sourced directly from agricultural growers.',
    2,
    true,
    'Organic Spices & Farm Produce | Barakah Naturals',
    'Discover Barakah Naturals: single-origin turmeric powder, organic chilli powder, and farm-fresh natural staples.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'coconut-oil',
    'Barakah Kerala Pure Coconut Oil',
    'Traditional cold-pressed Kerala coconut oil',
    'Pure, unrefined coconut oil extracted from handpicked sun-dried Kerala copra.',
    3,
    true,
    'Kerala Pure Coconut Oil | Barakah Bazaar',
    '100% pure traditional Kerala coconut oil, unrefined and cold-pressed in convenient pack sizes.'
  )
on conflict (slug) do nothing;

-- 5 Bridal Products
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values
  (
    'b1111111-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'zari-embroidered-silk-lehenga',
    'Zari Embroidered Silk Lehenga',
    'Classic bridal red and maroon lehenga with intricate gold zari embroidery.',
    'A classic bridal ensemble featuring rich hand-done zari needlework on pure raw silk. Comes with matching blouse piece and organza dupatta. [DEMO DATA TO BE REPLACED]',
    '{"fabric": "Pure Raw Silk with Organza Dupatta", "work": "Hand Zari & Zardozi needlework", "care": "Strictly Dry Clean Only", "occasion": "Bride"}'::jsonb,
    array['Size', 'Colour'],
    'New',
    true
  ),
  (
    'b1111111-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'handcrafted-velvet-bridal-anarkali',
    'Handcrafted Velvet Bridal Anarkali',
    'Deep royal maroon velvet floor-length anarkali suit with antique tilla embroidery.',
    'Crafted from plush micro-velvet, this floor-grazing bridal anarkali features Mughal-inspired floral tilla motifs and embellished dupatta. [DEMO DATA TO BE REPLACED]',
    '{"fabric": "Micro Velvet & Net", "work": "Antique Tilla & Dabka Work", "care": "Dry Clean Only", "occasion": "Reception"}'::jsonb,
    array['Size', 'Colour'],
    null,
    true
  ),
  (
    'b1111111-0000-0000-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'pastel-floral-organza-saree',
    'Pastel Floral Organza Saree',
    'Delicate hand-painted organza saree with pearl and sequin borders.',
    'Designed for daytime celebrations, this sheer organza drape is accented with subtle pearl and mirror work along the edges. [DEMO DATA TO BE REPLACED]',
    '{"fabric": "Pure Silk Organza", "work": "Hand-painted floral motifs with pearl borders", "care": "Dry Clean Only", "occasion": "Mehendi"}'::jsonb,
    array['Size', 'Colour'],
    null,
    true
  ),
  (
    'b1111111-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'mustard-georgette-sharara-set',
    'Mustard Georgette Sharara Set',
    'Vibrant three-piece sharara set with gota patti detailing for Haldi festivities.',
    'A lightweight festive choice in fluid georgette featuring traditional gota patti embellishments and flared sharara pants. [DEMO DATA TO BE REPLACED]',
    '{"fabric": "Viscose Georgette", "work": "Traditional Gota Patti Work", "care": "Dry Clean Only", "occasion": "Haldi"}'::jsonb,
    array['Size', 'Colour'],
    'Popular',
    true
  ),
  (
    'b1111111-0000-0000-0000-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'emerald-green-reception-lehenga',
    'Emerald Green Reception Lehenga',
    'Opulent jewel-toned lehenga adorned with cutdana and matte metallic sequins.',
    'An evening reception showstopper tailored in rich satin-silk featuring structured flare and cutdana geometric embroidery. [DEMO DATA TO BE REPLACED]',
    '{"fabric": "Heavy Satin Silk", "work": "Cutdana & Sequin geometric hand embroidery", "care": "Dry Clean Only", "occasion": "Reception"}'::jsonb,
    array['Size', 'Colour'],
    null,
    true
  )
on conflict do nothing;

-- Bridal Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-XS', 'XS / Bridal Red', '{"Size":"XS","Colour":"Bridal Red"}'::jsonb, 6800000, 7500000, 3, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-S',  'S / Bridal Red',  '{"Size":"S","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 5, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-M',  'M / Bridal Red',  '{"Size":"M","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 4, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-L',  'L / Bridal Red',  '{"Size":"L","Colour":"Bridal Red"}'::jsonb,  6800000, 7500000, 2, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-RED-XL', 'XL / Bridal Red', '{"Size":"XL","Colour":"Bridal Red"}'::jsonb, 6800000, 7500000, 0, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-XS', 'XS / Deep Crimson', '{"Size":"XS","Colour":"Deep Crimson"}'::jsonb, 6800000, 7500000, 2, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-S',  'S / Deep Crimson',  '{"Size":"S","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 4, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-M',  'M / Deep Crimson',  '{"Size":"M","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 3, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-L',  'L / Deep Crimson',  '{"Size":"L","Colour":"Deep Crimson"}'::jsonb,  6800000, 7500000, 1, true),
  ('b1111111-0000-0000-0000-000000000001', 'BRD-LHG-MAR-XL', 'XL / Deep Crimson', '{"Size":"XL","Colour":"Deep Crimson"}'::jsonb, 6800000, 7500000, 2, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-XS', 'XS / Maroon', '{"Size":"XS","Colour":"Maroon"}'::jsonb, 4200000, 4800000, 4, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-S',  'S / Maroon',  '{"Size":"S","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 6, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-M',  'M / Maroon',  '{"Size":"M","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 3, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-L',  'L / Maroon',  '{"Size":"L","Colour":"Maroon"}'::jsonb,  4200000, 4800000, 2, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-MRN-XL', 'XL / Maroon', '{"Size":"XL","Colour":"Maroon"}'::jsonb, 4200000, 4800000, 0, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-XS', 'XS / Plum',   '{"Size":"XS","Colour":"Plum"}'::jsonb,   4200000, 4800000, 3, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-S',  'S / Plum',    '{"Size":"S","Colour":"Plum"}'::jsonb,    4200000, 4800000, 4, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-M',  'M / Plum',    '{"Size":"M","Colour":"Plum"}'::jsonb,    4200000, 4800000, 5, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-L',  'L / Plum',    '{"Size":"L","Colour":"Plum"}'::jsonb,    4200000, 4800000, 1, true),
  ('b1111111-0000-0000-0000-000000000002', 'BRD-ANK-PLM-XL', 'XL / Plum',   '{"Size":"XL","Colour":"Plum"}'::jsonb,   4200000, 4800000, 2, true),
  ('b1111111-0000-0000-0000-000000000003', 'BRD-SAR-BLS-FREE', 'Free Size / Blush Pink', '{"Size":"Free Size","Colour":"Blush Pink"}'::jsonb, 1850000, 2200000, 8, true),
  ('b1111111-0000-0000-0000-000000000003', 'BRD-SAR-PCH-FREE', 'Free Size / Soft Peach', '{"Size":"Free Size","Colour":"Soft Peach"}'::jsonb, 1850000, 2200000, 4, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-S', 'S / Mustard Yellow', '{"Size":"S","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 5, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-M', 'M / Mustard Yellow', '{"Size":"M","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 4, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MST-L', 'L / Mustard Yellow', '{"Size":"L","Colour":"Mustard Yellow"}'::jsonb, 2450000, 2800000, 2, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-S', 'S / Mint Green',     '{"Size":"S","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 3, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-M', 'M / Mint Green',     '{"Size":"M","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 6, true),
  ('b1111111-0000-0000-0000-000000000004', 'BRD-SHR-MNT-L', 'L / Mint Green',     '{"Size":"L","Colour":"Mint Green"}'::jsonb,     2450000, 2800000, 0, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-S', 'S / Emerald Green', '{"Size":"S","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 3, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-M', 'M / Emerald Green', '{"Size":"M","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 2, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-EMR-L', 'L / Emerald Green', '{"Size":"L","Colour":"Emerald Green"}'::jsonb, 8500000, 9500000, 1, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-S', 'S / Midnight Navy', '{"Size":"S","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 2, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-M', 'M / Midnight Navy', '{"Size":"M","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 3, true),
  ('b1111111-0000-0000-0000-000000000005', 'BRD-REC-NVY-L', 'L / Midnight Navy', '{"Size":"L","Colour":"Midnight Navy"}'::jsonb, 8500000, 9500000, 0, true)
on conflict (sku) do nothing;

-- Product 6: Royal Kundan & Pearl Bridal Choker Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000006',
  '11111111-1111-1111-1111-111111111111',
  'royal-kundan-pearl-bridal-choker-set',
  'Royal Kundan & Pearl Bridal Choker Set',
  'Handcrafted 24K gold-plated bridal choker necklace with matching jhumkas and maang tikka.',
  'An opulent bridal choker necklace handcrafted with high-grade uncut Kundan stones, green meenakari backing, and cascading freshwater pearls. Includes a grand choker, a pair of chandelier jhumka earrings, and a matha patti/maang tikka.',
  '{"fabric": "24K Micro Gold Plated Brass Alloy & Kundan", "work": "Hand-set Uncut Kundan & Pearl Clusters", "care": "Store in airtight velvet box. Keep away from water and direct perfume spray.", "occasion": "Bride", "sub_category": "Choker & Necklace Sets", "inclusions": "1 Choker Necklace, 1 Pair Jhumka Earrings, 1 Maang Tikka"}'::jsonb,
  array['Colour'],
  'Bestseller',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000006', 'ORN-KND-GLD-SET', 'Gold & Pearl White', '{"Colour":"Gold & Pearl White"}'::jsonb, 1850000, 2200000, 6, true),
  ('b1111111-0000-0000-0000-000000000006', 'ORN-KND-RUB-SET', 'Imperial Ruby & Green', '{"Colour":"Imperial Ruby & Green"}'::jsonb, 1850000, 2200000, 4, true)
on conflict (sku) do nothing;

-- Product 7: Antique Temple Gold Lakshmi Haram
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000007',
  '11111111-1111-1111-1111-111111111111',
  'antique-temple-gold-lakshmi-haram',
  'Antique Temple Gold Lakshmi Haram',
  'Heritage South Indian matte antique gold finish long necklace with Goddess Lakshmi motifs.',
  'Inspired by centuries-old Dravidian temple architecture, this long haram necklace features finely embossed Lakshmi motifs surrounded by peacocks and ruby cabochon stones. Complete with traditional jhumka earrings.',
  '{"fabric": "Antique Matte Gold Plated Brass & Temple Kemp Stones", "work": "Embossed Nakshi Temple Carving & Kemp Work", "care": "Wipe with soft chamois cloth after use. Avoid moisture.", "occasion": "Wedding", "sub_category": "Temple Jewellery", "inclusions": "1 Long Haram (24 Inches), 1 Pair Jhumkas"}'::jsonb,
  array['Colour'],
  'Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000007', 'ORN-TMP-GLD-FREE', 'Antique Matte Gold', '{"Colour":"Antique Matte Gold"}'::jsonb, 2400000, 2800000, 5, true),
  ('b1111111-0000-0000-0000-000000000007', 'ORN-TMP-RUB-FREE', 'Ruby Kemp Red & Gold', '{"Colour":"Ruby Kemp Red & Gold"}'::jsonb, 2400000, 2800000, 3, true)
on conflict (sku) do nothing;

-- Product 8: Meenakari Jadau Bridal Bangles Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000008',
  '11111111-1111-1111-1111-111111111111',
  'meenakari-jadau-bridal-bangles-set',
  'Meenakari Jadau Bridal Bangles (Set of 4)',
  'Traditional openable gold-plated bridal kadas adorned with intricate royal peacock enamel work.',
  'A luxurious set of four bridal kadas handcrafted in Jaipur, featuring vibrant red and green meenakari hand-painted work, pavé kundan detailing, and secure screw closures.',
  '{"fabric": "22K Micro Gold Plated Brass with Jaipur Meenakari", "work": "Hand-painted Enamel & Pavé Kundan Settings", "care": "Wipe clean with a dry cloth. Store in padded pouch.", "occasion": "Bride", "sub_category": "Bangles & Kadas", "inclusions": "Set of 4 Openable Screw Kadas"}'::jsonb,
  array['Size'],
  'Handcrafted',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-24', '2.4 (Small)', '{"Size":"2.4 (Small)"}'::jsonb, 1250000, 1500000, 6, true),
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-26', '2.6 (Medium)', '{"Size":"2.6 (Medium)"}'::jsonb, 1250000, 1500000, 8, true),
  ('b1111111-0000-0000-0000-000000000008', 'ORN-BNG-28', '2.8 (Large)', '{"Size":"2.8 (Large)"}'::jsonb, 1250000, 1500000, 4, true)
on conflict (sku) do nothing;

-- Product 9: Kundan Matha Patti & Crescent Maang Tikka
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000009',
  '11111111-1111-1111-1111-111111111111',
  'kundan-matha-patti-maang-tikka',
  'Kundan Matha Patti & Crescent Maang Tikka',
  'Multi-string pearl side-bands with an ornate crescent kundan centerpiece for wedding ceremonies.',
  'A statement bridal forehead ornament featuring delicate layers of tiny pearls framing the face and an intricate floral kundan centerpiece with hanging pearl clusters.',
  '{"fabric": "18K Yellow Gold Plated Alloy & Natural Seed Pearls", "work": "Polki Kundan Stone Setting & Pearl Stringing", "care": "Store flat in airtight box.", "occasion": "Bride", "sub_category": "Hair Ornaments", "inclusions": "1 Complete Matha Patti with side pearl strings"}'::jsonb,
  array['Colour'],
  'Popular',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000009', 'ORN-MTH-GLD', 'Pearl White & Gold', '{"Colour":"Pearl White & Gold"}'::jsonb, 780000, 950000, 7, true),
  ('b1111111-0000-0000-0000-000000000009', 'ORN-MTH-EMR', 'Emerald Green Accent', '{"Colour":"Emerald Green Accent"}'::jsonb, 780000, 950000, 5, true)
on conflict (sku) do nothing;

-- Product 10: Chandbali Kundan Bridal Drop Earrings
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000010',
  '11111111-1111-1111-1111-111111111111',
  'chandbali-kundan-bridal-drop-earrings',
  'Chandbali Kundan Bridal Drop Earrings',
  'Grand crescent-shaped chandelier earrings with hanging pearl drops and ruby accents.',
  'Mughal-inspired oversized chandbali earrings featuring delicate floral motifs, hand-set kundan work, and south sea pearl drops. Lightweight yet high impact for sangeet and reception.',
  '{"fabric": "Antique Gold Plated Brass & South Sea Pearls", "work": "Faceted Kundan & Ruby Quartz Drops", "care": "Keep in cotton-lined box.", "occasion": "Reception", "sub_category": "Earrings & Jhumkas", "inclusions": "1 Pair Chandbali Earrings with Ear Chains"}'::jsonb,
  array['Colour'],
  null,
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000010', 'ORN-EAR-GLD', 'Antique Gold & Pearl', '{"Colour":"Antique Gold & Pearl"}'::jsonb, 650000, 800000, 8, true),
  ('b1111111-0000-0000-0000-000000000010', 'ORN-EAR-RUB', 'Ruby Red & Pearl', '{"Colour":"Ruby Red & Pearl"}'::jsonb, 650000, 800000, 6, true)
on conflict (sku) do nothing;

-- Product 11: Banarasi Katan Silk Bridal Saree
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000011',
  '11111111-1111-1111-1111-111111111111',
  'banarasi-katan-silk-bridal-saree',
  'Banarasi Katan Silk Bridal Saree',
  'Heirloom handwoven pure silk saree adorned with intricate Kadwa gold zari floral jaal.',
  'Woven on traditional handlooms in Varanasi by master weavers over 45 days. Features pure Katan silk in deep vermilion red, dense floral kadwa jangla weave in real gold-tested zari, and an unstitched heavy brocade blouse piece.',
  '{"fabric": "100% Pure Katan Silk Handloom", "work": "Traditional Kadwa Gold Zari Floral Jaal", "care": "Dry Clean Only. Preserve wrapped in pure muslin cloth.", "occasion": "Bride / Muhurtham", "sub_category": "Lehengas & Sarees", "inclusions": "6.5 Metres Saree with Unstitched Contrast Blouse Piece"}'::jsonb,
  array['Colour'],
  'Masterpiece',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000011', 'BRD-BAN-RED', 'Vermilion Bridal Red', '{"Colour":"Vermilion Bridal Red"}'::jsonb, 3400000, 3950000, 4, true),
  ('b1111111-0000-0000-0000-000000000011', 'BRD-BAN-MRN', 'Imperial Maroon Zari', '{"Colour":"Imperial Maroon Zari"}'::jsonb, 3400000, 3950000, 3, true)
on conflict (sku) do nothing;

-- Product 12: Jadau Polki Heritage Navratan Choker Set
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'b1111111-0000-0000-0000-000000000012',
  '11111111-1111-1111-1111-111111111111',
  'jadau-polki-heritage-navratan-choker-set',
  'Jadau Polki Heritage Navratan Choker Set',
  'Royal Rajasthani 9-gemstone necklace handcrafted with uncut polki and emerald drops.',
  'An auspicious Navratan masterpiece embodying royal Indian heritage. Features uncut polki stones set in foil, nine planetary gemstones, ruby cabochons, and hand-strung natural seed pearls with matching drop earrings.',
  '{"fabric": "22K Micro Gold Plated Brass & Navratan Gemstones", "work": "Open Foil Jadau Setting with Emerald Bead Drops", "care": "Keep in cotton-lined box away from moisture.", "occasion": "Wedding / Sangeet", "sub_category": "Choker & Necklace Sets", "inclusions": "1 Navratan Choker, 1 Pair Navratan Jhumkas"}'::jsonb,
  array['Style'],
  'Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, is_active)
values
  ('b1111111-0000-0000-0000-000000000012', 'ORN-NAV-STD', 'Classic Navratan Multi-gem', '{"Style":"Classic Navratan Multi-gem"}'::jsonb, 2650000, 3100000, 5, true)
on conflict (sku) do nothing;

-- 6 Naturals Products
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values
  (
    'a2222222-0000-0000-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'organic-turmeric-powder',
    'Organic Turmeric Powder',
    'High-curcumin single-origin ground turmeric root sourced from Wayanad farmers.',
    'Pure golden turmeric ground from sun-cured rhizomes. Free from artificial colour, starch additives, or preservatives. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Wayanad, Kerala", "ingredients": "100% Sun-dried Turmeric Rhizomes (Curcuma longa)", "shelf_life": "12 months from packing"}'::jsonb,
    array['Pack size'],
    'Bestseller',
    true
  ),
  (
    'a2222222-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'organic-chilli-powder',
    'Organic Chilli Powder',
    'Sun-dried stone-ground red chillies offering natural heat and vibrant colour.',
    'Made from stemless ripe red chillies dried under direct sunlight and slowly ground to retain natural capsaicin and oils. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Guntur & Byadgi, India", "ingredients": "100% Whole Sun-dried Red Chillies", "shelf_life": "9 months from packing"}'::jsonb,
    array['Pack size'],
    null,
    true
  ),
  (
    'a2222222-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    'tellicherry-black-peppercorns',
    'Tellicherry Black Peppercorns',
    'Extra bold whole black pepper berries harvested from Malabar coast estates.',
    'Hand-sorted extra-bold black peppercorns renowned for deep woodsy aroma and sharp lingering heat. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Malabar Coast, Kerala", "ingredients": "100% Whole Black Peppercorns", "shelf_life": "24 months from packing"}'::jsonb,
    array['Pack size'],
    null,
    true
  ),
  (
    'a2222222-0000-0000-0000-000000000004',
    '22222222-2222-2222-2222-222222222222',
    'green-cardamom-pods',
    'Green Cardamom Pods',
    'Aromatic 8mm bold green cardamom pods from the Cardamom Hills.',
    'Fragrant whole green cardamom selected for plump seeds and high essential oil content. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Idukki, Kerala", "ingredients": "100% Whole Green Cardamom", "shelf_life": "18 months from packing"}'::jsonb,
    array['Pack size'],
    null,
    true
  ),
  (
    'a2222222-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    'raw-forest-honey',
    'Raw Forest Honey',
    'Unprocessed multi-floral honey harvested from Western Ghats wild hives.',
    'Unpasteurised, unfiltered wild honey retaining natural pollens and enzymes. Never adulterated with corn or rice syrup. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Nilgiri Biosphere, Western Ghats", "ingredients": "100% Raw Wild Honey", "shelf_life": "24 months (natural crystallization may occur)"}'::jsonb,
    array['Pack size'],
    'New',
    true
  ),
  (
    'a2222222-0000-0000-0000-000000000006',
    '22222222-2222-2222-2222-222222222222',
    'dry-ginger-powder',
    'Dry Ginger Powder (Chukku)',
    'Traditional stone-milled dried ginger root with intense warmth.',
    'Prepared from peeled and sun-cured Kerala ginger rhizomes, ideal for traditional beverages and culinary seasoning. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Ernakulam, Kerala", "ingredients": "100% Sun-dried Ginger Root", "shelf_life": "12 months from packing"}'::jsonb,
    array['Pack size'],
    null,
    true
  )
on conflict do nothing;

-- Naturals Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  ('a2222222-0000-0000-0000-000000000001', 'NAT-TUR-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 8500,  10000, 25, 100, 'g', true),
  ('a2222222-0000-0000-0000-000000000001', 'NAT-TUR-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 19500, 23000, 18, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000001', 'NAT-TUR-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 36000, 42000, 10, 500, 'g', true),
  ('a2222222-0000-0000-0000-000000000002', 'NAT-CHL-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 9500,  11000, 30, 100, 'g', true),
  ('a2222222-0000-0000-0000-000000000002', 'NAT-CHL-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 22000, 26000, 15, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000002', 'NAT-CHL-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 41000, 48000, 8,  500, 'g', true),
  ('a2222222-0000-0000-0000-000000000003', 'NAT-PEP-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 18000, 21000, 20, 100, 'g', true),
  ('a2222222-0000-0000-0000-000000000003', 'NAT-PEP-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 42000, 49000, 12, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000003', 'NAT-PEP-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 79000, 92000, 4,  500, 'g', true),
  ('a2222222-0000-0000-0000-000000000004', 'NAT-CRD-50G',  '50 g',  '{"Pack size":"50 g"}'::jsonb,  24000, 28000, 15, 50,  'g', true),
  ('a2222222-0000-0000-0000-000000000004', 'NAT-CRD-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 46000, 52000, 10, 100, 'g', true),
  ('a2222222-0000-0000-0000-000000000004', 'NAT-CRD-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 108000,120000,3, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000005', 'NAT-HNY-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 28000, 32000, 14, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000005', 'NAT-HNY-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 52000, 59000, 8,  500, 'g', true),
  ('a2222222-0000-0000-0000-000000000005', 'NAT-HNY-1000G','1 kg',  '{"Pack size":"1 kg"}'::jsonb,  98000, 110000,2,  1000,'g', true),
  ('a2222222-0000-0000-0000-000000000006', 'NAT-GNG-100G', '100 g', '{"Pack size":"100 g"}'::jsonb, 12000, 14000, 20, 100, 'g', true),
  ('a2222222-0000-0000-0000-000000000006', 'NAT-GNG-250G', '250 g', '{"Pack size":"250 g"}'::jsonb, 27500, 31000, 12, 250, 'g', true),
  ('a2222222-0000-0000-0000-000000000006', 'NAT-GNG-500G', '500 g', '{"Pack size":"500 g"}'::jsonb, 51000, 58000, 0,  500, 'g', true)
on conflict (sku) do nothing;

-- Product 7: Pure Kashmiri Mongra Saffron
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values (
  'a2222222-0000-0000-0000-000000000007',
  '22222222-2222-2222-2222-222222222222',
  'kashmiri-mongra-pure-saffron',
  'Grade-A1 Pure Kashmiri Mongra Saffron (Kesar)',
  'Certified Grade-A1 deep crimson saffron stigmas sourced directly from Pampore farms.',
  'Authentic Kashmir Mongra saffron hand-harvested from Crocus sativus flowers in Pampore valleys. Deep red whole stigmas with intense floral aroma, natural golden infusion, and lab-tested high crocin content. [DEMO DATA TO BE REPLACED]',
  '{"origin": "Pampore, Kashmir", "ingredients": "100% Pure Mongra Saffron Stigmas", "shelf_life": "24 months in airtight container away from light"}'::jsonb,
  array['Pack size'],
  'Pure Heritage',
  true
) on conflict do nothing;

insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  ('a2222222-0000-0000-0000-000000000007', 'NAT-SAF-1G', '1 g', '{"Pack size":"1 g"}'::jsonb, 55000, 65000, 25, 1, 'g', true),
  ('a2222222-0000-0000-0000-000000000007', 'NAT-SAF-5G', '5 g', '{"Pack size":"5 g"}'::jsonb, 240000, 280000, 10, 5, 'g', true)
on conflict (sku) do nothing;

-- 4 Coconut Oil Products
insert into public.products (id, category_id, slug, name, short_description, description, attributes, option_names, badge, is_active)
values
  (
    'c3333333-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'pure-cold-pressed-coconut-oil',
    'Pure Cold-Pressed Coconut Oil',
    '100% unrefined cold-pressed oil made from sulfur-free sun-dried Kerala copra.',
    'Extracted through wooden expellers without chemical solvents or heat treatment. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Kozhikode & Malappuram, Kerala", "process": "Traditional Wooden Marachekku Cold Press", "ingredients": "100% Pure Coconut Oil (Cocos nucifera)", "shelf_life": "12 months from packing"}'::jsonb,
    array['Pack size'],
    'Pure Kerala',
    true
  ),
  (
    'c3333333-0000-0000-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'traditional-roasted-coconut-oil',
    'Traditional Roasted Coconut Oil (Uruli)',
    'Artisanal roasted coconut oil slowly simmered in bronze urulis for distinct aroma.',
    'Crafted in small batches according to age-old Kerala kitchen heritage. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Central Travancore, Kerala", "process": "Slow bronze uruli extraction", "ingredients": "100% Roasted Coconut Kernel Extract", "shelf_life": "12 months from packing"}'::jsonb,
    array['Pack size'],
    null,
    true
  ),
  (
    'c3333333-0000-0000-0000-000000000003',
    '33333333-3333-3333-3333-333333333333',
    'wood-pressed-marachekku-virgin-coconut-oil',
    'Wood-Pressed (Marachekku) Extra Virgin Coconut Oil',
    'Extracted in traditional stone-wood vats at ambient room temperature to preserve natural antioxidants.',
    'Crafted using traditional Kerala Vaagai wood expellers (Marachekku). The copra is cold-pressed slowly without heating or metal friction. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Malabar Coast, Kerala", "process": "Traditional Marachekku Wood Press", "ingredients": "100% Raw Virgin Coconut Oil", "shelf_life": "12 months from packing"}'::jsonb,
    array['Pack size'],
    'Artisanal',
    true
  ),
  (
    'c3333333-0000-0000-0000-000000000004',
    '33333333-3333-3333-3333-333333333333',
    'ayurvedic-bhringraj-brahmi-herbal-hair-oil',
    'Ayurvedic Bhringraj & Brahmi Herbal Coconut Hair Oil',
    'Infused with 12 wild Ayurvedic botanicals simmered in pure Kerala coconut milk oil for hair nourishment.',
    'Prepared through the classical Taila Paka Vidhi. Fresh cold-pressed coconut oil is slowly decocted with Bhringraj, Brahmi, Hibiscus, and Amla. [DEMO DATA TO BE REPLACED]',
    '{"origin": "Palakkad, Kerala", "process": "Traditional Ayurvedic Kashayam Decoction", "ingredients": "Pure Coconut Oil, Bhringraj, Brahmi, Hibiscus, Amla, Fenugreek, Vetiver", "shelf_life": "18 months from packing"}'::jsonb,
    array['Pack size'],
    'Ayurvedic',
    true
  )
on conflict do nothing;

-- Coconut Oil Variants
insert into public.product_variants (product_id, sku, label, option_values, price_paise, compare_at_price_paise, stock, net_quantity, net_unit, is_active)
values
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-250ML', '250 ml', '{"Pack size":"250 ml"}'::jsonb, 19000, 22000, 40, 250, 'ml', true),
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 35000, 40000, 28, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000001', 'OIL-CLD-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    67000, 75000, 15, 1000,'ml', true),
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-250ML', '250 ml', '{"Pack size":"250 ml"}'::jsonb, 24000, 27500, 22, 250, 'ml', true),
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 44000, 49000, 18, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000002', 'OIL-RST-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    84000, 92000, 8,  1000,'ml', true),
  ('c3333333-0000-0000-0000-000000000003', 'OIL-WOD-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 38000, 44000, 30, 500, 'ml', true),
  ('c3333333-0000-0000-0000-000000000003', 'OIL-WOD-1000ML','1 L',    '{"Pack size":"1 L"}'::jsonb,    72000, 82000, 16, 1000,'ml', true),
  ('c3333333-0000-0000-0000-000000000004', 'OIL-AYU-200ML', '200 ml', '{"Pack size":"200 ml"}'::jsonb, 45000, 52000, 35, 200, 'ml', true),
  ('c3333333-0000-0000-0000-000000000004', 'OIL-AYU-500ML', '500 ml', '{"Pack size":"500 ml"}'::jsonb, 82000, 95000, 18, 500, 'ml', true)
on conflict (sku) do nothing;

-- Product Images
insert into public.product_images (product_id, storage_path, alt, sort_order, is_primary)
select
  p.id,
  null,
  p.name,
  0,
  true
from public.products p
on conflict do nothing;

-- Coupons
insert into public.coupons (code, type, value, max_discount_paise, min_order_paise, valid_from, valid_to, is_active, used_count)
values
  (
    'WELCOME10',
    'PERCENT',
    10,
    200000,
    100000,
    now() - interval '30 days',
    now() + interval '365 days',
    true,
    0
  ),
  (
    'FLAT500',
    'FLAT',
    50000,
    null,
    250000,
    now() - interval '30 days',
    now() + interval '365 days',
    true,
    0
  ),
  (
    'EXPIRED20',
    'PERCENT',
    20,
    100000,
    50000,
    now() - interval '60 days',
    now() - interval '1 day',
    true,
    0
  )
on conflict (code) do nothing;

-- Initial Promotional Banner
insert into public.site_banners (text, highlight_text, link_url, badge_text, bg_color, text_color, is_active)
values (
  '✨ Grand Festive Launch: Free Delivery across India on all orders above ₹1,499!',
  'LIMITED PERIOD',
  '/coconut-oil',
  'BARAKAH EXCLUSIVE',
  '#0F3E2E',
  '#F9F6EE',
  true
);
