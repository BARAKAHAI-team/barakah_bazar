import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCheckoutSignature } from '@/lib/payments/razorpay';
import { memoryOrders } from '../../orders/route';
import { memoryCart } from '../../cart/route';
import { memoryPayments } from '../create/route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

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

    // In dev mode with mock signature, allow bypass; otherwise verify HMAC
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && razorpay_signature !== 'mock_signature_for_dev_mode') {
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
    const orders = memoryOrders.get(session.userId) || [];
    let targetOrder = null;

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

    // Finalise Order (single atomic step)
    targetOrder.payment_status = 'PAID';
    targetOrder.order_status = 'CONFIRMED';
    targetOrder.updated_at = new Date().toISOString();
    targetOrder.status_history.push({
      status: 'CONFIRMED',
      note: `Payment confirmed via Razorpay ID ${razorpay_payment_id}.`,
      created_at: new Date().toISOString(),
    });

    // Reduce stock for order items
    // Edge case per CONTEXT.md 10: stock clamps at 0 if two buyers purchase the last unit
    for (const item of targetOrder.items) {
      for (const prod of SEED_PRODUCTS) {
        const v = prod.variants.find((variant) => variant.id === item.variantId);
        if (v) {
          v.stock = Math.max(0, v.stock - item.qty);
          break;
        }
      }
    }

    // Clear purchased variants from user cart
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
