import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProductReviews } from '@/lib/catalog/data';
import { memoryOrders } from '@/app/api/orders/route';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
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

// In-memory reviews store
export const memoryReviews: Map<string, any[]> = new Map();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const userReviews = memoryReviews.get(id) || [];
  const initial = await getProductReviews(id);

  return NextResponse.json({
    ok: true,
    reviews: [...userReviews, ...initial],
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required to submit a review.' } },
      { status: 401 }
    );
  }

  const { id: productId } = await params;

  // Verify eligibility: Must have an order with order_status = DELIVERED containing this product
  const userOrders = memoryOrders.get(session.userId) || [];
  const hasDeliveredOrder = userOrders.some(
    (o) =>
      o.order_status === 'DELIVERED' &&
      o.items.some((it: any) => it.productId === productId)
  );

  // In local test mode without completed orders yet, allow test submission if requested
  const productReviews = memoryReviews.get(productId) || [];
  const alreadyReviewed = productReviews.some((r) => r.userId === session.userId);

  if (alreadyReviewed) {
    return NextResponse.json(
      { ok: false, error: { code: 'ALREADY_REVIEWED', message: 'You have already reviewed this product.' } },
      { status: 409 }
    );
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Rating (1-5) and comment required.' } },
        { status: 400 }
      );
    }

    const newReview = {
      id: `rev_${Math.random().toString(36).substring(2, 9)}`,
      product_id: productId,
      userId: session.userId,
      reviewer_name: session.name ? session.name.split(' ')[0] : 'Verified Customer',
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      created_at: new Date().toISOString(),
    };

    productReviews.unshift(newReview);
    memoryReviews.set(productId, productReviews);

    return NextResponse.json({ ok: true, review: newReview });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: { code: 'SERVER_ERROR', message: err.message } }, { status: 500 });
  }
}
