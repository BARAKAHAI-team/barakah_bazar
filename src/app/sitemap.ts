import { MetadataRoute } from 'next';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/bridal`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/naturals`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/coconut-oil`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/policies/privacy`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${siteUrl}/policies/terms`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${siteUrl}/policies/returns`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${siteUrl}/policies/shipping`,
      lastModified: new Date('2026-10-12'),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = SEED_PRODUCTS.filter((p) => p.is_active).map((p) => ({
    url: `${siteUrl}/${p.category_slug}/${p.slug}`,
    lastModified: new Date('2026-10-12'),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
