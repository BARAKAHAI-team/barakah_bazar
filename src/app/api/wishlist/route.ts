import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { createAdminClient } from '@/lib/supabase/admin';

const wishlistMemory: Map<string, Set<string>> = new Map();

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

  // 1. Check Supabase
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient() as any;
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          product_id,
          products (
            id, category_id, slug, name, short_description, description, attributes,
            option_names, badge, is_active, is_featured, seo_title, seo_description,
            thumbnail_url, categories!inner(slug),
            product_variants(*), product_images(*)
          )
        `)
        .eq('user_id', session.userId);

      if (!error && data) {
        const productIds = data.map((item: any) => item.product_id);
        const products = data
          .map((item: any) => item.products)
          .filter(Boolean)
          .map((p: any) => ({
            id: p.id,
            category_id: p.category_id,
            category_slug: p.categories?.slug || 'bridal',
            slug: p.slug,
            name: p.name,
            short_description: p.short_description,
            description: p.description,
            attributes: p.attributes || {},
            option_names: p.option_names || [],
            badge: p.badge,
            is_active: p.is_active,
            is_featured: p.is_featured,
            seo_title: p.seo_title,
            seo_description: p.seo_description,
            thumbnail_url: p.thumbnail_url || p.product_images?.[0]?.storage_path,
            variants: p.product_variants || [],
            images: p.product_images || [],
            rating: { avg_rating: 4.8, review_count: 8 },
          }));

        return NextResponse.json({ ok: true, productIds, products });
      }
    }
  } catch (err) {
    console.warn('Supabase wishlist fetch error:', err);
  }

  // Memory fallback
  const userWishlist = wishlistMemory.get(session.userId) || new Set();
  const productIds = Array.from(userWishlist);
  const products = SEED_PRODUCTS.filter((p) => userWishlist.has(p.id) && p.is_active);

  return NextResponse.json({
    ok: true,
    productIds,
    products,
  });
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
    const parsed = z.object({ productId: z.string() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'productId is required.' } },
        { status: 400 }
      );
    }

    // Insert to Supabase if connected
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient();
        await supabase
          .from('wishlist_items')
          .upsert({ user_id: session.userId, product_id: parsed.data.productId });
      }
    } catch (err) {
      console.warn('Supabase wishlist insert error:', err);
    }

    let userWishlist = wishlistMemory.get(session.userId);
    if (!userWishlist) {
      userWishlist = new Set();
      wishlistMemory.set(session.userId, userWishlist);
    }
    userWishlist.add(parsed.data.productId);

    return NextResponse.json({ ok: true, message: 'Added to wishlist.' });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_INPUT', message: 'productId parameter required.' } },
      { status: 400 }
    );
  }

  // Delete from Supabase
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', session.userId)
        .eq('product_id', productId);
    }
  } catch (err) {
    console.warn('Supabase wishlist delete error:', err);
  }

  const userWishlist = wishlistMemory.get(session.userId);
  if (userWishlist) {
    userWishlist.delete(productId);
  }

  return NextResponse.json({ ok: true, message: 'Removed from wishlist.' });
}
