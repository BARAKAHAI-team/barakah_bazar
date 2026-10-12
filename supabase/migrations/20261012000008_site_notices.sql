-- Migration 8: Site Notices
-- Barakah Bazaar

create table if not exists public.site_notices (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.site_notices enable row level security;

create policy "site_notices_select_active"
  on public.site_notices for select
  to anon, authenticated
  using (is_active = true);
