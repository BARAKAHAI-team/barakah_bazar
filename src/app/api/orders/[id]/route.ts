import { NextRequest, NextResponse } from 'next/server';
import { memoryOrders } from '../route';
import { createAdminClient } from '@/lib/supabase/admin';

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

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;

  // 1. Check Supabase first
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = createAdminClient() as any;
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `);

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('order_number', id);
      }

      if (session.role !== 'ADMIN') {
        query = query.eq('user_id', session.userId);
      }

      const { data: dbOrder, error } = await query.maybeSingle();

      if (!error && dbOrder) {
        const formatted = {
          id: dbOrder.id,
          order_number: dbOrder.order_number,
          user_id: dbOrder.user_id,
          address_snapshot: dbOrder.address_snapshot,
          notify_phone: dbOrder.notify_phone,
          notify_email: dbOrder.notify_email,
          subtotal_paise: dbOrder.subtotal_paise,
          coupon_code: dbOrder.coupon_code,
          discount_paise: dbOrder.discount_paise,
          total_paise: dbOrder.total_paise,
          payment_status: dbOrder.payment_status,
          order_status: dbOrder.order_status,
          items: (dbOrder.order_items || []).map((it: any) => ({
            id: it.id,
            variantId: it.variant_id,
            name_snapshot: it.name_snapshot,
            variant_label_snapshot: it.variant_label_snapshot,
            sku_snapshot: it.sku_snapshot,
            image_path_snapshot: it.image_path_snapshot,
            qty: it.qty,
            unit_price_paise: it.unit_price_paise,
          })),
          status_history: [
            {
              status: dbOrder.order_status,
              note: `Order is ${dbOrder.order_status}`,
              created_at: dbOrder.created_at,
            },
          ],
          created_at: dbOrder.created_at,
          updated_at: dbOrder.updated_at,
        };

        return NextResponse.json({ ok: true, order: formatted });
      }
    } catch (err) {
      console.warn('Supabase order details lookup error:', err);
    }
  }

  // 2. Memory fallback
  const orders = memoryOrders.get(session.userId) || [];
  const order = orders.find((o) => o.id === id || o.order_number === id);

  if (!order) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, order });
}

