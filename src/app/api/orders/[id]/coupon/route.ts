import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryOrders } from '../../route';
import { inMemoryCoupons } from '@/app/api/admin/coupons/route';
import { calculateCouponDiscount, CouponRecord } from '@/lib/pricing/coupon';
import { createAdminClient } from '@/lib/supabase/admin';

const FALLBACK_COUPONS: Record<string, CouponRecord> = {
  PROMO10: {
    code: 'PROMO10',
    type: 'PERCENT',
    value: 10,
    max_discount_paise: 200000,
    min_order_paise: 100000,
    valid_from: new Date(Date.now() - 86400000 * 30).toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 365).toISOString(),
    is_active: true,
  },
  FLAT500: {
    code: 'FLAT500',
    type: 'FLAT',
    value: 50000,
    max_discount_paise: null,
    min_order_paise: 250000,
    valid_from: new Date(Date.now() - 86400000 * 30).toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 365).toISOString(),
    is_active: true,
  },
};

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('bz_session');
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

async function findOrderForUser(orderId: string, userId: string) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return { source: 'supabase' as const, order: data };
      }
    } catch (err) {
      console.warn('Supabase order lookup in coupon route:', err);
    }
  }

  const orders = memoryOrders.get(userId) || [];
  const memOrder = orders.find((o) => o.id === orderId);
  if (memOrder) {
    return { source: 'memory' as const, order: memOrder };
  }

  return null;
}

async function findCouponByCode(code: string): Promise<CouponRecord | null> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (!error && data) {
        return {
          code: data.code,
          type: data.type,
          value: data.value,
          max_discount_paise: data.max_discount_paise,
          min_order_paise: data.min_order_paise ?? 0,
          valid_from: data.valid_from,
          valid_to: data.valid_to,
          is_active: data.is_active,
        };
      }
    } catch (err) {
      console.warn('Supabase coupon lookup error:', err);
    }
  }

  const memCoupon = inMemoryCoupons.find((c) => c.code.toUpperCase() === code);
  if (memCoupon) {
    return {
      code: memCoupon.code,
      type: memCoupon.type,
      value: memCoupon.type === 'FLAT' && memCoupon.value < 5000 ? memCoupon.value * 100 : memCoupon.value,
      max_discount_paise: memCoupon.max_discount_paise ?? null,
      min_order_paise: memCoupon.min_order_paise ?? 0,
      valid_from: memCoupon.valid_from,
      valid_to: memCoupon.valid_to,
      is_active: memCoupon.is_active,
    };
  }

  return FALLBACK_COUPONS[code] || null;
}

async function persistOrderCoupon(
  orderId: string,
  userId: string,
  couponCode: string | null,
  discountPaise: number,
  totalPaise: number
) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient() as any;
      await supabase
        .from('orders')
        .update({
          coupon_code: couponCode,
          discount_paise: discountPaise,
          total_paise: totalPaise,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase order coupon update error:', err);
    }
  }

  const orders = memoryOrders.get(userId) || [];
  const memOrder = orders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.coupon_code = couponCode;
    memOrder.discount_paise = discountPaise;
    memOrder.total_paise = totalPaise;
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const found = await findOrderForUser(id, session.userId);
  if (!found) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
      { status: 404 }
    );
  }

  const { order } = found;
  if (order.order_status !== 'PENDING_PAYMENT') {
    return NextResponse.json(
      { ok: false, error: { code: 'ORDER_LOCKED', message: 'Coupons cannot be modified on this order.' } },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const parsed = z.object({ code: z.string().min(1) }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Coupon code required.' } },
        { status: 400 }
      );
    }

    const code = parsed.data.code.trim().toUpperCase();
    const coupon = await findCouponByCode(code);

    const result = calculateCouponDiscount(coupon, order.subtotal_paise);
    if (!result.valid) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_COUPON', message: result.error || 'Invalid coupon code.' } },
        { status: 400 }
      );
    }

    await persistOrderCoupon(id, session.userId, result.code, result.discountPaise, result.newTotalPaise);

    return NextResponse.json({
      ok: true,
      couponCode: result.code,
      discountPaise: result.discountPaise,
      totalPaise: result.newTotalPaise,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const found = await findOrderForUser(id, session.userId);
  if (!found) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
      { status: 404 }
    );
  }

  const { order } = found;
  if (order.order_status !== 'PENDING_PAYMENT') {
    return NextResponse.json(
      { ok: false, error: { code: 'ORDER_LOCKED', message: 'Coupons cannot be modified on this order.' } },
      { status: 400 }
    );
  }

  await persistOrderCoupon(id, session.userId, null, 0, order.subtotal_paise);

  return NextResponse.json({
    ok: true,
    totalPaise: order.subtotal_paise,
    message: 'Coupon removed.',
  });
}
