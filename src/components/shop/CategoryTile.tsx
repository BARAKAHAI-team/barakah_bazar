'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export interface CategoryTileProps {
  slug: string;
  name: string;
  description: string;
  accent?: string;
  bgClass?: string;
  imageUrl?: string | null;
  tagline?: string | null;
}

interface CategoryConfig {
  badge: string;
  ctaText: string;
  pills: string[];
  heroImage: string;
  detailImage: string;
  detailLabel: string;
  ratingText: string;
  gradientBg: string;
  blendGradient: string;
  badgeStyle: string;
}

const CATEGORY_CUSTOMIZATIONS: Record<string, CategoryConfig> = {
  bridal: {
    badge: 'Royal Heritage Atelier',
    ctaText: 'Explore Bridal Edit',
    pills: ['Handcrafted Zari & Tilla', 'Festive Lehengas & Suits', 'Pan-India Insured Dispatch', 'Flat 31% Off'],
    heroImage: '/images/bridal/hero.jpeg',
    detailImage: '/images/bridal/bridal-01.jpeg',
    detailLabel: 'Bespoke Needlework & Silks',
    ratingText: '4.9 ★ Royal Couture',
    gradientBg: 'from-[#4D0D17] via-[#6E1423] to-[#36080E]',
    blendGradient: 'from-[#4D0D17]',
    badgeStyle: 'text-amber-200 border-amber-300/30 bg-amber-950/50 shadow-amber-950/40',
  },
  naturals: {
    badge: 'Artisanal Candles & Organics',
    ctaText: 'Explore Naturals Edit',
    pills: ['100% Pure Soy Wax', 'Hand-Poured Scented Candles', 'Alleppey Turmeric', 'Clean Smokeless Burn'],
    heroImage: '/images/naturals/home-hero-candles.jpg',
    detailImage: '/images/naturals/trio-rose-love.jpg',
    detailLabel: 'Botanical Aromatherapy',
    ratingText: '4.9 ★ Mindful Living',
    gradientBg: 'from-[#3B1522] via-[#5B1730] to-[#240A14]',
    blendGradient: 'from-[#3B1522]',
    badgeStyle: 'text-rose-200 border-rose-300/30 bg-rose-950/50 shadow-rose-950/40',
  },
  'coconut-oil': {
    badge: 'Traditional Cold-Pressed Heritage',
    ctaText: 'Shop Kerala Coconut Oil',
    pills: ['Sun-Dried Kerala Copra', 'Marachekku Wood Pressed', 'Unrefined & Pure', 'Hair, Skin & Cooking'],
    heroImage: '/images/oil/product-1.jpeg',
    detailImage: '/images/oil/product-2.jpeg',
    detailLabel: '100% Pure & Unrefined',
    ratingText: '5.0 ★ Heirloom Quality',
    gradientBg: 'from-[#0C2915] via-[#123B20] to-[#081C0E]',
    blendGradient: 'from-[#0C2915]',
    badgeStyle: 'text-emerald-200 border-emerald-300/30 bg-emerald-950/50 shadow-emerald-950/40',
  },
};

/**
 * Redesigned Luxury Hero Category Banner for Barakah Bazaar.
 * Features regal gradient depth, intricate decorative Indian motif watermarks,
 * high-resolution photography with smooth zoom, feature tags, and floating detail glass cards.
 */
