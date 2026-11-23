import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/catalog/data';
import { getActiveBanner } from '@/lib/banners/banner-store';
import { createAdminClient } from '@/lib/supabase/admin';

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
  try {
    const session = getSessionUser(req);
    let user = null;
    let cartCount = 0;
    let wishlistCount = 0;

    // 1. Session & User Data
    if (session) {
      const adminPhones = (process.env.ADMIN_PHONE_NUMBERS || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const isAdmin = session.isAdmin || session.role === 'admin' || adminPhones.includes(session.phone);

      user = {
        id: session.userId,
        name: session.name || null,
        phone: session.phone || null,
        isAdmin,
      };

      // Fetch user profile, cart & wishlist count from Supabase if available
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const supabase = createAdminClient() as any;

          // Fetch profile name if not in session
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.userId)
            .single();
          if (profile?.name) {
            user.name = profile.name;
          }

          // Fetch cart count
          const { data: cartItems } = await supabase
            .from('cart_items')
            .select('qty')
            .eq('user_id', session.userId);
          if (cartItems && Array.isArray(cartItems)) {
            cartCount = cartItems.reduce((acc: number, item: any) => acc + (item.qty || 0), 0);
          }

          // Fetch wishlist count
          const { data: wishItems } = await supabase
            .from('wishlist_items')
            .select('id')
            .eq('user_id', session.userId);
          if (wishItems && Array.isArray(wishItems)) {
            wishlistCount = wishItems.length;
          }
        }
      } catch {
        // Fallback to memory
      }
    }

    // 2. Active Notice Banner
    let notice = null;
    try {
      const banner = await getActiveBanner();
      if (banner && banner.is_active) {
        notice = {
          id: banner.id,
          text: banner.text,
          highlight_text: banner.highlight_text,
          link_url: banner.link_url,
          badge_text: banner.badge_text,
          bg_color: banner.bg_color,
          text_color: banner.text_color,
        };
      }
    } catch {
      // no notice
    }

    // 3. Active Categories
    const categories = await getAllCategories(true);

    return NextResponse.json(
      {
        ok: true,
        user,
        cartCount,
        wishlistCount,
        notice,
        categories: categories.map((c) => ({
          slug: c.slug,
          name: c.name.replace(/^Barakah\s+/i, '').replace(/\s+Collections?$/i, '').trim() || c.name,
        })),
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Initialization failed' },
      { status: 500 }
    );
  }
}
