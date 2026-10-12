import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/wishlist',
        '/checkout',
        '/orders',
        '/account',
        '/login',
        '/api',
        '/styleguide',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
