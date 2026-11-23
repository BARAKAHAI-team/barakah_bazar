import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { getAllCategories } from '@/lib/catalog/data';
import { cleanCategoryName } from '@/lib/catalog/utils';
import { getHeroSettings } from '@/lib/hero/hero-store';
import { OneShoppingJourneySection } from '@/components/shop/OneShoppingJourneySection';
import { FeaturedProductsSection } from '@/components/shop/FeaturedProductsSection';
import { WhyBarakahSection } from '@/components/shop/WhyBarakahSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'BarakahBazaar — A More Blessed Tomorrow',
  description:
    'BarakahBazaar — Kerala Pure Coconut Oil, Bridal Collection and Barakah Naturals in one elegant marketplace.',
};

export default async function LandingPage() {
  const [categories, hero] = await Promise.all([
    getAllCategories(true),
    getHeroSettings(),
  ]);

  // Dynamic responsive grid scaling matching user rules:
  // - 1 category: single centered card
  // - 2 categories: 2 columns
  // - 3 categories: 3 columns (1 row of 3)
  // - 4 categories: 4 columns (1 row of 4)
  // - 6 categories: 3 columns (2 rows of 3)
  // - 5, 7+ categories: max 4 columns (lg:grid-cols-4 or lg:grid-cols-3)
  const gridColsClass =
    categories.length === 1
      ? 'grid-cols-1 max-w-md mx-auto'
      : categories.length === 2
      ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
      : categories.length === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : categories.length === 6
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : categories.length >= 7
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className="bg-white text-[#211e18] overflow-x-hidden">
      {/* 1. HERO SECTION: Clean Pure White Luxury Editorial Split Hero */}
      <section id="home" className="relative min-h-[600px] lg:min-h-[660px] flex items-center overflow-hidden bg-white border-b border-[#eee5d4]/60">
        <div className="relative w-[min(1240px,92%)] mx-auto py-12 sm:py-16 lg:py-20 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Narrative, Typography & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Authentic Tagline Eyebrow */}
              {hero.eyebrow && (
                <span className="text-[11px] font-bold tracking-[3px] text-[#b98725] uppercase mb-3 block animate-fade-in-up">
                  {hero.eyebrow}
                </span>
              )}

              {/* Main Headline */}
              <h1 className="font-serif text-[clamp(40px,5.5vw,76px)] leading-[1.02] text-[#2c2214] font-semibold tracking-tight mb-5 animate-fade-in-up delay-100">
                {hero.headlineMain}
                <br />
                {hero.headlinePrefix ? `${hero.headlinePrefix} ` : ''}
                <span className="italic font-normal text-[#b98725]">{hero.headlineAccent}</span>
              </h1>

              {/* Dynamic Categories Banner (Toggleable) */}
              {hero.showCategoryPills !== false && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-[12px] font-bold tracking-[1.5px] uppercase text-[#756b58] mb-5 animate-fade-in-up delay-200">
                  {categories.map((c, idx) => (
                    <span key={c.id || c.slug} className="inline-flex items-center gap-x-2.5">
                      {idx > 0 && <span className="text-[#b98725]">&bull;</span>}
                      <span className="text-[#3a2f20]">{cleanCategoryName(c.name)}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="max-w-[540px] text-[#635746] text-[15px] sm:text-[17px] leading-[1.75] font-normal mb-8 animate-fade-in-up delay-300">
                {hero.description}
              </p>

              {/* Call to Action Button */}
              <div className="animate-fade-in-up delay-400">
                <a
                  href={hero.ctaLink || '#collections'}
                  className="inline-flex items-center justify-center gap-3 bg-[#b98725] hover:bg-[#a6771d] text-white px-7 py-4 rounded-[4px] text-[11px] font-black tracking-[1.5px] shadow-[0_8px_24px_rgba(185,135,37,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(185,135,37,0.3)] no-underline uppercase group"
                >
                  <span>{hero.ctaText || 'EXPLORE OUR COLLECTIONS'}</span>
                  <span className="text-sm font-bold transition-transform group-hover:translate-x-1">&rarr;</span>
                </a>
              </div>
            </div>

            {/* Right Column: Editorial Visual Showcase with Ambient Floating Glow */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0 animate-reveal">
              {/* Warm Golden Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#b98725]/25 via-[#f2deab]/30 to-transparent rounded-[32px] blur-2xl pointer-events-none animate-glow-pulse" />

              {/* Main Decorative Showcase Frame with Subtle Floating Motion */}
              <div className="relative mx-auto max-w-[440px] rounded-[18px] sm:rounded-[22px] p-2.5 sm:p-3 bg-white/90 backdrop-blur-xs border border-[#e8dcc2] shadow-[0_20px_50px_rgba(75,56,20,0.12)] animate-float">
                <div className="relative h-[430px] sm:h-[490px] rounded-[14px] sm:rounded-[18px] overflow-hidden bg-[#f7f3ea]">
                  <img
                    src={hero.imageUrl || '/images/home/barakah_hero_new.jpg'}
                    alt={hero.imageAlt || 'BarakahBazar Collections'}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. OUR COLLECTIONS: Compact 1-Screen View Showcase */}
      <section id="collections" className="py-8 sm:py-10 lg:py-12 bg-[#FAF7F2] relative border-b border-[#EADFC8]/60 overflow-hidden">
        {/* Subtle decorative background texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage: 'radial-gradient(rgba(185,135,37,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="w-[min(1240px,92%)] mx-auto relative z-10">
          {/* Section Header - Compact */}
          <div className="text-center max-w-[620px] mx-auto mb-6 sm:mb-8">
            <span className="text-[10px] font-bold tracking-[2.5px] text-[#b98725] uppercase mb-1.5 block">
              OUR SIGNATURE WORLDS
            </span>
            <h2 className="font-serif text-[28px] sm:text-[36px] font-bold text-[#2c2214] tracking-tight mb-2">
              Curated Collections
            </h2>
            <p className="text-[#685c4a] text-[13px] sm:text-[14px] leading-relaxed m-0">
              {categories.length === 3
                ? 'Three distinct pillars of purity, timeless elegance, and artisanal living — crafted with authentic devotion and barakah.'
                : 'Distinct pillars of purity, timeless elegance, and artisanal living — crafted with authentic devotion and barakah.'}
            </p>
          </div>

          {/* Dynamic Category Cards - Scaled dynamically based on count */}
          <div className={clsx('grid gap-5 lg:gap-6', gridColsClass)}>
            {categories.map((cat) => {
              const cleanName = cleanCategoryName(cat.name);
              const fallbackImg =
                cat.slug === 'bridal'
                  ? '/images/home/category_bridal.jpg'
                  : cat.slug === 'coconut-oil'
                  ? '/images/home/category_coconut_oil.jpg'
                  : '/images/home/category_naturals.jpg';
              const imgUrl = cat.imageUrl || fallbackImg;
              const eyebrowText =
                cat.eyebrow ||
                (cat.slug === 'bridal'
                  ? 'FESTIVE & CEREMONIAL'
                  : cat.slug === 'coconut-oil'
                  ? 'HERITAGE OIL'
                  : 'SOY CANDLES & LIVING');
              const descriptionText =
                cat.description ||
                cat.tagline ||
                'Curated with authentic devotion, timeless heritage, and pure barakah.';

              return (
                <article
                  key={cat.id || cat.slug}
                  className="group relative bg-white rounded-xl overflow-hidden border border-[#EADFC8]/80 shadow-[0_8px_25px_rgba(75,56,20,0.05)] hover:shadow-[0_16px_40px_rgba(75,56,20,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Frame */}
                  <div className="relative h-[200px] sm:h-[220px] lg:h-[230px] overflow-hidden bg-[#f4eee3]">
                    <img
                      src={imgUrl}
                      alt={cleanName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
                    <div>
                      <span className="text-[9px] font-bold tracking-[1.8px] text-[#b98725] uppercase block mb-1">
                        {eyebrowText}
                      </span>
                      <h3 className="font-serif font-bold text-[18px] sm:text-[20px] text-[#2c2214] mb-1.5 leading-snug">
                        {cleanName}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] text-[#6d614f] leading-relaxed mb-4 line-clamp-3">
                        {descriptionText}
                      </p>
                    </div>

                    <div>
                      <Link
                        href={`/${cat.slug}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[1.4px] uppercase text-[#b98725] hover:text-[#8e6618] transition-colors no-underline group/link"
                      >
                        <span>EXPLORE COLLECTION</span>
                        <span className="text-sm transition-transform group-hover/link:translate-x-1">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ONE BARAKAH SHOPPING JOURNEY: Unified Cart, Address & Payment */}
      <OneShoppingJourneySection />

      {/* 4. FEATURED PRODUCTS: 2 Rows of High-End Boutique Product Cards */}
      <FeaturedProductsSection />

      {/* 5. WHY BARAKAH BAZAR: Heritage, Craftsmanship & Values */}
      <WhyBarakahSection />
    </div>
  );
}
