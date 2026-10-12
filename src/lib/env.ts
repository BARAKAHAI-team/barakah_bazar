import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' }),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, { message: 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required' }),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: 'SUPABASE_SERVICE_ROLE_KEY is required' }),
  OTP_HMAC_SECRET: z.string().min(16, { message: 'OTP_HMAC_SECRET must be at least 16 characters' }),
  DEV_OTP_MODE: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  RAZORPAY_KEY_ID: z.string().min(1, { message: 'RAZORPAY_KEY_ID is required' }),
  RAZORPAY_KEY_SECRET: z.string().min(1, { message: 'RAZORPAY_KEY_SECRET is required' }),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, { message: 'RAZORPAY_WEBHOOK_SECRET is required' }),
  JOBS_SECRET: z.string().min(1, { message: 'JOBS_SECRET is required' }),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validatePublicEnv(env: Record<string, string | undefined> = process.env): PublicEnv {
  const parsed = publicEnvSchema.safeParse(env);
  if (!parsed.success) {
    const errorList = parsed.error.issues.map((err) => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
    throw new Error(`[ENV ERROR] Missing or invalid public environment variables:\n${errorList}`);
  }
  return parsed.data;
}

export function validateServerEnv(env: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    const errorList = parsed.error.issues.map((err) => `  - ${err.path.join('.')}: ${err.message}`).join('\n');
    throw new Error(`[ENV ERROR] Missing or invalid server environment variables:\n${errorList}`);
  }

  // Startup guard: DEV_OTP_MODE must never be true in production
  if (parsed.data.DEV_OTP_MODE && (env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production')) {
    throw new Error('[FATAL SECURITY] DEV_OTP_MODE=true is forbidden in production environment!');
  }

  return parsed.data;
}

let cachedServerEnv: ServerEnv | null = null;
export function getServerEnv(): ServerEnv {
  if (!cachedServerEnv) {
    cachedServerEnv = validateServerEnv();
  }
  return cachedServerEnv;
}

let cachedPublicEnv: PublicEnv | null = null;
export function getPublicEnv(): PublicEnv {
  if (!cachedPublicEnv) {
    cachedPublicEnv = validatePublicEnv();
  }
  return cachedPublicEnv;
}
