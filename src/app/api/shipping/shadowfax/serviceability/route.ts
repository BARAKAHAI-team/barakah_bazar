import { NextRequest, NextResponse } from 'next/server';
import { checkShadowfaxServiceability } from '@/lib/shipping/shadowfax';

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get('pincode') || '';
  const result = await checkShadowfaxServiceability(pincode);

  if (!result.ok && result.mode === 'VALIDATION') {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
