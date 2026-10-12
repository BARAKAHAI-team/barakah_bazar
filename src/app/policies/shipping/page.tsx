import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  robots: { index: false, follow: true },
};

export default function ShippingPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Shipping Policy' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        Shipping & Delivery Policy
      </h1>
      <div className="text-sm text-[var(--ink)] space-y-4">
        <p>
          We ship across India. All orders include precise pin location coordination to facilitate accurate doorstep delivery.
        </p>
        <p className="p-4 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink-muted)]">
          [CLIENT PLACEHOLDER: Standard delivery timelines (3-7 business days), courier partnerships, and transit insurance details.]
        </p>
      </div>
    </div>
  );
}
