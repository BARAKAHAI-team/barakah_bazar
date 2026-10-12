import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCart, MemoryCartItem } from '../route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

const addItemSchema = z.object({
  variantId: z.string(),
  qty: z.number().int().positive(),
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
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required to add to cart.' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Valid variantId and positive qty required.' } },
        { status: 400 }
      );
    }

    const { variantId, qty } = parsed.data;

    // Look up variant stock
    let targetVariant = null;
    for (const prod of SEED_PRODUCTS) {
      const v = prod.variants.find((variant) => variant.id === variantId);
      if (v) {
        targetVariant = v;
        break;
      }
    }

    if (!targetVariant || !targetVariant.is_active) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Item is currently unavailable.' } },
        { status: 404 }
      );
    }

    const currentItems = memoryCart.get(session.userId) || [];
    const existingIndex = currentItems.findIndex((it) => it.variantId === variantId);

    const existingQty = existingIndex >= 0 ? currentItems[existingIndex].qty : 0;
    const newQty = existingQty + qty;

    if (newQty > targetVariant.stock) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Only ${targetVariant.stock} units available in stock.`,
          },
        },
        { status: 400 }
      );
    }

    if (existingIndex >= 0) {
      currentItems[existingIndex].qty = newQty;
    } else {
      currentItems.push({
        id: `cart_${Math.random().toString(36).substring(2, 9)}`,
        userId: session.userId,
        variantId,
        qty,
        createdAt: new Date().toISOString(),
      });
    }

    memoryCart.set(session.userId, currentItems);

    return NextResponse.json({
      ok: true,
      message: 'Added to cart.',
      totalItems: currentItems.reduce((acc, it) => acc + it.qty, 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
