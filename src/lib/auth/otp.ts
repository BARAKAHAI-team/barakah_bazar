import crypto from 'crypto';

export function generateOtp(): string {
  // Generates secure 6-digit numeric OTP (100000 to 999999)
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(secret: string, phone: string, otp: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${phone}:${otp}`)
    .digest('hex');
}

export function verifyOtpHash(
  secret: string,
  phone: string,
  candidateOtp: string,
  expectedHash: string
): boolean {
  try {
    const candidateHash = hashOtp(secret, phone, candidateOtp);
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');

    if (candidateBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(candidateBuf, expectedBuf);
  } catch {
    return false;
  }
}
