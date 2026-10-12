import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeIndianPhone } from '@/lib/auth/phone';
import { generateOtp, hashOtp } from '@/lib/auth/otp';
import { getOtpSender } from '@/lib/auth/senders';
import { createAdminClient } from '@/lib/supabase/admin';

const requestSchema = z.object({
  phone: z.string().min(10),
});

// In-memory rate limiting and fallback store for dev mode or when Supabase is connecting
interface MemoryOtpRecord {
  phone: string;
  hash: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}
export const memoryOtpStore: Map<string, MemoryOtpRecord> = new Map();
const lastRequestTime: Map<string, number> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_INPUT', message: 'Valid phone number is required.' } },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeIndianPhone(parsed.data.phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_PHONE',
            message: 'Please enter a valid 10-digit Indian mobile number.',
          },
        },
        { status: 400 }
      );
    }

    // Rate Limiting: 30s resend cooldown
    const now = Date.now();
    const lastTime = lastRequestTime.get(normalizedPhone);
    if (lastTime && now - lastTime < 30000) {
      const waitSeconds = Math.ceil((30000 - (now - lastTime)) / 1000);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
          },
        },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const secret = process.env.OTP_HMAC_SECRET || 'dev-otp-hmac-secret-at-least-16-chars';
    const otpHash = hashOtp(secret, normalizedPhone, otp);
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes

    // Store in memory
    memoryOtpStore.set(normalizedPhone, {
      phone: normalizedPhone,
      hash: otpHash,
      otp,
      expiresAt,
      attempts: 0,
    });
    lastRequestTime.set(normalizedPhone, now);

    // Also persist to Supabase otp_requests if available
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin.from('otp_requests').insert({
          phone: normalizedPhone,
          otp_hash: otpHash,
          expires_at: new Date(expiresAt).toISOString(),
          attempts: 0,
        });
      }
    } catch {
      // memory fallback suffices
    }

    // Send OTP via provider
    const sender = getOtpSender();
    await sender.send(normalizedPhone, otp);

    const isDevMode = process.env.DEV_OTP_MODE === 'true' || process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      ok: true,
      message: 'OTP sent successfully.',
      ...(isDevMode ? { devOtp: otp } : {}),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to request OTP' } },
      { status: 500 }
    );
  }
}
