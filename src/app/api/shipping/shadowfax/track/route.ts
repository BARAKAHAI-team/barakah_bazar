import { NextRequest, NextResponse } from 'next/server';
import { getShipmentByAwb, getShipmentByOrderId } from '@/lib/shipping/shipment-store';
import { trackShadowfaxShipment } from '@/lib/shipping/shadowfax';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const awb = req.nextUrl.searchParams.get('awb');

  if (!orderId && !awb) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_INPUT', message: 'orderId or awb is required.' } },
      { status: 400 }
    );
  }

  const existing = (orderId ? getShipmentByOrderId(orderId) : null) || (awb ? getShipmentByAwb(awb) : null);
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Shipment not found for this order.' } },
      { status: 404 }
    );
  }

  const updated = await trackShadowfaxShipment(existing);
  return NextResponse.json({ ok: true, shipment: updated });
}
