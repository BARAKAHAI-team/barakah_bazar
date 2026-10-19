import { NextRequest, NextResponse } from 'next/server';
import { getAllBanners, createBanner } from '@/lib/banners/banner-store';

export async function GET() {
  try {
    const banners = await getAllBanners();
    return NextResponse.json({ ok: true, banners });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'FETCH_ERROR', message: err.message || 'Failed to fetch banners' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.text) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Banner text is required' } },
        { status: 400 }
      );
    }
    const created = await createBanner(body);
    return NextResponse.json({ ok: true, banner: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'CREATE_FAILED', message: err.message || 'Failed to create banner' } },
      { status: 500 }
    );
  }
}
