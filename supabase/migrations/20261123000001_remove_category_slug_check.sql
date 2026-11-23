-- =============================================================================
-- Migration: Enable Dynamic Categories & Collections in Admin Panel
-- =============================================================================

-- 1. Remove hardcoded check constraint on categories slug to allow dynamic collections
alter table public.categories drop constraint if exists categories_slug_check;

-- 2. Add optional styling & customization columns for custom collection headers
alter table public.categories add column if not exists accent text default '#B8892D';
alter table public.categories add column if not exists eyebrow text;
alter table public.categories add column if not exists image_url text;

-- 3. Verify public read policy for active categories
drop policy if exists "Allow anon and auth read active categories" on public.categories;
create policy "Allow anon and auth read active categories"
  on public.categories for select using (is_active = true);

-- 4. Enable service role / admin full write access on categories
drop policy if exists "Allow service role full access on categories" on public.categories;
create policy "Allow service role full access on categories"
  on public.categories for all using (true) with check (true);
