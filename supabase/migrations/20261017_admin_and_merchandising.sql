-- =============================================================================
-- BARAKAH BAZAAR: ADMIN PANEL, SEO & CLOUDINARY MERCHANDISING MIGRATION
-- =============================================================================

-- 1. Ensure 'role' column on profiles
alter table public.profiles 
  add column if not exists role text not null default 'customer' 
  check (role in ('customer', 'admin', 'manager'));

-- 2. Enhance products table with SEO and Merchandising controls
alter table public.products
  add column if not exists is_featured boolean not null default false,
  add column if not exists seo_title text null,
  add column if not exists seo_description text null,
  add column if not exists seo_keywords text[] not null default '{}',
  add column if not exists thumbnail_url text null;

-- Partial index for fast homepage featured product querying
create index if not exists idx_products_is_featured on public.products(is_featured) where is_active = true;

-- 3. Enhance product_images for Cloudinary metadata
alter table public.product_images
  add column if not exists cloudinary_public_id text null,
  add column if not exists width int null,
  add column if not exists height int null;

-- 4. Create site_banners table for promotional/sale announcements
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

create index if not exists idx_site_banners_active on public.site_banners(is_active, starts_at, ends_at);

-- Trigger for site_banners updated_at
drop trigger if exists trg_site_banners_updated_at on public.site_banners;
create trigger trg_site_banners_updated_at
  before update on public.site_banners
  for each row execute function public.set_updated_at();

-- RLS: Public can view active banners, Admins can manage all
alter table public.site_banners enable row level security;

create policy "Public can view active site banners"
  on public.site_banners for select
  using (is_active = true);

create policy "Admins can manage site banners"
  on public.site_banners for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
