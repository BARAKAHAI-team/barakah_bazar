-- Migration 5: Views and Functions
-- Barakah Bazaar

-- 1. View: public_reviews (safe columns only, readable by anon)
create or replace view public.public_reviews as
select
  r.id,
  r.product_id,
  r.rating,
  r.comment,
  r.created_at,
  coalesce(nullif(split_part(trim(p.name), ' ', 1), ''), 'Verified Customer') as reviewer_name
from public.reviews r
left join public.profiles p on p.id = r.user_id;

-- 2. View: product_rating_summary
create or replace view public.product_rating_summary as
select
  p.id as product_id,
  coalesce(round(avg(r.rating)::numeric, 1), 0.0) as avg_rating,
  count(r.id)::int as review_count
from public.products p
left join public.reviews r on r.product_id = p.id
group by p.id;

-- 3. Function: confirm_payment
-- Idempotent, security definer, runs in a single transaction. Callable by service_role only.
create or replace function public.confirm_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_method text default null,
  p_raw_payload jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_item record;
  v_wa_payload jsonb;
  v_email_payload jsonb;
begin
  -- 1. Lock payment row
  select * into v_payment
  from public.payments
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'PAYMENT_NOT_FOUND');
  end if;

  -- Idempotency check: if already captured, return immediately
  if v_payment.status = 'CAPTURED' then
    return jsonb_build_object(
      'ok', true,
      'status', 'ALREADY_CAPTURED',
      'order_id', v_payment.order_id
    );
  end if;

  -- Fetch associated order
  select * into v_order
  from public.orders
  where id = v_payment.order_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'ORDER_NOT_FOUND');
  end if;

  -- 2. Update payment record to CAPTURED
  update public.payments
  set
    status = 'CAPTURED',
    razorpay_payment_id = p_razorpay_payment_id,
    method = coalesce(p_method, method),
    raw_payload = coalesce(p_raw_payload, raw_payload),
    updated_at = now()
  where id = v_payment.id;

  -- 3. Set order status to PAID and CONFIRMED
  update public.orders
  set
    payment_status = 'PAID',
    order_status = 'CONFIRMED',
    updated_at = now()
  where id = v_order.id;

  -- Insert order status history
  insert into public.order_status_history (order_id, status, note)
  values (v_order.id, 'CONFIRMED', 'Payment verified and captured via Razorpay (' || p_razorpay_payment_id || ')');

  -- 4. Reduce stock for each order item
  -- Edge case: If two buyers pay for the last unit simultaneously, stock clamps at 0
  -- and both orders confirm. This is an accepted tradeoff per CONTEXT.md.
  update public.product_variants v
  set
    stock = greatest(v.stock - oi.qty, 0),
    updated_at = now()
  from public.order_items oi
  where oi.order_id = v_order.id and v.id = oi.variant_id;

  -- 5. Increment coupon used_count if a coupon was applied
  if v_order.coupon_code is not null then
    update public.coupons
    set used_count = used_count + 1
    where code = v_order.coupon_code;
  end if;

  -- 6. Remove purchased variants from user's cart
  delete from public.cart_items
  where user_id = v_order.user_id
    and variant_id in (
      select variant_id from public.order_items where order_id = v_order.id
    );

  -- 7. Insert notification outbox records
  v_wa_payload := jsonb_build_object(
    'order_number', v_order.order_number,
    'total_paise', v_order.total_paise,
    'notify_phone', v_order.notify_phone,
    'address', v_order.address_snapshot
  );

  insert into public.notifications (user_id, order_id, channel, recipient, template, payload)
  values (
    v_order.user_id,
    v_order.id,
    'WHATSAPP',
    v_order.notify_phone,
    'ORDER_CONFIRMATION',
    v_wa_payload
  );

  if v_order.notify_email is not null and length(trim(v_order.notify_email)) > 0 then
    v_email_payload := jsonb_build_object(
      'order_number', v_order.order_number,
      'total_paise', v_order.total_paise,
      'notify_email', v_order.notify_email,
      'address', v_order.address_snapshot
    );

    insert into public.notifications (user_id, order_id, channel, recipient, template, payload)
    values (
      v_order.user_id,
      v_order.id,
      'EMAIL',
      v_order.notify_email,
      'ORDER_CONFIRMATION',
      v_email_payload
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', 'CONFIRMED',
    'order_id', v_order.id,
    'order_number', v_order.order_number
  );
end;
$$;

-- Security: Callable ONLY by service_role
revoke all on function public.confirm_payment from public;
revoke all on function public.confirm_payment from anon;
revoke all on function public.confirm_payment from authenticated;
grant execute on function public.confirm_payment to service_role;
