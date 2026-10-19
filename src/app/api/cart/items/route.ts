import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCart } from '../route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

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

    // Check Supabase for variant stock and insert
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient() as any;

        const { data: variant, error: varErr } = await supabase
          .from('product_variants')
          .select('id, stock, is_active')
          .eq('id', variantId)
          .single();

        if (!varErr && variant) {
          if (!variant.is_active) {
            return NextResponse.json(
              { ok: false, error: { code: 'NOT_FOUND', message: 'Item is currently unavailable.' } },
              { status: 404 }
            );
          }

          // Check existing cart item in Supabase
          const { data: existing } = await supabase
            .from('cart_items')
            .select('id, qty')
            .eq('user_id', session.userId)
            .eq('variant_id', variantId)
            .maybeSingle();

          const existingQty = existing?.qty || 0;
          const newQty = existingQty + qty;

          if (newQty > variant.stock) {
            return NextResponse.json(
              {
                ok: false,
                error: {
                  code: 'INSUFFICIENT_STOCK',
                  message: `Only ${variant.stock} units available in stock.`,
                },
              },
              { status: 400 }
            );
          }

          if (existing) {
            await supabase
              .from('cart_items')
              .update({ qty: newQty })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('cart_items')
              .insert({ user_id: session.userId, variant_id: variantId, qty: newQty });
          }

          const { data: allItems } = await supabase
            .from('cart_items')
            .select('qty')
            .eq('user_id', session.userId);

          const total = (allItems || []).reduce((acc: number, it: any) => acc + it.qty, 0);

          return NextResponse.json({
            ok: true,
            message: 'Added to cart.',
            totalItems: total,
          });
        }
      }
    } catch (err) {
      console.warn('Supabase cart add error, using memory fallback:', err);
    }

    // Memory fallback
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
