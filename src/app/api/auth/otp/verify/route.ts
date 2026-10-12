import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeIndianPhone } from '@/lib/auth/phone';
import { verifyOtpHash } from '@/lib/auth/otp';
import { memoryOtpStore } from '../request/route';
import { createAdminClient } from '@/lib/supabase/admin';

const verifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

export const memoryProfiles: Map<string, { id: string; phone: string; name: string | null; email: string | null; profile_completed: boolean }> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Valid phone and 6-digit OTP required.' } },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeIndianPhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_PHONE', message: 'Invalid phone number format.' } },
        { status: 400 }
      );
    }

    const record = memoryOtpStore.get(normalizedPhone);
    if (!record) {
      return NextResponse.json(
        { ok: false, error: { code: 'OTP_NOT_FOUND', message: 'No OTP request found. Please request a new OTP.' } },
        { status: 404 }
      );
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      memoryOtpStore.delete(normalizedPhone);
      return NextResponse.json(
        { ok: false, error: { code: 'OTP_EXPIRED', message: 'This OTP has expired. Please request a new one.' } },
        { status: 400 }
      );
    }

    // Check attempts
    if (record.attempts >= 5) {
      memoryOtpStore.delete(normalizedPhone);
      return NextResponse.json(
        { ok: false, error: { code: 'MAX_ATTEMPTS', message: 'Too many incorrect attempts. This code is locked.' } },
        { status: 429 }
      );
    }

    const secret = process.env.OTP_HMAC_SECRET || 'dev-otp-hmac-secret-at-least-16-chars';
    const isValid = verifyOtpHash(secret, normalizedPhone, parsed.data.otp, record.hash);

    if (!isValid) {
      record.attempts += 1;
      return NextResponse.json(
        { ok: false, error: { code: 'WRONG_OTP', message: 'Incorrect OTP. Please try again.' } },
        { status: 400 }
      );
    }

    // Successfully verified -> consume code
    memoryOtpStore.delete(normalizedPhone);

    // Profile lookup or creation
    let userId = '';
    let profileCompleted = false;
    let userName: string | null = null;
    let userEmail: string | null = null;

    // Check Supabase if configured
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createAdminClient();
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('phone', normalizedPhone)
          .single();

        if (profile) {
          userId = profile.id;
          userName = profile.name;
          userEmail = profile.email;
          profileCompleted = profile.profile_completed;
        } else {
          // Synthetic email per CONTEXT.md 9.3
          const digits = normalizedPhone.replace(/\D/g, '');
          const syntheticEmail = `${digits}@phone.barakah.invalid`;

          const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            phone: normalizedPhone,
            phone_confirm: true,
            email: syntheticEmail,
            email_confirm: true,
          });

          if (authUser?.user) {
            userId = authUser.user.id;
            await supabaseAdmin.from('profiles').insert({
              id: userId,
              phone: normalizedPhone,
              profile_completed: false,
            });
          }
        }
      }
    } catch {
      // Memory fallback
    }

    // If fallback memory is used
    if (!userId) {
      let existing = memoryProfiles.get(normalizedPhone);
      if (!existing) {
        existing = {
          id: `usr_${Math.random().toString(36).substring(2, 10)}`,
          phone: normalizedPhone,
          name: null,
          email: null,
          profile_completed: false,
        };
        memoryProfiles.set(normalizedPhone, existing);
      }
      userId = existing.id;
      userName = existing.name;
      userEmail = existing.email;
      profileCompleted = existing.profile_completed;
    }

    // Set HTTP-only session cookie
    const response = NextResponse.json({
      ok: true,
      profileCompleted,
      userId,
      phone: normalizedPhone,
    });

    const sessionPayload = JSON.stringify({
      userId,
      phone: normalizedPhone,
      name: userName,
      email: userEmail,
      profileCompleted,
    });

    response.cookies.set('bz_session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message || 'Verification failed' } },
      { status: 500 }
    );
  }
}
