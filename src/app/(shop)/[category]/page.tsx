import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { getCategoryBySlug, listCategoryProducts } from '@/lib/catalog/data';
import { ProductCard } from '@/components/shop/ProductCard';
import { FilterDrawer } from '@/components/shop/FilterDrawer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SITE_CLAIMS } from '@/lib/site-claims';

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
    sort?: 'newest' | 'price_asc' | 'price_desc';
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return {};

  return {
    title: cat.seo_title || cat.name,
    description: cat.seo_description || cat.description || undefined,
    alternates: {
      canonical: `/${cat.slug}`,
    },
    openGraph: {
      title: cat.seo_title || cat.name,
      description: cat.seo_description || cat.description || undefined,
    },
  };
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

  const isBridal = slug === 'bridal';

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Breadcrumbs items={[{ label: category.name }]} />

        {/* Plain Page Header: H1, one-line description, 1px hairline below. No card, no container background */}
        <header className="mt-4 pb-5 border-b border-[var(--line)]">
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] font-bold m-0 leading-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-sm text-[var(--ink-muted)] max-w-2xl mt-2 mb-0 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Render site claims only if client provides them in config */}
          {SITE_CLAIMS.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-[var(--ink-muted)]">
              {SITE_CLAIMS.map((claim) => (
                <span
                  key={claim.id}
                  className="px-2 py-0.5 border border-[var(--line)] rounded-[2px]"
                >
                  {claim.label}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Filter and Sort Bar */}
        <FilterDrawer categorySlug={slug} totalProducts={total} />

        {/* Product Grid */}
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
          <div
            className={clsx(
              'grid gap-4 sm:gap-6',
              isBridal
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isCurrent = pageNumber === currentPage;
              return (
                <Link
                  key={pageNumber}
                  href={`/${slug}?page=${pageNumber}`}
                  className={clsx(
                    'w-9 h-9 flex items-center justify-center text-xs font-medium border rounded-[2px] transition-colors',
                    isCurrent
                      ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]'
                  )}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}
