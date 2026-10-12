import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { memoryOrders } from '../../orders/route';
import { memoryPayments } from '../create/route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ ok: false, error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const rzpOrderId = paymentEntity.order_id;
      const rzpPaymentId = paymentEntity.id;

      // Find order across all orders in memory
      for (const [, orders] of memoryOrders.entries()) {
        for (const order of orders) {
          const pay = memoryPayments.get(order.id);
          if (pay && pay.razorpayOrderId === rzpOrderId) {
            if (order.payment_status !== 'PAID') {
              order.payment_status = 'PAID';
              order.order_status = 'CONFIRMED';
              pay.status = 'CAPTURED';
              order.status_history.push({
                status: 'CONFIRMED',
                note: `Captured via Razorpay Webhook (${rzpPaymentId})`,
                created_at: new Date().toISOString(),
              });

              // Reduce stock
              for (const item of order.items) {
                for (const prod of SEED_PRODUCTS) {
                  const v = prod.variants.find((variant) => variant.id === item.variantId);
                  if (v) v.stock = Math.max(0, v.stock - item.qty);
                }
              }
            }
            break;
          }
        }
      }
    } else if (event === 'payment.failed' && paymentEntity) {
      const rzpOrderId = paymentEntity.order_id;
      for (const [, orders] of memoryOrders.entries()) {
        for (const order of orders) {
          const pay = memoryPayments.get(order.id);
          if (pay && pay.razorpayOrderId === rzpOrderId) {
            pay.status = 'FAILED';
            break;
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
