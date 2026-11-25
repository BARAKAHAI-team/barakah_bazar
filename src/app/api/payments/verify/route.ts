import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCheckoutSignature } from '@/lib/payments/razorpay';
import { memoryOrders } from '../../orders/route';
import { memoryCart } from '../../cart/route';
import { memoryPayments } from '../create/route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('bz_session');
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Payment details required.' } },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // Verify HMAC signature (only allow mock bypass in non-production for order_mock_ IDs)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMockOrder =
      process.env.NODE_ENV !== 'production' &&
      razorpay_order_id.startsWith('order_mock_') &&
      razorpay_signature === 'mock_signature_for_dev_mode';

    if (!isMockOrder) {
      if (!secret) {
        return NextResponse.json(
          { ok: false, error: { code: 'CONFIG_ERROR', message: 'Razorpay secret not configured.' } },
          { status: 500 }
        );
      }
      const isValid = verifyCheckoutSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        secret
      );
      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment signature mismatch.' } },
          { status: 400 }
        );
      }
    }

    // Find payment & order
    let targetOrder: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;

        // 1. Match exact razorpay_order_id in payments table first
        const { data: paymentRow } = await supabase
          .from('payments')
          .select('order_id')
          .eq('razorpay_order_id', razorpay_order_id)
          .maybeSingle();

        if (paymentRow?.order_id) {
          const { data: matchedOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', paymentRow.order_id)
            .eq('user_id', session.userId)
            .maybeSingle();
          if (matchedOrder) targetOrder = matchedOrder;
        }

        // 2. Fallback to latest pending order for user
        if (!targetOrder) {
          const { data: dbOrders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', session.userId)
            .eq('order_status', 'PENDING_PAYMENT')
            .order('created_at', { ascending: false })
            .limit(1);

          if (dbOrders && dbOrders.length > 0) {
            targetOrder = dbOrders[0];
          }
        }
      } catch (err) {
        console.warn('Supabase order lookup in verify error:', err);
      }
    }

    if (!targetOrder) {
      const orders = memoryOrders.get(session.userId) || [];
      for (const ord of orders) {
        const payment = memoryPayments.get(ord.id);
        if (payment && payment.razorpayOrderId === razorpay_order_id) {
          targetOrder = ord;
          break;
        }
      }

      if (!targetOrder && orders.length > 0) {
        // Fallback: match most recent pending order
        targetOrder = orders.find((o) => o.order_status === 'PENDING_PAYMENT');
      }
    }

    if (!targetOrder) {
      return NextResponse.json(
        { ok: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order could not be located.' } },
        { status: 404 }
      );
    }

    // Idempotency: if already confirmed/paid, return ok
    if (targetOrder.payment_status === 'PAID') {
      return NextResponse.json({
        ok: true,
        status: 'ALREADY_CAPTURED',
        orderNumber: targetOrder.order_number,
      });
    }

    // Update in Supabase
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        await supabase
          .from('orders')
          .update({
            payment_status: 'PAID',
            order_status: 'CONFIRMED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetOrder.id);

        await supabase
          .from('payments')
          .update({
            razorpay_payment_id,
            status: 'CAPTURED',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpay_order_id);

        await supabase.from('order_status_history').insert({
          order_id: targetOrder.id,
          status: 'CONFIRMED',
          note: `Payment confirmed via Razorpay (${razorpay_payment_id}).`,
        });

        if (targetOrder.coupon_code) {
          const { data: cpn } = await supabase
            .from('coupons')
            .select('id, used_count')
            .eq('code', targetOrder.coupon_code)
            .maybeSingle();
          if (cpn) {
            await supabase
              .from('coupons')
              .update({ used_count: (cpn.used_count || 0) + 1 })
              .eq('id', cpn.id);
          }
        }

        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', session.userId);
      } catch (err) {
        console.warn('Supabase update order status error:', err);
      }
    }

    // Finalise Order in memory
    targetOrder.payment_status = 'PAID';
    targetOrder.order_status = 'CONFIRMED';
    targetOrder.updated_at = new Date().toISOString();
    if (!targetOrder.status_history) targetOrder.status_history = [];
    targetOrder.status_history.push({
      status: 'CONFIRMED',
      note: `Payment confirmed via Razorpay ID ${razorpay_payment_id}.`,
      created_at: new Date().toISOString(),
    });

    // Reduce stock for order items
    if (targetOrder.items) {
      for (const item of targetOrder.items) {
        for (const prod of SEED_PRODUCTS) {
          const v = prod.variants.find((variant) => variant.id === item.variantId);
          if (v) {
            v.stock = Math.max(0, v.stock - item.qty);
            break;
          }
        }
      }
    }

    // Clear purchased variants from user cart in memory
    memoryCart.delete(session.userId);

    // Update payment record status
    const payRec = memoryPayments.get(targetOrder.id);
    if (payRec) {
      payRec.status = 'CAPTURED';
    }

    return NextResponse.json({
      ok: true,
      status: 'CONFIRMED',
      orderNumber: targetOrder.order_number,
      orderId: targetOrder.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
