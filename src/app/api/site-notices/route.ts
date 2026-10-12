import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createPublicClient();
      const { data, error } = await (supabase as any)
        .from('site_notices')
        .select('id, text')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ notice: data });
      }
    }
  } catch {
    // Database table not available or network error
  }

  // Default: no bar at all
  return NextResponse.json({ notice: null });
}
