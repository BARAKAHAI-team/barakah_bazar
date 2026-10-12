import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryOrders } from '../../orders/route';

const schema = z.object({
  orderId: z.string(),
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

// Memory payments tracking
export const memoryPayments: Map<string, { id: string; orderId: string; razorpayOrderId: string; status: string; amountPaise: number }> = new Map();

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
        { ok: false, error: { code: 'INVALID_INPUT', message: 'orderId is required.' } },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;
    const orders = memoryOrders.get(session.userId) || [];
    const order = orders.find((o) => o.id === orderId);

    if (!order) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } },
        { status: 404 }
      );
    }

    if (order.order_status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_STATUS', message: 'Order is not in pending payment state.' } },
        { status: 400 }
      );
    }

    const amount = order.total_paise;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    // Check if uncaptured payment already exists for this order
    let existingPayment = memoryPayments.get(orderId);
    let rzpOrderId = existingPayment ? existingPayment.razorpayOrderId : '';

    if (!existingPayment || existingPayment.status !== 'CREATED') {
      rzpOrderId = `order_mock_${Date.now()}`;
      memoryPayments.set(orderId, {
        id: `pay_${Date.now()}`,
        orderId,
        razorpayOrderId: rzpOrderId,
        status: 'CREATED',
        amountPaise: amount,
      });
    }

    return NextResponse.json({
      ok: true,
      razorpayOrderId: rzpOrderId,
      keyId,
      amount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
