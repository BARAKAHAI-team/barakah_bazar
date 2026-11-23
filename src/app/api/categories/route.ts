import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/catalog/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getAllCategories(true);
    return NextResponse.json(
      {
        ok: true,
        categories: categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          tagline: c.tagline,
          accent: c.accent,
          eyebrow: c.eyebrow,
          imageUrl: c.imageUrl,
          sort_order: c.sort_order,
        })),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { message: err.message || 'Failed to fetch categories' } },
      { status: 500 }
    );
  }
}
