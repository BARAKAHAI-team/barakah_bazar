export interface OtpSender {
  send(phone: string, otp: string): Promise<void>;
}

export class ConsoleOtpSender implements OtpSender {
  async send(phone: string, otp: string): Promise<void> {
    console.log(`\n========================================`);
    console.log(`[DEV OTP] ${phone} -> ${otp}`);
    console.log(`========================================\n`);
  }
}

export class SmsOtpSender implements OtpSender {
  async send(phone: string, otp: string): Promise<void> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
      throw new Error(
        'MSG91 configuration missing: MSG91_AUTH_KEY and MSG91_TEMPLATE_ID must be set in environment variables.'
      );
    }

    // Ensure phone has country code without '+' for MSG91 (e.g. 917975962858)
    const formattedPhone = phone.replace(/^\+/, '');

    const url = new URL('https://control.msg91.com/api/v5/otp');
    url.searchParams.append('template_id', templateId);
    url.searchParams.append('mobile', formattedPhone);
    url.searchParams.append('authkey', authKey);
    url.searchParams.append('otp', otp);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.type === 'error')) {
      const errorMsg = data?.message || `Failed to send SMS via MSG91 (HTTP ${res.status})`;
      console.error('[MSG91 Error]', errorMsg, data);
      throw new Error(errorMsg);
    }
  }
}

export function getOtpSender(): OtpSender {
  // If explicitly in DEV_OTP_MODE, log to console instead of burning SMS credits
  const isDevOtp = process.env.DEV_OTP_MODE === 'true';

  if (isDevOtp) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL] DEV_OTP_MODE is strictly forbidden in production!');
    }
    return new ConsoleOtpSender();
  }

  return new SmsOtpSender();
}
