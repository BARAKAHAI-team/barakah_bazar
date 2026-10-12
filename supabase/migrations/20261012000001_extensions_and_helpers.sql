-- Migration 1: Extensions and Helper Functions
-- Barakah Bazaar

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Function: set_updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Sequence & Function: next_order_number (Format: BZ-YYMMDD-NNNN)
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
