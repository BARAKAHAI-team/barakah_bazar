import { NextRequest, NextResponse } from 'next/server';
import { memoryOrders } from '@/app/api/orders/route';
import { memoryReviews } from '../reviews/route';

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
    return NextResponse.json({ canReview: false, reason: 'not_logged_in' });
  }

  const { id: productId } = await params;

  // Check if already reviewed
  const productReviews = memoryReviews.get(productId) || [];
  const alreadyReviewed = productReviews.some((r) => r.userId === session.userId);
  if (alreadyReviewed) {
    return NextResponse.json({ canReview: false, reason: 'already_reviewed' });
  }

  // Check for delivered order
  const userOrders = memoryOrders.get(session.userId) || [];
  const hasDelivered = userOrders.some(
    (o) =>
      o.order_status === 'DELIVERED' &&
      o.items.some((it: any) => it.productId === productId)
  );

  if (!hasDelivered) {
    return NextResponse.json({ canReview: false, reason: 'no_delivered_order' });
  }

  return NextResponse.json({ canReview: true });
}
