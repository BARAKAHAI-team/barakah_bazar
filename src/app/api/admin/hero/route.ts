import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getHeroSettings, updateHeroSettings } from '@/lib/hero/hero-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getHeroSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { message: err.message || 'Failed to get hero settings' } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await updateHeroSettings(body);
    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/hero');
    } catch {}
    return NextResponse.json({ ok: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { message: err.message || 'Failed to update hero settings' } },
      { status: 500 }
    );
  }
}
