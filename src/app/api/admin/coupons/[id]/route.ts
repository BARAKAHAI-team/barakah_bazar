import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inMemoryCoupons } from '../route';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { is_active } = body;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('coupons')
          .update({ is_active: !!is_active })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ ok: true, coupon: data });
        }
      } catch (err) {
        console.warn('Supabase coupon update fallback:', err);
      }
    }

    const c = inMemoryCoupons.find((cpn) => cpn.id === id);
    if (!c) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } },
        { status: 404 }
      );
    }

    c.is_active = !!is_active;
    return NextResponse.json({ ok: true, coupon: c });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update coupon' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient();
        await supabase.from('coupons').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase coupon delete fallback:', err);
      }
    }

    const idx = inMemoryCoupons.findIndex((c) => c.id === id);
    if (idx !== -1) {
      inMemoryCoupons.splice(idx, 1);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete coupon' } },
      { status: 500 }
    );
  }
}
