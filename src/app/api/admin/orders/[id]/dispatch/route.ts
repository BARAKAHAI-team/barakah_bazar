import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inMemoryOrders } from '../../route';
import { createShadowfaxShipment } from '@/lib/shipping/shadowfax';
import { getShipmentByOrderId } from '@/lib/shipping/shipment-store';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Return existing shipment if already dispatched
    const existing = getShipmentByOrderId(id);
    if (existing) {
      return NextResponse.json({ ok: true, shipment: existing, alreadyDispatched: true });
    }

    let order: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          order = {
            ...data,
            items: data.order_items || [],
          };
        }
      } catch (err) {
        console.warn('Supabase order lookup in dispatch error:', err);
      }
    }

    if (!order) {
      order = inMemoryOrders.find((o) => o.id === id || o.order_number === id) || null;
    }

    if (!order) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
        { status: 404 }
      );
    }

    const shipment = await createShadowfaxShipment(order);

    // Record dispatch in Supabase order_status_history
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        await supabase.from('order_status_history').insert({
          order_id: order.id,
          status: 'DISPATCHED',
          note: `Dispatched via Shadowfax • AWB: ${shipment.awbNumber}`,
        });
      } catch (err) {
        console.warn('Supabase order_status_history dispatch insert warning:', err);
      }
    }

    return NextResponse.json({ ok: true, shipment });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'DISPATCH_FAILED', message: err.message || 'Failed to dispatch order' } },
      { status: 500 }
    );
  }
}
