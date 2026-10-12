import type { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/catalog/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Search, TrendingUp } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | Barakah Bazaar` : 'Search Indian Heritage Collections | Barakah Bazaar',
    robots: { index: false, follow: true },
  };
}

const popularSearches = [
  'Bridal Lehenga',
  'Kundan Choker Set',
  'Temple Jewellery',
  'Jadau Bangles',
  'Organza Saree',
  'Organic Turmeric',
  'Cold Pressed Oil',
];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';
  const results = await searchProducts(query);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Search Catalog' }]} />

      <div className="mt-4 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] font-bold m-0">
          {query ? `Search Results for "${query}"` : 'Search Barakah Bazaar'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-2">
          {query
            ? `Found ${results.length} authentic item(s) across bridal couture, organic spices, and coconut oil.`
            : 'Explore handcrafted lehengas, pure farm spices, and wood-pressed coconut oils.'}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="mb-8 max-w-xl">
        <form method="GET" action="/search" className="flex gap-2 relative">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products"
            className="w-full h-11 pl-10 pr-24 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-[2px] outline-hidden focus:border-[var(--ink)]"
          />
          <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-3 text-[var(--ink-muted)]" />
          <button
            type="submit"
            className="absolute right-1 top-1 h-9 px-4 bg-[var(--ink)] hover:bg-black text-[var(--bg)] text-xs font-medium rounded-[2px] cursor-pointer transition-colors"
          >
            Search
          </button>
        </form>

        {/* Popular Searches */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-medium text-[var(--ink-muted)] uppercase flex items-center gap-1">
            <TrendingUp size={12} strokeWidth={1.5} /> Suggestions:
          </span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-2 py-0.5 bg-[var(--surface-subtle)] text-[var(--ink)] text-[11px] font-medium rounded-[2px] hover:border-[var(--ink)] border border-transparent transition-colors no-underline"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      {query && results.length === 0 ? (
        <div className="p-8 text-center border border-[var(--line)] bg-[var(--surface)] rounded-[2px]">
          <p className="text-sm text-[var(--ink-muted)] mb-4">
            No matching items found for &ldquo;{query}&rdquo;.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-medium">
            <Link href="/bridal" className="px-3 py-1.5 border border-[var(--line)] text-[var(--ink)] rounded-[2px] no-underline hover:border-[var(--ink)]">
              Barakah Bridal Collections
            </Link>
            <Link href="/naturals" className="px-3 py-1.5 border border-[var(--line)] text-[var(--ink)] rounded-[2px] no-underline hover:border-[var(--ink)]">
              Barakah Naturals
            </Link>
            <Link href="/coconut-oil" className="px-3 py-1.5 border border-[var(--line)] text-[var(--ink)] rounded-[2px] no-underline hover:border-[var(--ink)]">
              Barakah Kerala Pure Coconut Oil
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
