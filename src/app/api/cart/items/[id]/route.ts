import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryCart } from '../../route';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

const updateSchema = z.object({
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Valid positive qty required.' } },
        { status: 400 }
      );
    }

    // Try Supabase first
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient() as any;

        const { data: item } = await supabase
          .from('cart_items')
          .select('id, variant_id, product_variants(stock)')
          .eq('id', id)
          .eq('user_id', session.userId)
          .maybeSingle();

        if (item) {
          const availableStock = item.product_variants?.stock ?? 0;
          const finalQty = Math.min(parsed.data.qty, availableStock);

          if (finalQty <= 0) {
            await supabase.from('cart_items').delete().eq('id', id);
          } else {
            await supabase.from('cart_items').update({ qty: finalQty }).eq('id', id);
          }

          return NextResponse.json({
            ok: true,
            qty: finalQty,
            capped: finalQty < parsed.data.qty,
          });
        }
      }
    } catch (err) {
      console.warn('Supabase cart item update error:', err);
    }

    // Memory fallback
    const userItems = memoryCart.get(session.userId) || [];
    const itemIndex = userItems.findIndex((it) => it.id === id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Cart item not found.' } },
        { status: 404 }
      );
    }

    const item = userItems[itemIndex];
    let targetVariant = null;
    for (const prod of SEED_PRODUCTS) {
      const v = prod.variants.find((variant) => variant.id === item.variantId);
      if (v) {
        targetVariant = v;
        break;
      }
    }

    const availableStock = targetVariant ? targetVariant.stock : 0;
    const finalQty = Math.min(parsed.data.qty, availableStock);

    if (finalQty <= 0) {
      userItems.splice(itemIndex, 1);
    } else {
      userItems[itemIndex].qty = finalQty;
    }

    memoryCart.set(session.userId, userItems);

    return NextResponse.json({
      ok: true,
      qty: finalQty,
      capped: finalQty < parsed.data.qty,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;

  // Supabase delete
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      await supabase.from('cart_items').delete().eq('id', id).eq('user_id', session.userId);
    }
  } catch (err) {
    console.warn('Supabase cart delete error:', err);
  }

  const userItems = memoryCart.get(session.userId) || [];
  const filtered = userItems.filter((it) => it.id !== id);
  memoryCart.set(session.userId, filtered);

  return NextResponse.json({ ok: true, message: 'Item removed from cart.' });
}
