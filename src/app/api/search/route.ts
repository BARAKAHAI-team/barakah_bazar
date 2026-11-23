import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/catalog/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    if (!q.trim()) {
      return NextResponse.json({ ok: true, products: [] });
    }

    const results = await searchProducts(q);

    // Return top 5 matches formatted for quick navbar preview
    const products = results.slice(0, 5).map((p) => {
      const primaryVariant = p.variants?.[0];
      const primaryImg = p.images?.find((img) => img.is_primary)?.storage_path || p.images?.[0]?.storage_path || p.thumbnail_url || '';
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category_slug: p.category_slug,
        price_paise: primaryVariant?.price_paise || 0,
        image: primaryImg,
      };
    });

    return NextResponse.json({ ok: true, products });
  } catch {
    return NextResponse.json({ ok: false, products: [] });
  }
}
