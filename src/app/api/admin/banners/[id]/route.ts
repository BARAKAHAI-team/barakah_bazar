import { NextRequest, NextResponse } from 'next/server';
import { updateBanner, deleteBanner } from '@/lib/banners/banner-store';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateBanner(id, body);
    if (!updated) {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Banner not found' } }, { status: 404 });
    }
    return NextResponse.json({ ok: true, banner: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update banner' } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteBanner(id);
    return NextResponse.json({ ok: success });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete banner' } },
      { status: 500 }
    );
  }
}
