import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { inMemoryUsers } from '../route';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role || !['customer', 'admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_ROLE', message: 'Role must be customer, admin, or manager' } },
        { status: 400 }
      );
    }

    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = createAdminClient() as any;
        const { data, error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ ok: true, user: data });
        }
      } catch (err) {
        console.warn('Supabase user role update fallback:', err);
      }
    }

    const u = inMemoryUsers.find((user) => user.id === id);
    if (!u) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    u.role = role;
    return NextResponse.json({ ok: true, user: u });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update user' } },
      { status: 500 }
    );
  }
}
