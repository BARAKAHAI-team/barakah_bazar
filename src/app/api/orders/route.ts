import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCart } from '../cart/route';
import { memoryAddresses } from '../addresses/route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

export interface MemoryOrder {
  id: string;
  order_number: string;
  user_id: string;
  address_snapshot: any;
  notify_phone: string;
  notify_email?: string | null;
  subtotal_paise: number;
  coupon_code?: string | null;
  discount_paise: number;
  total_paise: number;
  payment_status: 'PENDING' | 'PAID';
  order_status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DELIVERED';
  items: any[];
  status_history: { status: string; note: string; created_at: string }[];
  created_at: string;
  updated_at: string;
}

export const memoryOrders: Map<string, MemoryOrder[]> = new Map();
let orderSeq = 1;

const createOrderSchema = z.object({
  addressId: z.string(),
  email: z.string().email().optional().or(z.literal('')),
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

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const orders = memoryOrders.get(session.userId) || [];
  return NextResponse.json({ ok: true, orders });
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
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Address is required.' } },
        { status: 400 }
      );
    }

    // 1. Load user cart items
    const cartItems = memoryCart.get(session.userId) || [];
    if (cartItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'EMPTY_CART', message: 'Your cart is empty.' } },
        { status: 400 }
      );
    }

    // 2. Recheck every line
    const failedLines: { variantId: string; requested: number; available: number }[] = [];
    const hydratedLines: any[] = [];
    let subtotalPaise = 0;

    for (const item of cartItems) {
      let variant = null;
      let product = null;

      for (const p of SEED_PRODUCTS) {
        const v = p.variants.find((varItem) => varItem.id === item.variantId);
        if (v) {
          product = p;
          variant = v;
          break;
        }
      }

      if (!variant || !product || !variant.is_active || variant.stock < item.qty) {
        failedLines.push({
          variantId: item.variantId,
          requested: item.qty,
          available: variant ? variant.stock : 0,
        });
      } else {
        subtotalPaise += variant.price_paise * item.qty;
        hydratedLines.push({
          id: `item_${Math.random().toString(36).substring(2, 9)}`,
          productId: product.id,
          variantId: variant.id,
          name_snapshot: product.name,
          variant_label_snapshot: variant.label,
          sku_snapshot: variant.sku,
          image_path_snapshot: null,
          qty: item.qty,
          unit_price_paise: variant.price_paise,
        });
      }
    }

    // Stock check failed -> 409
    if (failedLines.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'STOCK_SHORTAGE',
            message: 'Some items in your cart are no longer available in the requested quantities.',
            failedLines,
          },
        },
        { status: 409 }
      );
    }

    // Find address
    const addresses = memoryAddresses.get(session.userId) || [];
    const chosenAddress = addresses.find((a) => a.id === parsed.data.addressId);
    if (!chosenAddress) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_ADDRESS', message: 'Delivery address not found.' } },
        { status: 400 }
      );
    }

    // 3. Create Order
    const orderNumber = `BZ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(orderSeq++).padStart(4, '0')}`;
    const orderId = `ord_${Math.random().toString(36).substring(2, 10)}`;

    const newOrder: MemoryOrder = {
      id: orderId,
      order_number: orderNumber,
      user_id: session.userId,
      address_snapshot: {
        name: chosenAddress.name,
        phone: chosenAddress.phone,
        line1: chosenAddress.line1,
        line2: chosenAddress.line2 || null,
        landmark: chosenAddress.landmark || null,
        city: chosenAddress.city,
        state: chosenAddress.state,
        pincode: chosenAddress.pincode,
        latitude: chosenAddress.latitude,
        longitude: chosenAddress.longitude,
      },
      notify_phone: session.phone,
      notify_email: parsed.data.email || session.email || null,
      subtotal_paise: subtotalPaise,
      discount_paise: 0,
      total_paise: subtotalPaise,
      payment_status: 'PENDING',
      order_status: 'PENDING_PAYMENT',
      items: hydratedLines,
      status_history: [
        {
          status: 'PENDING_PAYMENT',
          note: 'Order created, awaiting payment authorization.',
          created_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const userOrders = memoryOrders.get(session.userId) || [];
    userOrders.unshift(newOrder);
    memoryOrders.set(session.userId, userOrders);

    return NextResponse.json({
      ok: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
