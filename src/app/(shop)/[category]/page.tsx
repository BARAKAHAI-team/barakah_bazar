import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { getCategoryBySlug, listCategoryProducts } from '@/lib/catalog/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { SubcategoryStrip, SubcategoryItem } from '@/components/shop/SubcategoryStrip';
import { QuickFilterBar } from '@/components/shop/QuickFilterBar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryHero } from '@/components/shop/CategoryHero';
import { CategoryTrustBar } from '@/components/shop/CategoryTrustBar';
import { CategoryEditorialStory } from '@/components/shop/CategoryEditorialStory';
import { FloatingWhatsApp } from '@/components/shop/FloatingWhatsApp';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    colour?: string;
    packSize?: string;
    occasion?: string;
    subCategory?: string;
    discount?: string;
    rating?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
    page?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/${cat.slug}`;

  return {
    title: cat.seo_title || cat.name,
    description: cat.seo_description || cat.description || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cat.seo_title || cat.name,
      description: cat.seo_description || cat.description || undefined,
    },
  };
}

function getSubcategoryItems(slug: string): SubcategoryItem[] {
  if (slug === 'bridal') {
    return [
      { name: 'All Bridal', value: '' },
      { name: 'Festive Suits & Sets', value: 'Festive Suits & Sets' },
      { name: 'Bridal Lehengas', value: 'Bridal Lehengas' },
    ];
  }

  if (slug === 'naturals') {
    return [
      { name: 'All Naturals', value: '' },
      { name: 'Artisanal Scented Candles', value: 'Artisanal Scented Candles' },
      { name: 'Single-Origin Spices', value: 'Single-Origin Spices' },
    ];
  }

  if (slug === 'coconut-oil') {
    return [
      { name: 'All Oils', value: '' },
      { name: 'Cold-Pressed Coconut Oil', value: 'Cold-Pressed Coconut Oil' },
      { name: 'Roasted Uruli Coconut Oil', value: 'Roasted Uruli Coconut Oil' },
      { name: 'Ayurvedic Hair Care', value: 'Ayurvedic Hair Care' },
    ];
  }

  return [];
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: slug } = await params;
  const sp = await searchParams;

  const validSlugs = ['bridal', 'naturals', 'coconut-oil'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const currentPage = sp.page ? parseInt(sp.page, 10) : 1;
  const { products, total, totalPages } = await listCategoryProducts({
    categorySlug: slug,
    minPrice: sp.minPrice ? parseInt(sp.minPrice, 10) : undefined,
    maxPrice: sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined,
    size: sp.size,
    colour: sp.colour,
    packSize: sp.packSize,
    occasion: sp.occasion,
    subCategory: sp.subCategory,
    sort: sp.sort,
    page: currentPage,
    limit: 24,
  });

  const subcategoryItems = getSubcategoryItems(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: `${siteUrl}/${slug}`,
      },
    ],
  };

  // Build pagination URLs
  const buildPageUrl = (targetPage: number) => {
    const q = new URLSearchParams();
    if (sp.minPrice) q.set('minPrice', sp.minPrice);
    if (sp.maxPrice) q.set('maxPrice', sp.maxPrice);
    if (sp.size) q.set('size', sp.size);
    if (sp.colour) q.set('colour', sp.colour);
    if (sp.packSize) q.set('packSize', sp.packSize);
    if (sp.subCategory) q.set('subCategory', sp.subCategory);
    if (sp.sort) q.set('sort', sp.sort);
    if (sp.discount) q.set('discount', sp.discount);
    if (sp.rating) q.set('rating', sp.rating);
    q.set('page', targetPage.toString());
    return `/${slug}?${q.toString()}`;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Top Breadcrumbs: Seamless integration with clean site header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-2.5">
          <Breadcrumbs items={[{ label: category.name }]} />
        </div>
      </div>

      {/* 1. High-Impact Editorial Hero Showcase */}
      <CategoryHero
        slug={slug}
        name={category.name}
        tagline={category.tagline}
        description={category.description}
        imageUrl={category.imageUrl}
        totalProducts={total}
      />

      {/* 2. Four-Pillar Trust & Guarantees Strip */}
      <CategoryTrustBar slug={slug} />

      {/* 3. Sub-category Navigation Strip */}
      {subcategoryItems.length > 0 && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-3">
          <SubcategoryStrip
            categorySlug={slug}
            items={subcategoryItems}
            activeValue={sp.subCategory || ''}
            accentColor={category.accent}
          />
        </div>
      )}

      {/* 4. Sticky Quick Filter & Sort Bar */}
      <QuickFilterBar
        categorySlug={slug}
        totalProducts={total}
        hasReviews={true}
      />

      {/* 5. Main Product Listing Grid */}
      <div id="products-grid" className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 scroll-mt-20">
        {products.length === 0 ? (
          <div className="py-16 text-center border border-stone-200 bg-stone-50 p-8 rounded-sm">
            <h3 className="font-serif text-lg font-bold text-stone-900 m-0 mb-2">
              No matching products found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-5 leading-relaxed">
              We couldn&apos;t find any items matching your current filters. Try resetting your filters to explore our full collection.
            </p>
            <Link
              href={`/${slug}`}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xs no-underline transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load More Button & Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-colors no-underline shadow-xs"
              >
                Load more products
              </Link>
            )}

            <nav aria-label="Pagination" className="flex items-center gap-1.5 pt-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <Link
                    key={pageNumber}
                    href={buildPageUrl(pageNumber)}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center text-xs font-medium border rounded-xs transition-colors no-underline',
                      isCurrent
                        ? 'border-stone-900 bg-stone-900 text-white font-bold'
                        : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                    )}
                  >
                    {pageNumber}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* 6. Editorial Story, Care & Usage Rituals Section */}
      <CategoryEditorialStory slug={slug} />

      {/* 7. Persistent WhatsApp Assistance Button */}
      <FloatingWhatsApp categorySlug={slug} categoryName={category.name} />
    </>
  );
}
