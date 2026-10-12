-- Migration 2: Catalog Schema
-- Barakah Bazaar

-- 1. Categories
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

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 2. Products
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, ''))
  ) stored,
  unique(category_id, slug)
);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists idx_products_category_active on public.products(category_id, is_active);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);

-- 3. Product Variants
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

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);

-- 4. Product Images
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
