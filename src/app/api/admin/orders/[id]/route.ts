import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inMemoryOrders } from '../route';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { order_status, payment_status } = body;

    // Update in Supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        const updatePayload: Record<string, any> = {};
        if (order_status) updatePayload.order_status = order_status;
        if (payment_status) updatePayload.payment_status = payment_status;

        const { data, error } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ ok: true, order: data });
        }
      } catch (err) {
        console.warn('Supabase order update fallback:', err);
      }
    }

    // Fallback in memory
    const order = inMemoryOrders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update order' } },
      { status: 500 }
    );
  }
}
