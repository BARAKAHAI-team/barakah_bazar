export interface WhatsAppSender {
  send(to: string, message: string): Promise<void>;
}

export class ConsoleWhatsAppSender implements WhatsAppSender {
  async send(to: string, message: string): Promise<void> {
    console.log(`\n========================================`);
    console.log(`[DEV WHATSAPP NOTIFICATION]`);
    console.log(`To: ${to}`);
    console.log(`Message:\n${message}`);
    console.log(`========================================\n`);
  }
}
