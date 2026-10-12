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
  async send(_phone: string, _otp: string): Promise<void> {
    throw new Error(
      'SMS OTP provider not configured. Please configure an approved SMS gateway and DLT registration in production.'
    );
  }
}

export function getOtpSender(): OtpSender {
  const isDevOtp = process.env.DEV_OTP_MODE === 'true' || process.env.NODE_ENV !== 'production';

  if (isDevOtp) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL] DEV_OTP_MODE is strictly forbidden in production!');
    }
    return new ConsoleOtpSender();
  }

  return new SmsOtpSender();
}
