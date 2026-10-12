import { ConsoleEmailSender } from './email';
import { ConsoleWhatsAppSender } from './whatsapp';

export async function processNotification(item: {
  channel: 'WHATSAPP' | 'EMAIL';
  recipient: string;
  orderNumber: string;
  totalPaise: number;
}) {
  const emailSender = new ConsoleEmailSender();
  const waSender = new ConsoleWhatsAppSender();

  if (item.channel === 'WHATSAPP') {
    await waSender.send(
      item.recipient,
      `Your Barakah Bazaar order ${item.orderNumber} has been confirmed. Total payable: ₹${Math.round(item.totalPaise / 100)}. Thank you for shopping with us.`
    );
  } else if (item.channel === 'EMAIL') {
    await emailSender.send(
      item.recipient,
      `Order Confirmation - ${item.orderNumber}`,
      `Hello,\n\nYour Barakah Bazaar order ${item.orderNumber} has been successfully placed. Your items are being prepared for dispatch.\n\nThank you for choosing Barakah Bazaar.`
    );
  }
}
