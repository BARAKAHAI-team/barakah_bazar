import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

export interface MemoryCartItem {
  id: string;
  userId: string;
  variantId: string;
  qty: number;
  createdAt: string;
}

export const memoryCart: Map<string, MemoryCartItem[]> = new Map();

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
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required to access cart.' } },
      { status: 401 }
    );
  }

  // 1. Check Supabase first
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id, qty, variant_id, created_at,
          product_variants (
            id, product_id, sku, label, price_paise, compare_at_price_paise, stock, is_active,
            products (
              id, slug, name,
              categories!inner(slug),
              product_images(*)
            )
          )
        `)
        .eq('user_id', session.userId);

      if (!error && data) {
        let subtotalPaise = 0;
        let hasIssues = false;

        const hydrated = data.map((item: any) => {
          const v = item.product_variants;
          const p = v?.products;

          if (!v || !p) {
            hasIssues = true;
            return {
              id: item.id,
              variantId: item.variant_id,
              qty: item.qty,
              unavailable: true,
              reason: 'Item no longer exists',
            };
          }

          const isUnavailable = !v.is_active || v.stock === 0;
          const isShort = v.stock < item.qty;
          if (isUnavailable || isShort) {
            hasIssues = true;
          }

          const lineTotal = v.price_paise * item.qty;
          subtotalPaise += lineTotal;

          return {
            id: item.id,
            variantId: v.id,
            productId: p.id,
            productSlug: p.slug,
            categorySlug: p.categories?.slug || 'bridal',
            productName: p.name,
            imageUrl: p.product_images?.[0]?.storage_path || null,
            variantLabel: v.label,
            sku: v.sku,
            unitPricePaise: v.price_paise,
            compareAtPricePaise: v.compare_at_price_paise,
            qty: item.qty,
            stock: v.stock,
            unavailable: isUnavailable,
            short: isShort,
            available: v.stock,
          };
        });

        return NextResponse.json({
          ok: true,
          items: hydrated,
          subtotalPaise,
          totalItems: data.reduce((acc: number, it: any) => acc + it.qty, 0),
          canCheckout: !hasIssues && hydrated.length > 0,
        });
      }
    }
  } catch (err) {
    console.warn('Supabase cart fetch error, using memory:', err);
  }

  // Memory fallback
  const userItems = memoryCart.get(session.userId) || [];
  let subtotalPaise = 0;
  let hasIssues = false;

  const hydrated = userItems.map((item) => {
    let foundProduct = null;
    let foundVariant = null;

    for (const prod of SEED_PRODUCTS) {
      const v = prod.variants.find((variant) => variant.id === item.variantId);
      if (v) {
        foundProduct = prod;
        foundVariant = v;
        break;
      }
    }

    if (!foundProduct || !foundVariant) {
      hasIssues = true;
      return {
        id: item.id,
        variantId: item.variantId,
        qty: item.qty,
        unavailable: true,
        reason: 'Item no longer exists',
      };
    }

    const isUnavailable = !foundVariant.is_active || foundVariant.stock === 0;
    const isShort = foundVariant.stock < item.qty;
    if (isUnavailable || isShort) {
      hasIssues = true;
    }

    const lineTotal = foundVariant.price_paise * item.qty;
    subtotalPaise += lineTotal;

    return {
      id: item.id,
      variantId: foundVariant.id,
      productId: foundProduct.id,
      productSlug: foundProduct.slug,
      categorySlug: foundProduct.category_slug,
      productName: foundProduct.name,
      imageUrl: foundProduct.images?.[0]?.storage_path || null,
      variantLabel: foundVariant.label,
      sku: foundVariant.sku,
      unitPricePaise: foundVariant.price_paise,
      compareAtPricePaise: foundVariant.compare_at_price_paise,
      qty: item.qty,
      stock: foundVariant.stock,
      unavailable: isUnavailable,
      short: isShort,
      available: foundVariant.stock,
    };
  });

  return NextResponse.json({
    ok: true,
    items: hydrated,
    subtotalPaise,
    totalItems: userItems.reduce((acc, it) => acc + it.qty, 0),
    canCheckout: !hasIssues && hydrated.length > 0,
  });
}
