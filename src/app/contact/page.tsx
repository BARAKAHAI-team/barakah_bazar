import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Contact Us',
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Contact Us' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        Contact Customer Support
      </h1>

      <div className="text-sm text-[var(--ink)] space-y-4">
        <p>
          For order inquiries, sizing assistance, or feedback, our support team is available Monday to Saturday from 9:30 AM to 6:30 PM IST.
        </p>

        <div className="p-6 bg-[var(--surface)] border border-[var(--line)] space-y-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] block">Email Support</span>
            <span>support@barakahbazar.com [PLACEHOLDER]</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] block">Helpline / WhatsApp</span>
            <span>+91 98765 43210 [PLACEHOLDER]</span>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] block">Registered Address</span>
            <span>Barakah Bazaar Mercantile, Kochi, Kerala, India - 682001 [PLACEHOLDER]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
