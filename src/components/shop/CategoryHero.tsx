import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CategoryHeroProps {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  imageUrl?: string | null;
  totalProducts: number;
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({
  slug,
  name,
  tagline,
  description,
  imageUrl,
  totalProducts,
}) => {
  const categoryConfig: Record<
    string,
    {
      heroHeadline: string;
      highlightWord: string;
      secondaryHeadline: string;
      badgeText: string;
      objectPosition: string;
      aspectRatio: string;
    }
  > = {
    bridal: {
      heroHeadline: 'Timeless Grace.',
      highlightWord: 'Royal',
      secondaryHeadline: 'Celebration Ensembles.',
      badgeText: 'Festive Offer: Flat 31% Off All Designs',
      objectPosition: 'object-[center_top]',
      aspectRatio: 'aspect-[3/4]',
    },
    'coconut-oil': {
      heroHeadline: 'The Spirit of Kerala.',
      highlightWord: 'Pure',
      secondaryHeadline: 'For Your Family & Home.',
      badgeText: 'Cold-Pressed • Unrefined • FSSAI Certified',
      objectPosition: 'object-center',
      aspectRatio: 'aspect-[4/5]',
    },
    naturals: {
      heroHeadline: 'Light, Scent & Peace.',
      highlightWord: 'Blessings',
      secondaryHeadline: 'For Mindful Spaces.',
      badgeText: '100% Pure Soy Wax • Hand-Poured • Artisanal Aromas',
      objectPosition: 'object-center',
      aspectRatio: 'aspect-[4/5]',
    },
  };

  const config = categoryConfig[slug] || categoryConfig['bridal'];
  const heroImageSrc = imageUrl || '/images/bridal/hero.jpeg';

  return (
    <section className="relative bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EE] to-[#FFFDF8] border-b border-[#EADFC8] overflow-hidden">
      {/* Decorative arch silhouettes from reference site */}
      <div className="absolute right-4 bottom-4 w-32 h-32 border border-[#C89B3C]/35 rounded-t-[64px] rounded-b-none pointer-events-none hidden lg:block opacity-50">
        <div className="absolute inset-2 border border-[#C89B3C]/20 rounded-t-[56px]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 md:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Refined Editorial Typography & Info */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] leading-[1.12] text-[#16140F] font-normal tracking-tight m-0">
              {config.heroHeadline}{' '}
              <span className="italic font-normal text-[#C89B3C] underline decoration-[#C89B3C]/40 decoration-1 underline-offset-6">
                {config.highlightWord}
              </span>{' '}
              {config.secondaryHeadline}
            </h1>

            <p className="text-sm sm:text-base text-[#524D44] max-w-xl leading-relaxed m-0 font-normal">
              {description || tagline}
            </p>

            {/* Actions: Clean Browse CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#products-grid"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#9F7627] to-[#C89B3C] hover:from-[#8A651F] hover:to-[#B3882F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-[3px] shadow-sm hover:shadow-md transition-all no-underline"
              >
                <span>Explore Collection ({totalProducts})</span>
                <ArrowRight size={13} />
              </a>

              <span className="text-xs text-[#78716C] font-semibold tracking-wide">
                {config.badgeText}
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with PROPER PORTRAIT RATIO in Arch Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Outer decorative arch ring */}
            <div className="absolute -inset-2.5 rounded-t-[110px] rounded-b-2xl border border-[#C89B3C]/35 -z-10 translate-x-1 translate-y-1 pointer-events-none" />

            <div className={`relative w-full max-w-[380px] sm:max-w-[400px] ${config.aspectRatio} overflow-hidden rounded-t-[96px] rounded-b-xl bg-[#FAF6EE] shadow-lg border border-[#EADFC8]`}>
              <Image
                src={heroImageSrc}
                alt={name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 400px"
                className={`object-cover ${config.objectPosition} transition-transform duration-700 hover:scale-102`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow-sm">
                <span className="text-xs font-serif italic tracking-wide text-white">
                  {name}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-xs border border-white/20">
                  Verified Collection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
