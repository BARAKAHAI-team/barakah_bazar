import type { Metadata } from 'next';
import { listCategoryProducts } from '@/lib/catalog/data';
import { BridalClientPage } from '@/components/shop/BridalClientPage';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const canonicalUrl = `${siteUrl}/bridal`;

  return {
    title: 'Barakah Bridal Ensembles — Handcrafted Wedding Couture | BarakahBazar',
    description:
      'Explore bespoke bridal lehengas, festive suits, and heirloom wedding attire handcrafted with pure fabrics, intricate embroidery, and regal Indian silhouettes.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'Barakah Bridal Ensembles — Handcrafted Wedding Couture | BarakahBazar',
      description:
        'Bespoke bridal lehengas, festive suits, and heirloom wedding couture from BarakahBazar.',
      url: canonicalUrl,
      images: [
        {
          url: `${siteUrl}/images/home/products/bridal_suit_a.jpg`,
          width: 1200,
          height: 630,
          alt: 'Barakah Bridal Couture Ensemble',
        },
      ],
    },
  };
}

export default async function BridalPage() {
  const { products } = await listCategoryProducts({
    categorySlug: 'bridal',
    limit: 50,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Barakah Bridal Ensembles Collection',
    description:
      'Handcrafted bridal lehengas, festive suits, and heirloom occasion ensembles.',
    url: `${siteUrl}/bridal`,
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
          name: 'Bridal Ensembles',
          item: `${siteUrl}/bridal`,
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
      <BridalClientPage initialProducts={products} />
    </>
  );
}
