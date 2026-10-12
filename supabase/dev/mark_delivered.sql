-- Dev Helper: Mark an Order as DELIVERED
-- Usage in Supabase SQL Editor:
-- Replace 'BZ-XXXXXX-XXXX' (or order UUID) with the target order identifier.
-- This allows testing the review eligibility flow (buyers can only review delivered products).

do $$
declare
  target_order_number text := 'BZ-261012-0001'; -- <-- REPLACE WITH TARGET ORDER NUMBER
  target_order_id uuid;
begin
  select id into target_order_id
  from public.orders
  where order_number = target_order_number or id::text = target_order_number;

  if target_order_id is null then
    raise notice 'Order not found for identifier %', target_order_number;
    return;
  end if;

  -- 1. Update order status to DELIVERED
  update public.orders
  set
    order_status = 'DELIVERED',
    updated_at = now()
  where id = target_order_id;

  -- 2. Insert into order_status_history
  insert into public.order_status_history (order_id, status, note)
  values (target_order_id, 'DELIVERED', 'Marked as DELIVERED via dev helper script.');

  raise notice 'Order % (%) successfully marked as DELIVERED.', target_order_number, target_order_id;
end;
$$;
