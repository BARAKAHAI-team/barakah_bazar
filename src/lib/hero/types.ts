export interface HeroSettings {
  eyebrow: string;
  headlineMain: string;
  headlinePrefix: string;
  headlineAccent: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  imageAlt: string;
  showCategoryPills: boolean;
  updatedAt: string;
}

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  eyebrow: 'A MORE BLESSED TOMORROW',
  headlineMain: 'EVERYTHING',
  headlinePrefix: 'WITH',
  headlineAccent: 'BARAKAH',
  description:
    'Bringing together authentic Kerala cold-pressed coconut oil, timeless bridal elegance, and handcrafted scented candles — curated for your home, your celebrations, and everyday living.',
  ctaText: 'EXPLORE OUR COLLECTIONS',
  ctaLink: '#collections',
  imageUrl: '/images/home/barakah_hero_new.jpg',
  imageAlt: 'BarakahBazar Collections',
  showCategoryPills: true,
  updatedAt: new Date().toISOString(),
};
