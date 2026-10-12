-- Migration 4: Reviews and Notifications Schema
-- Barakah Bazaar

-- 1. Reviews
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

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create index if not exists idx_reviews_product_id on public.reviews(product_id);

-- 2. Notifications Outbox (service role only)
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
