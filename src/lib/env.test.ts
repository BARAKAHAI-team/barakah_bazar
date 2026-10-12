import { describe, it, expect } from 'vitest';
import { validatePublicEnv, validateServerEnv } from './env';

describe('validatePublicEnv', () => {
  it('throws clear error when required public variables are missing', () => {
    expect(() => validatePublicEnv({})).toThrow(/Missing or invalid public environment variables/);
    expect(() => validatePublicEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(() => validatePublicEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    expect(() => validatePublicEnv({})).toThrow(/NEXT_PUBLIC_RAZORPAY_KEY_ID/);
  });

  it('validates and applies defaults for valid public config', () => {
    const valid = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-sample',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_test_123',
    };
    const res = validatePublicEnv(valid);
    expect(res.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(res.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
  });
});

describe('validateServerEnv', () => {
  const completeServerEnv = {
    NODE_ENV: 'development',
    SUPABASE_SERVICE_ROLE_KEY: 'secret-service-role-key',
    OTP_HMAC_SECRET: 'random-hmac-secret-min-16-characters-long',
    DEV_OTP_MODE: 'true',
    RAZORPAY_KEY_ID: 'rzp_test_123',
    RAZORPAY_KEY_SECRET: 'rzp_secret_456',
    RAZORPAY_WEBHOOK_SECRET: 'webhook_secret_789',
    JOBS_SECRET: 'jobs_secret_token_123',
  };

  it('throws clear error listing missing server variables', () => {
    expect(() => validateServerEnv({})).toThrow(/Missing or invalid server environment variables/);
    expect(() => validateServerEnv({})).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(() => validateServerEnv({})).toThrow(/OTP_HMAC_SECRET/);
  });

  it('passes with complete server configuration in development', () => {
    const res = validateServerEnv(completeServerEnv);
    expect(res.DEV_OTP_MODE).toBe(true);
  });

  it('refuses to start when DEV_OTP_MODE=true in production', () => {
    const prodEnvWithDevOtp = {
      ...completeServerEnv,
      NODE_ENV: 'production',
      DEV_OTP_MODE: 'true',
    };
    expect(() => validateServerEnv(prodEnvWithDevOtp)).toThrow(
      /DEV_OTP_MODE=true is forbidden in production/
    );
  });
});
