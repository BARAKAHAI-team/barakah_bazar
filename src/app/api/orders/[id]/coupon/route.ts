import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryOrders } from '../../route';
import { calculateCouponDiscount, CouponRecord } from '@/lib/pricing/coupon';

// Seed coupons from seed.sql
const AVAILABLE_COUPONS: Record<string, CouponRecord> = {
  PROMO10: {
    code: 'PROMO10',
    type: 'PERCENT',
    value: 10,
    max_discount_paise: 200000, // ₹2000
    min_order_paise: 100000,    // ₹1000
    valid_from: new Date(Date.now() - 86400000 * 30).toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 365).toISOString(),
    is_active: true,
  },
  FLAT500: {
    code: 'FLAT500',
    type: 'FLAT',
    value: 50000,               // ₹500
    max_discount_paise: null,
    min_order_paise: 250000,    // ₹2500
    valid_from: new Date(Date.now() - 86400000 * 30).toISOString(),
    valid_to: new Date(Date.now() + 86400000 * 365).toISOString(),
    is_active: true,
  },
  EXPIRED20: {
    code: 'EXPIRED20',
    type: 'PERCENT',
    value: 20,
    max_discount_paise: 100000,
    min_order_paise: 50000,
    valid_from: new Date(Date.now() - 86400000 * 60).toISOString(),
    valid_to: new Date(Date.now() - 86400000 * 1).toISOString(),
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
  const orders = memoryOrders.get(session.userId) || [];
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
      { status: 404 }
    );
  }

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
    const coupon = AVAILABLE_COUPONS[code] || null;

    const result = calculateCouponDiscount(coupon, order.subtotal_paise);
    if (!result.valid) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_COUPON', message: result.error || 'Invalid coupon code.' } },
        { status: 400 }
      );
    }

    order.coupon_code = result.code;
    order.discount_paise = result.discountPaise;
    order.total_paise = result.newTotalPaise;

    return NextResponse.json({
      ok: true,
      couponCode: order.coupon_code,
      discountPaise: order.discount_paise,
      totalPaise: order.total_paise,
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
  const orders = memoryOrders.get(session.userId) || [];
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
      { status: 404 }
    );
  }

  order.coupon_code = null;
  order.discount_paise = 0;
  order.total_paise = order.subtotal_paise;

  return NextResponse.json({
    ok: true,
    totalPaise: order.total_paise,
    message: 'Coupon removed.',
  });
}
