import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export let inMemoryCoupons: any[] = [
  {
    id: 'cpn-1',
    code: 'WELCOME10',
    type: 'PERCENT',
    value: 10,
    max_discount_paise: 200000,
    min_order_paise: 100000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 3600000 * 24 * 90).toISOString(),
    is_active: true,
    used_count: 14,
  },
  {
    id: 'cpn-2',
    code: 'BARAKAH500',
    type: 'FLAT',
    value: 500,
    max_discount_paise: 50000,
    min_order_paise: 300000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 3600000 * 24 * 60).toISOString(),
    is_active: true,
    used_count: 8,
  },
  {
    id: 'cpn-3',
    code: 'EIDSPECIAL',
    type: 'PERCENT',
    value: 15,
    max_discount_paise: 500000,
    min_order_paise: 500000,
    valid_from: new Date().toISOString(),
    valid_to: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
    is_active: true,
    used_count: 26,
  },
];

export async function GET() {
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return NextResponse.json({ ok: true, coupons: data, count: data.length });
        }
      } catch (err) {
        console.warn('Supabase coupons fetch fallback:', err);
      }
    }

    return NextResponse.json({ ok: true, coupons: inMemoryCoupons, count: inMemoryCoupons.length });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to list coupons' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type, value, max_discount_paise, min_order_paise, valid_from, valid_to, is_active } = body;

    if (!code || !type || !value) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Code, type, and value are required.' } },
        { status: 400 }
      );
    }

    const newCoupon = {
      id: crypto.randomUUID(),
      code: code.trim().toUpperCase(),
      type: type === 'FLAT' ? 'FLAT' : 'PERCENT',
      value: Number(value),
      max_discount_paise: max_discount_paise ? Number(max_discount_paise) : null,
      min_order_paise: min_order_paise ? Number(min_order_paise) : 0,
      valid_from: valid_from || new Date().toISOString(),
      valid_to: valid_to || new Date(Date.now() + 3600000 * 24 * 90).toISOString(),
      is_active: is_active !== undefined ? !!is_active : true,
      used_count: 0,
      created_at: new Date().toISOString(),
    };

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        const { data, error } = await supabase
          .from('coupons')
          .insert(newCoupon)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ ok: true, coupon: data }, { status: 201 });
        }
      } catch (err) {
        console.warn('Supabase coupon insert fallback:', err);
      }
    }

    inMemoryCoupons.unshift(newCoupon);
    return NextResponse.json({ ok: true, coupon: newCoupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'CREATE_FAILED', message: err.message || 'Failed to create coupon' } },
      { status: 500 }
    );
  }
}
