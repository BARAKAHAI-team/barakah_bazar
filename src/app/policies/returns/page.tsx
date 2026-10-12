import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  robots: { index: false, follow: true },
};

export default function ReturnsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Returns & Exchanges' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        Returns & Exchanges Policy
      </h1>
      <div className="text-sm text-[var(--ink)] space-y-4">
        <p>
          Given the bespoke nature of bridal wear and safety regulations regarding sealed food staples, specific conditions apply to exchanges and returns.
        </p>
        <p className="p-4 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink-muted)]">
          [CLIENT PLACEHOLDER: Returns window, bridal exchange conditions, and food-grade non-returnable guidelines to be specified.]
        </p>
      </div>
    </div>
  );
}
