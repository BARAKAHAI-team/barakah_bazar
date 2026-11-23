import type { Metadata } from 'next';
import { listCategoryProducts } from '@/lib/catalog/data';
import { NaturalsClientPage } from '@/components/shop/NaturalsClientPage';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const canonicalUrl = `${siteUrl}/naturals`;

  return {
    title: 'Barakah Naturals — Botanical Soy Candles & Single-Origin Spices | BarakahBazar',
    description:
      'Explore hand-poured 100% soy wax sculptural candles and authentic single-origin Malabar spices harvested for pure aroma, holistic wellness, and elevated living.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Barakah Naturals — Botanical Soy Candles & Single-Origin Spices | BarakahBazar',
      description:
        'Hand-poured 100% natural soy wax sculptural candles and single-origin Malabar spices from BarakahBazar.',
      url: canonicalUrl,
      images: [
        {
          url: `${siteUrl}/images/home/products/candle_rose_a.jpg`,
          width: 1200,
          height: 630,
          alt: 'Barakah Naturals Botanical Candle',
        },
      ],
    },
  };
}

export default async function NaturalsPage() {
  const { products } = await listCategoryProducts({
    categorySlug: 'naturals',
    limit: 50,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Barakah Naturals Collection',
    description:
      'Artisanal scented soy wax candles and single-origin Malabar spices.',
    url: `${siteUrl}/naturals`,
    breadcrumb: {
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
          name: 'Barakah Naturals',
          item: `${siteUrl}/naturals`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NaturalsClientPage initialProducts={products} />
    </>
  );
}
