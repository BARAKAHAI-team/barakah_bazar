import type { Metadata } from 'next';
import { CategoryTile } from '@/components/shop/CategoryTile';
import { SEED_CATEGORIES } from '@/lib/catalog/seed-data';

export const metadata: Metadata = {
  title: 'Barakah Bazaar',
  description:
    'Curated Indian collections across bridal wear, natural farm produce, and pure Kerala coconut oil.',
};

export default function CategoryGatePage() {
  const categories = [
    SEED_CATEGORIES['bridal'],
    SEED_CATEGORIES['naturals'],
    SEED_CATEGORIES['coconut-oil'],
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Statement of what Barakah Bazaar is: plain, factual, written by the client */}
      <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl sm:text-3xl text-[var(--ink)] font-normal mb-3">
          Barakah Bazaar
        </h1>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed m-0">
          [CLIENT PLACEHOLDER: A single factual statement defining Barakah Bazaar.]
        </p>
      </div>

      {/* Three equal tiles (stacked on mobile, three columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <CategoryTile
            key={cat.slug}
            slug={cat.slug}
            name={cat.name}
            description={cat.description || cat.tagline || ''}
            accent={cat.accent}
            imageUrl={cat.imageUrl || undefined}
          />
        ))}
      </div>
    </div>
  );
}
