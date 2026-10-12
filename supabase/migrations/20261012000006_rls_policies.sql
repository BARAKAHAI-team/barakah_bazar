-- Migration 6: Row Level Security Policies
-- Barakah Bazaar: Default Deny on all tables

-- 1. Enable RLS on all public tables
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

-- ============================================================================
-- Catalog Policies (Public Read for Active Items)
-- ============================================================================

-- Categories: public read where is_active
create policy "Allow anon and auth read active categories"
  on public.categories for select
  using (is_active = true);

-- Products: public read where is_active
create policy "Allow anon and auth read active products"
  on public.products for select
  using (is_active = true);

-- Variants: public read where is_active
create policy "Allow anon and auth read active variants"
  on public.product_variants for select
  using (is_active = true);

-- Product Images: public read
create policy "Allow anon and auth read product images"
  on public.product_images for select
  using (true);

-- ============================================================================
-- Profile Policies
-- ============================================================================

-- Profiles: own row select
create policy "Allow users to read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Profiles: own row update (name only via client; handled at app level)
create policy "Allow users to update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================================
-- Cart Items Policies (Own rows full CRUD)
-- ============================================================================

create policy "Allow users to read own cart items"
  on public.cart_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to insert own cart items"
  on public.cart_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow users to update own cart items"
  on public.cart_items for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow users to delete own cart items"
  on public.cart_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- Wishlist Items Policies (Own rows select, insert, delete)
-- ============================================================================

create policy "Allow users to read own wishlist"
  on public.wishlist_items for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to insert own wishlist"
  on public.wishlist_items for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow users to delete own wishlist"
  on public.wishlist_items for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- Addresses Policies (Own rows full CRUD)
-- ============================================================================

create policy "Allow users to read own addresses"
  on public.addresses for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to insert own addresses"
  on public.addresses for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow users to update own addresses"
  on public.addresses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow users to delete own addresses"
  on public.addresses for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================================
-- Orders & Order Items (Users select own; NO CLIENT INSERTS/UPDATES)
-- ============================================================================

create policy "Allow users to read own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to read own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "Allow users to read own order history"
  on public.order_status_history for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Reviews Policies
-- ============================================================================

-- Authenticated users can view their own review directly
create policy "Allow users to read own reviews"
  on public.reviews for select
  to authenticated
  using (auth.uid() = user_id);

-- Insert policy: user must have a DELIVERED order containing that product
create policy "Allow review insert only if product was delivered to user"
  on public.reviews for insert
  to authenticated
  with check (
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
  on public.reviews for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow users to delete own review"
  on public.reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- Note:
-- otp_requests, payments, coupons, notifications have NO client policies.
-- Default deny applies to anon and authenticated; accessible only via service_role.
