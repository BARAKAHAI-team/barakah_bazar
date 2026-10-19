import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = body.folder || 'barakah_products';

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'barakah-bazar';
    const apiKey = process.env.CLOUDINARY_API_KEY || 'mock_api_key';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'mock_api_secret';

    // Cloudinary signature generation:
    // Sort parameters alphabetically, join with '=', join pairs with '&', append API secret, compute SHA-1 hash
    const paramsToSign: Record<string, any> = {
      folder,
      timestamp,
    };

    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return NextResponse.json({
      ok: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'barakah_products',
      isMock: apiKey === 'mock_api_key' || apiKey === 'dummy_cloudinary_key',
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SIGNATURE_FAILED', message: err.message || 'Failed to generate upload signature' } },
      { status: 500 }
    );
  }
}