export const CategoryTile: React.FC<CategoryTileProps> = ({
  slug,
  name,
  description,
  imageUrl,
}) => {
  const config = CATEGORY_CUSTOMIZATIONS[slug] || {
    badge: 'Barakah Collection',
    ctaText: 'Explore Collection',
    pills: ['Curated Essentials', 'Artisanal Quality', 'Heirloom Finish'],
    heroImage:
      imageUrl ||
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop',
    detailImage:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    detailLabel: 'Artisanal Craftsmanship',
    ratingText: 'Curated Collection',
    gradientBg: 'from-[#3A141A] via-[#541E28] to-[#220B10]',
    blendGradient: 'from-[#3A141A]',
    badgeStyle: 'text-amber-200 border-amber-300/30 bg-amber-950/50',
  };

  const heroImgSrc = imageUrl || config.heroImage;
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleClick = () => {
    // Set 1-year cookie bz_category for active navigation state
    document.cookie = `bz_category=${slug}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <Link
      href={`/${slug}`}
      onClick={handleClick}
      className="group relative block w-full rounded-2xl overflow-hidden no-underline text-white transition-all duration-500 shadow-xl hover:shadow-2xl border border-white/10 hover:border-white/25"
    >
      <div
        className={clsx(
          'relative w-full bg-gradient-to-br',
          config.gradientBg
        )}
      >
        {/* Subtle Indian Geometric / Jali Lattice Watermark Pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.09] transition-opacity duration-700 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M30 30L15 15H0v15l15 15 15-15zm0 0l15 15h15V30l-15-15-15 15zm0-30l15 15 15-15H30zm0 60l15-15 15 15H30zM0 0h15L0 15V0zm60 0h-15l15 15V0zM0 60h15L0 45v15zm60 0h-15l15-15v15z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Warm Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[460px] lg:min-h-[500px]">
          {/* Left Panel: Curated Editorial Story (7 columns on desktop) */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between">
            <div>
              {/* Badge Pill */}
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <span
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md border shadow-sm',
                    config.badgeStyle
                  )}
                >
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  {config.badge}
                </span>
                <span className="hidden sm:inline-block text-xs text-white/50 font-light tracking-widest uppercase">
                  Barakah Bazaar
                </span>
              </div>

              {/* Category Title */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.12] tracking-tight text-white m-0 drop-shadow-sm">
                {name}
              </h2>

              {/* Decorative Gold Accent Hairline */}
              <div className="w-16 h-[2px] bg-gradient-to-r from-amber-400 via-amber-200 to-transparent mt-3.5 mb-4" />

              {/* Rich Description */}
              <p className="text-sm sm:text-base leading-relaxed text-stone-200/90 max-w-xl mb-6 font-normal">
                {description}
              </p>

              {/* Curated Feature Chips / Highlights */}
              <div className="flex flex-wrap gap-2 mb-8">
                {config.pills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mr-2" />
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/15">
              <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-stone-900 font-semibold text-xs uppercase tracking-wider shadow-lg group-hover:bg-amber-50 group-hover:shadow-amber-500/10 group-hover:shadow-2xl transition-all duration-300">
                {config.ctaText}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-amber-700" />
              </span>

              <span className="text-xs text-white/70 font-medium tracking-wide flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {config.ratingText}
              </span>
            </div>
          </div>

          {/* Right Panel: Breathtaking Visual Showcase Frame (5 columns on desktop) */}
          <div className="lg:col-span-5 relative w-full h-[320px] sm:h-[380px] lg:h-full min-h-[340px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-white/15">
            {/* The Main Hero Photograph */}
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={heroImgSrc}
                alt={name}
                fill
                priority={slug === 'bridal'}
                sizes="(max-width: 1024px) 100vw, 45vw"
                onLoad={() => setImageLoaded(true)}
                className={clsx(
                  'object-cover object-center transition-all duration-700 ease-out group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-80'
                )}
              />

              {/* Inner Gradient Blend Overlays */}
              <div
                className={clsx(
                  'hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent pointer-events-none z-10',
                  config.blendGradient
                )}
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-10" />

              {/* Top Right Luxury Badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold tracking-wide shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Curated 2026 Edit
                </span>
              </div>

              {/* Floating Craftsmanship Detail Card (Bottom Left of photo) */}
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="bg-black/55 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3.5 shadow-2xl transition-transform duration-300 group-hover:translate-y-[-2px]">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/30 shadow">
                    <Image
                      src={config.detailImage}
                      alt={config.detailLabel}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-0.5">
                      Artisan Spotlight
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {config.detailLabel}
                    </div>
                    <div className="text-[11px] text-white/70 truncate">
                      Authentic Indian heritage creation
                    </div>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-amber-400 group-hover:text-stone-900 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
