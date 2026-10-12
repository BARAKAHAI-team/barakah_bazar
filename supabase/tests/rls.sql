-- RLS Verification Script
-- Run in Supabase SQL Editor to test and verify Row Level Security policies.

-- 1. Verify RLS is enabled on all tables
select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2. Verify Policies exist
select
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. Verify function execution permissions on confirm_payment
-- (Should only be granted to service_role, revoked from public, anon, authenticated)
select
  proname as function_name,
  prosecdef as security_definer,
  has_function_privilege('anon', 'public.confirm_payment(text, text, text, jsonb)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', 'public.confirm_payment(text, text, text, jsonb)', 'EXECUTE') as auth_can_execute;
