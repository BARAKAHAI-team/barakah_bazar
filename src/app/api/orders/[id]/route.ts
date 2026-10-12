import { NextRequest, NextResponse } from 'next/server';
import { memoryOrders } from '../route';

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
