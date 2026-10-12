import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { getCategoryBySlug, listCategoryProducts } from '@/lib/catalog/data';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';
import { ProductCard } from '@/components/shop/ProductCard';
import { SubcategoryStrip, SubcategoryItem } from '@/components/shop/SubcategoryStrip';
import { QuickFilterBar } from '@/components/shop/QuickFilterBar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

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
  const sp = await searchParams;
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
      { name: 'Lehengas & Sarees', value: 'Lehengas & Sarees' },
      { name: 'Bridal Abayas & Kaftans', value: 'Bridal Abayas & Kaftans' },
      { name: 'Ghararas & Shararas', value: 'Ghararas & Shararas' },
      { name: 'Choker & Necklace Sets', value: 'Choker & Necklace Sets' },
      { name: 'Rings & Angoothi', value: 'Rings & Angoothi' },
      { name: 'Bracelets & Haathphool', value: 'Bracelets & Haathphool' },
      { name: 'Temple Jewellery', value: 'Temple Jewellery' },
    ];
  }

  if (slug === 'naturals') {
    return [
      { name: 'All Naturals', value: '' },
      { name: 'Farm Spices', value: 'Farm Spices' },
      { name: 'Turmeric & Pepper', value: 'Turmeric & Pepper' },
      { name: 'Aromatic Cardamom', value: 'Aromatic Cardamom' },
      { name: 'Kashmir Saffron', value: 'Kashmir Saffron' },
    ];
  }

  if (slug === 'coconut-oil') {
    return [
      { name: 'All Oils', value: '' },
      { name: 'Cold-Pressed', value: 'Cold-Pressed' },
      { name: 'Roasted Uruli', value: 'Roasted Uruli' },
      { name: 'Wood-Pressed', value: 'Wood-Pressed' },
      { name: 'Ayurvedic Hair Oil', value: 'Ayurvedic Hair Oil' },
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

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Breadcrumbs items={[{ label: category.name }]} />

        {/* Page Header: H1, one-line description, 1px hairline below */}
        <header className="mt-3 pb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-bridal)] block mb-1">
            Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] font-bold m-0 leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-[var(--ink-muted)] max-w-2xl mt-1.5 mb-0 leading-relaxed">
              {category.description}
            </p>
          )}
        </header>

        {/* Indian e-commerce "Shop by Type" Sub-category Image Strip */}
        {subcategoryItems.length > 0 && (
          <SubcategoryStrip
            categorySlug={slug}
            items={subcategoryItems}
            activeValue={sp.subCategory || ''}
            accentColor={category.accent}
          />
        )}
      </div>

      {/* Sticky Quick Filter & Sort Bar */}
      <QuickFilterBar
        categorySlug={slug}
        totalProducts={total}
        hasReviews={true}
      />

      {/* Main Listing Grid Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
        {products.length === 0 ? (
          <div className="py-16 text-center border border-[var(--line)] bg-[var(--surface)] p-8 rounded-[2px]">
            <p className="text-sm text-[var(--ink-muted)] mb-4">
              No products found matching the selected filters.
            </p>
            <Link
              href={`/${slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] underline"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          /* Dense Indian e-commerce Grid: 4 cols at 1280px, 3 at 1024px, 2 on tablet/mobile */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load More Button & Pagination (SEO-crawlable) */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-8 py-3 bg-[var(--ink)] hover:bg-[var(--accent-bridal)] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors no-underline"
              >
                Load more products
              </Link>
            )}

            {/* Standard Accessible Page Links */}
            <nav aria-label="Pagination" className="flex items-center gap-1.5 pt-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                const isCurrent = pageNumber === currentPage;
                return (
                  <Link
                    key={pageNumber}
                    href={buildPageUrl(pageNumber)}
                    className={clsx(
                      'w-8 h-8 flex items-center justify-center text-xs font-medium border rounded-[2px] transition-colors no-underline',
                      isCurrent
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-white font-semibold'
                        : 'border-[var(--line)] bg-white text-[var(--ink)] hover:border-gray-500'
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
    </>
  );
}
