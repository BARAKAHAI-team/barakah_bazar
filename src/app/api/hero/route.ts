import { NextResponse } from 'next/server';
import { getHeroSettings } from '@/lib/hero/hero-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getHeroSettings();
    return NextResponse.json(
      { ok: true, settings },
      {
        headers: {
          'Cache-Control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=60',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { message: err.message || 'Failed to fetch hero settings' } },
      { status: 500 }
    );
  }
}
