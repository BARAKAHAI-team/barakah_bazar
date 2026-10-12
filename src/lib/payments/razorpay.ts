import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export function verifyCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  secret: string
): boolean {
  try {
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generated = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const genBuf = Buffer.from(generated, 'hex');
    const sigBuf = Buffer.from(razorpaySignature, 'hex');

    if (genBuf.length !== sigBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const generated = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const genBuf = Buffer.from(generated, 'hex');
    const sigBuf = Buffer.from(signatureHeader, 'hex');

    if (genBuf.length !== sigBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(genBuf, sigBuf);
  } catch {
    return false;
  }
}
