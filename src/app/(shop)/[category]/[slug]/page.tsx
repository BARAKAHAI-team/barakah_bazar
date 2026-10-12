import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductBySlug, getProductReviews } from '@/lib/catalog/data';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: catSlug, slug } = await params;
  const product = await getProductBySlug(catSlug, slug);
  if (!product) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${siteUrl}/${catSlug}/${slug}`;

  return {
    title: product.name,
    description: product.short_description || product.description || undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: product.name,
      description: product.short_description || product.description || undefined,
      url,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { category: catSlug, slug } = await params;

  const validCategories = ['bridal', 'naturals', 'coconut-oil'];
  if (!validCategories.includes(catSlug)) {
    notFound();
  }

  const category = await getCategoryBySlug(catSlug);
  const product = await getProductBySlug(catSlug, slug);

  if (!category || !product) {
    notFound();
  }

  const reviews = await getProductReviews(product.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/${catSlug}/${slug}`;
  const primaryVariant = product.variants[0];

  // Product JSON-LD per CONTEXT.md section 13
  const productJsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    sku: primaryVariant.sku,
    brand: {
      '@type': 'Brand',
      name: 'Barakah',
    },
    offers: {
      '@type': 'Offer',
      price: (primaryVariant.price_paise / 100).toFixed(2),
      priceCurrency: 'INR',
      availability:
        primaryVariant.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
    },
  };

  // Only include aggregateRating if reviews actually exist per CONTEXT.md 13
  if (product.rating && product.rating.review_count > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.avg_rating.toString(),
      reviewCount: product.rating.review_count.toString(),
    };
  }

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
        item: `${siteUrl}/${catSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: category.name, href: `/${catSlug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-4">
          <ProductDetailClient product={product} initialReviews={reviews} />
        </div>
      </div>
    </>
  );
}
