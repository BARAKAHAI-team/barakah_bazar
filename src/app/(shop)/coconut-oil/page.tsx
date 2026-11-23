import type { Metadata } from 'next';
import { listCategoryProducts } from '@/lib/catalog/data';
import { CoconutOilClientPage } from '@/components/shop/CoconutOilClientPage';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const canonicalUrl = `${siteUrl}/coconut-oil`;

  return {
    title: 'Kerala Pure Coconut Oil — Cold-Pressed | BarakahBazar',
    description:
      'Pure Kerala cold-pressed coconut oil, roasted uruli oil, and Ayurvedic hair revitalizers. 100% natural and unrefined.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Kerala Pure Coconut Oil — Cold-Pressed | BarakahBazar',
      description:
        'Authentic Kerala cold-pressed coconut oil. 100% natural and unrefined from BarakahBazar.',
      url: canonicalUrl,
      images: [
        {
          url: `${siteUrl}/images/home/products/oil_500ml_a.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kerala Pure Coconut Oil Glass Bottle',
        },
      ],
    },
  };
}

export default async function CoconutOilPage() {
  const { products } = await listCategoryProducts({
    categorySlug: 'coconut-oil',
    limit: 20,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Kerala Pure Coconut Oil Collection',
    description:
      'Traditional cold-pressed coconut oil, roasted uruli oil, and Ayurvedic hair revitalizers from Kerala.',
    url: `${siteUrl}/coconut-oil`,
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
          name: 'Kerala Pure Coconut Oil',
          item: `${siteUrl}/coconut-oil`,
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
      <CoconutOilClientPage initialProducts={products} />
    </>
  );
}
