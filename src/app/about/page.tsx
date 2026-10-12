import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Us',
  robots: { index: false, follow: true },
};

export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'About Us' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        About Barakah Bazaar
      </h1>

      <div className="prose text-sm text-[var(--ink)] space-y-4 leading-relaxed">
        <p>
          Barakah Bazaar brings together three distinct traditions of quality under a single roof: bespoke bridal garments, single-origin natural farm products, and pure Kerala cold-pressed coconut oil.
        </p>
        <p className="p-4 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink-muted)]">
          [CLIENT PLACEHOLDER: Brand founding history, farmer network details, and master artisan partnerships to be provided.]
        </p>
      </div>
    </div>
  );
}
