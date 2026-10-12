import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully.' });
  response.cookies.set('bz_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
