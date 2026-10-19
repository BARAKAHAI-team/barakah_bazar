import { NextResponse } from 'next/server';
import { getActiveBanner } from '@/lib/banners/banner-store';

export async function GET() {
  try {
    const banner = await getActiveBanner();
    if (banner && banner.is_active) {
      return NextResponse.json({
        notice: {
          id: banner.id,
          text: banner.text,
          highlight_text: banner.highlight_text,
          link_url: banner.link_url,
          badge_text: banner.badge_text,
          bg_color: banner.bg_color,
          text_color: banner.text_color,
        },
      });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ notice: null });
}
