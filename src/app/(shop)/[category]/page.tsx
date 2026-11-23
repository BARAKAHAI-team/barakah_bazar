import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, listCategoryProducts } from '@/lib/catalog/data';
import { BridalClientPage } from '@/components/shop/BridalClientPage';
import { NaturalsClientPage } from '@/components/shop/NaturalsClientPage';
import { CoconutOilClientPage } from '@/components/shop/CoconutOilClientPage';
import { DynamicCategoryClientPage } from '@/components/shop/DynamicCategoryClientPage';

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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
  const canonicalUrl = `${siteUrl}/${cat.slug}`;

  return {
    title: cat.seo_title || `${cat.name} | BarakahBazar`,
    description: cat.seo_description || cat.description || undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cat.seo_title || `${cat.name} | BarakahBazar`,
      description: cat.seo_description || cat.description || undefined,
      url: canonicalUrl,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { products } = await listCategoryProducts({
    categorySlug: slug,
    limit: 50,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://barakahbazar.com';
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
      {slug === 'bridal' ? (
        <BridalClientPage initialProducts={products} />
      ) : slug === 'naturals' ? (
        <NaturalsClientPage initialProducts={products} />
      ) : slug === 'coconut-oil' ? (
        <CoconutOilClientPage initialProducts={products} />
      ) : (
        <DynamicCategoryClientPage category={category} initialProducts={products} />
      )}
    </>
  );
}
