import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get('x-jobs-secret');
  const expectedSecret = process.env.JOBS_SECRET || 'dev_jobs_secret_token';

  if (!secretHeader || secretHeader !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized job trigger' }, { status: 401 });
  }

  // Process notifications
  console.log('[JOBS] Background notification queue checked.');
  return NextResponse.json({ ok: true, processed: 0 });
}
