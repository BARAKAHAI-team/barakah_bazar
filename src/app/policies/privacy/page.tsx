import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: false, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-8">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] mt-4 mb-6">
        Privacy Policy
      </h1>
      <div className="text-sm text-[var(--ink)] space-y-4">
        <p>
          We respect your privacy. This policy outlines how Barakah Bazaar collects, uses, and safeguards customer phone numbers, delivery coordinates, and order data in compliance with Indian information technology regulations.
        </p>
        <p className="p-4 bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink-muted)]">
          [CLIENT PLACEHOLDER: Full legal privacy policy text to be supplied by legal counsel.]
        </p>
      </div>
    </div>
  );
}
