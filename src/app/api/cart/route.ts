import { NextRequest, NextResponse } from 'next/server';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

// In-memory cart store keyed by user ID
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

  const userItems = memoryCart.get(session.userId) || [];

  // Hydrate items with live product data & stock flags
  let subtotalPaise = 0;
  let hasIssues = false;

  const hydrated = userItems.map((item) => {
    // Find variant across products
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
