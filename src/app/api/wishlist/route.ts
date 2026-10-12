import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

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

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_INPUT', message: 'productId parameter required.' } },
      { status: 400 }
    );
  }

  const userWishlist = wishlistMemory.get(session.userId);
  if (userWishlist) {
    userWishlist.delete(productId);
  }

  return NextResponse.json({ ok: true, message: 'Removed from wishlist.' });
}
