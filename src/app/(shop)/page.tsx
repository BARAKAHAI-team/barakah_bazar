import type { Metadata } from 'next';
import { CategoryTile } from '@/components/shop/CategoryTile';
import { ProductCard } from '@/components/shop/ProductCard';
import { IndianMotifDivider } from '@/components/ui/IndianMotifDivider';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/lib/catalog/seed-data';

export const metadata: Metadata = {
  title: 'Barakah Bazaar',
  description:
    'Curated Indian collections across bridal wear, natural farm produce, and pure Kerala coconut oil.',
};

export default function CategoryGatePage() {
  const categoryKeys = ['bridal', 'naturals', 'coconut-oil'] as const;

  const bgClasses: Record<string, string> = {
    bridal: 'bg-[#7A1A28]',
    naturals: 'bg-[#225828]',
    'coconut-oil': 'bg-[#85511A]',
  };

  // Cross-category New Arrivals (5 products across categories)
  const newArrivals = [
    // 2 bridal products (including an apparel and an ornament)
    SEED_PRODUCTS.find((p) => p.slug === 'embroidered-velvet-bridal-farasha-kaftan') || SEED_PRODUCTS[0],
    SEED_PRODUCTS.find((p) => p.slug === 'uncut-polki-emerald-bridal-statement-ring') || SEED_PRODUCTS[5],
    // 2 naturals products
    SEED_PRODUCTS.find((p) => p.slug === 'organic-turmeric-powder') || SEED_PRODUCTS[16],
    SEED_PRODUCTS.find((p) => p.slug === 'green-cardamom-pods') || SEED_PRODUCTS[19],
    // 1 coconut oil product
    SEED_PRODUCTS.find((p) => p.slug === 'pure-cold-pressed-coconut-oil') || SEED_PRODUCTS[22],
  ].filter(Boolean);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Three Hero Category Tiles (Full container width, equal height, flat accent color tokens) */}
      <div className="space-y-6">
        {categoryKeys.map((key) => {
          const cat = SEED_CATEGORIES[key];
          return (
            <CategoryTile
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              description={cat.description || cat.tagline || ''}
              accent={cat.accent}
              bgClass={bgClasses[key] || 'bg-stone-900'}
              imageUrl={cat.imageUrl}
              tagline={cat.tagline}
            />
          );
        })}
      </div>

      {/* Flat repeating geometric Indian motif divider (12px tall, under home tiles) */}
      <div className="pt-6">
        <IndianMotifDivider />
      </div>

      {/* New Arrivals Row: 5 product cards across all categories */}
      {newArrivals.length > 0 && (
        <section className="pt-2 pb-12">
          <div className="flex items-baseline justify-between mb-6 border-b border-[var(--line)] pb-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)] block mb-1">
                Curated Additions
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)] m-0">
                New Arrivals
              </h2>
            </div>
            <span className="text-xs text-[var(--ink-muted)]">
              Across all collections
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
