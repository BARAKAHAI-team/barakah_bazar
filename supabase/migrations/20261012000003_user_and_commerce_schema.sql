-- Migration 3: User and Commerce Schema
-- Barakah Bazaar

-- 1. Profiles (matches auth.users.id)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text unique not null,
  email text null,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2. OTP Requests (service role only)
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

-- 3. Cart Items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  qty int not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, variant_id)
);

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

create index if not exists idx_cart_items_user_id on public.cart_items(user_id);

-- 4. Wishlist Items
create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- 5. Addresses
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

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create index if not exists idx_addresses_user_id on public.addresses(user_id);

-- 6. Coupons
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

-- 7. Orders
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

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);

-- 8. Order Items
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

-- 9. Order Status History
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

-- 10. Payments
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

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_razorpay_order on public.payments(razorpay_order_id);
