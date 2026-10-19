import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { ok: false, error: 'Latitude and Longitude are required' },
        { status: 400 }
      );
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'BarakahBazar/1.0 (support@barakahbazar.com)',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      next: { revalidate: 3600 }, // Cache reverse geocode for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: 'Reverse geocode service temporarily unavailable' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const addr = data.address || {};

    // Extract city (handling Indian urban & rural hierarchy)
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      addr.state_district ||
      '';

    // State
    const state = addr.state || '';

    // Indian 6-digit Pincode (postcode)
    let pincode = (addr.postcode || '').replace(/\D/g, '');
    if (pincode.length > 6) {
      pincode = pincode.slice(0, 6);
    }

    // Suggested address line 1
    const roadParts = [
      addr.house_number,
      addr.building,
      addr.residential,
      addr.road || addr.pedestrian || addr.street,
      addr.neighbourhood || addr.suburb,
    ].filter(Boolean);

    const line1 = roadParts.join(', ');

    return NextResponse.json({
      ok: true,
      address: {
        city,
        state,
        pincode,
        line1,
        displayName: data.display_name || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || 'Geocoding failed' },
      { status: 500 }
    );
  }
}
