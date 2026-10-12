import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export interface MemoryAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}

export const memoryAddresses: Map<string, MemoryAddress[]> = new Map();

const addressSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
  latitude: z.number(),
  longitude: z.number(),
  is_default: z.boolean().optional(),
});

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('bz_session');
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const addresses = memoryAddresses.get(session.userId) || [];
  return NextResponse.json({ ok: true, addresses });
}

export async function POST(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message || 'Invalid address data' } },
        { status: 400 }
      );
    }

    const currentAddresses = memoryAddresses.get(session.userId) || [];
    const isFirst = currentAddresses.length === 0;

    const newAddress: MemoryAddress = {
      id: `addr_${Math.random().toString(36).substring(2, 9)}`,
      userId: session.userId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      line1: parsed.data.line1,
      line2: parsed.data.line2,
      landmark: parsed.data.landmark,
      city: parsed.data.city,
      state: parsed.data.state,
      pincode: parsed.data.pincode,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      is_default: parsed.data.is_default !== undefined ? parsed.data.is_default : isFirst,
      created_at: new Date().toISOString(),
    };

    if (newAddress.is_default) {
      currentAddresses.forEach((a) => (a.is_default = false));
    }

    currentAddresses.push(newAddress);
    memoryAddresses.set(session.userId, currentAddresses);

    return NextResponse.json({ ok: true, address: newAddress });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
