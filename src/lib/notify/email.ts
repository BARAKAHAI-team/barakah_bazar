export interface EmailSender {
  send(to: string, subject: string, content: string): Promise<void>;
}

export class ConsoleEmailSender implements EmailSender {
  async send(to: string, subject: string, content: string): Promise<void> {
    console.log(`\n========================================`);
    console.log(`[DEV EMAIL NOTIFICATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${content}`);
    console.log(`========================================\n`);
  }
}
