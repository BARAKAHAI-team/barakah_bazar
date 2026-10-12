import { NextRequest, NextResponse } from 'next/server';
import { memoryAddresses } from '../route';

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('bz_session');
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const addresses = memoryAddresses.get(session.userId) || [];
  const idx = addresses.findIndex((a) => a.id === id);

  if (idx === -1) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Address not found.' } },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();

    if (body.is_default) {
      addresses.forEach((a) => (a.is_default = false));
    }

    const updated = {
      ...addresses[idx],
      ...body,
      id,
      userId: session.userId,
    };

    addresses[idx] = updated;
    memoryAddresses.set(session.userId, addresses);

    return NextResponse.json({ ok: true, address: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Login required.' } },
      { status: 401 }
    );
  }

  const { id } = await params;
  const addresses = memoryAddresses.get(session.userId) || [];
  const filtered = addresses.filter((a) => a.id !== id);
  memoryAddresses.set(session.userId, filtered);

  return NextResponse.json({ ok: true, message: 'Address deleted.' });
}
