import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        Terms of Service
      </h1>
      <div className="text-sm text-[var(--ink)] space-y-4">
        <p>
          By placing an order on Barakah Bazaar, you agree to these terms governing product purchase, pricing in INR inclusive of all taxes, and delivery obligations.
        </p>
        <p className="p-4 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink-muted)]">
          [CLIENT PLACEHOLDER: Full Terms of Service to be finalized by business operations.]
        </p>
      </div>
    </div>
  );
}
