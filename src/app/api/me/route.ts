import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryProfiles } from '@/app/api/auth/otp/verify/route';
import { createAdminClient } from '@/lib/supabase/admin';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
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
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } },
      { status: 401 }
    );
  }

  // Look up profile
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createAdminClient();
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', session.userId)
        .single();

      if (data && !error) {
        return NextResponse.json({ ok: true, profile: data });
      }
    }
  } catch {
    // fallback
  }

  const mem = memoryProfiles.get(session.phone);
  return NextResponse.json({
    ok: true,
    profile: {
      id: session.userId,
      phone: session.phone,
      name: session.name || mem?.name || null,
      email: session.email || mem?.email || null,
      profile_completed: session.profileCompleted || mem?.profile_completed || false,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in.' } },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Invalid profile data.' } },
        { status: 400 }
      );
    }

    const newName = parsed.data.name !== undefined ? parsed.data.name : session.name;
    const newEmail = parsed.data.email !== undefined ? parsed.data.email : session.email;

    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin
          .from('profiles')
          .update({
            name: newName,
            email: newEmail || null,
            profile_completed: true,
          })
          .eq('id', session.userId);
      }
    } catch {
      // fallback
    }

    // Update memory
    const mem = memoryProfiles.get(session.phone);
    if (mem) {
      mem.name = newName;
      mem.email = newEmail || null;
      mem.profile_completed = true;
    }

    const updatedSession = {
      ...session,
      name: newName,
      email: newEmail || null,
      profileCompleted: true,
    };

    const response = NextResponse.json({ ok: true, profile: updatedSession });
    response.cookies.set('bz_session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
