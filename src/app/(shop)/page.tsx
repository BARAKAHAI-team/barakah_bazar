import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Headphones,
  ArrowRight,
  MessageCircle,
  Award,
} from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import { FloatingWhatsApp } from '@/components/shop/FloatingWhatsApp';
import { SEED_PRODUCTS } from '@/lib/catalog/seed-data';

export const metadata: Metadata = {
  title: 'Barakah Bazaar | Goodness • Elegance • Blessings',
  description:
    'One curated marketplace for authentic Kerala pure coconut oil, royal bridal couture, and handcrafted natural candles.',
};

export default function LandingPage() {
  // Handpicked cross-collection featured products
  const featuredProducts = [
    // Kerala Pure Coconut Oil
    SEED_PRODUCTS.find((p) => p.slug === 'kerala-pure-coconut-oil-300ml') || SEED_PRODUCTS[21],
    SEED_PRODUCTS.find((p) => p.slug === 'kerala-pure-coconut-oil-500ml') || SEED_PRODUCTS[22],
    // Barakah Naturals candles
    SEED_PRODUCTS.find((p) => p.slug === 'trio-rose-love-candles') || SEED_PRODUCTS[15],
    SEED_PRODUCTS.find((p) => p.slug === 'luxe-bubble-glow-candle') || SEED_PRODUCTS[16],
    SEED_PRODUCTS.find((p) => p.slug === 'blooming-bouquet-luxe-candle') || SEED_PRODUCTS[17],
    // Bridal Couture
    SEED_PRODUCTS.find((p) => p.slug === 'emerald-zari-bridal-suit') || SEED_PRODUCTS[0],
    SEED_PRODUCTS.find((p) => p.slug === 'aqua-blue-bridal-lehenga') || SEED_PRODUCTS[2],
    SEED_PRODUCTS.find((p) => p.slug === 'rose-pink-bridal-lehenga') || SEED_PRODUCTS[3],
  ].filter(Boolean);

  const collections = [
    {
      slug: 'coconut-oil',
      href: '/coconut-oil',
      name: 'Kerala Pure Coconut Oil',
      categorySubtitle: '100% PURE • NATURAL • AUTHENTIC',
      tagline: 'Traditional Cold-Pressed Goodness',
      description: 'Single-origin unrefined coconut oil extracted from sun-dried Kerala copra for hair, skin, and wholesome culinary use.',
      image: '/images/home/oil/image-4.jpeg',
      objectPosition: 'object-center',
      badge: 'From ₹149',
      badgeClass: 'bg-[#123B20] text-white',
      pill: 'Marachekku Wood Pressed',
    },
    {
      slug: 'bridal',
      href: '/bridal',
      name: 'Bridal Collection',
      categorySubtitle: 'ELEGANCE FOR YOUR SPECIAL MOMENTS',
      tagline: 'Timeless • Graceful • Celebration',
      description: 'Handcrafted bridal lehengas, festive palazzo suits, and heirloom ensembles embellished with intricate zari needlework.',
      image: '/images/home/bridal/image-6.jpeg',
      objectPosition: 'object-[center_top]', // Crucial: Keeps model head and face 100% visible!
      badge: 'Flat 31% Off',
      badgeClass: 'bg-[#A51F22] text-white',
      pill: 'Handcrafted Zari & Silks',
    },
    {
      slug: 'naturals',
      href: '/naturals',
      name: 'Barakah Naturals',
      categorySubtitle: 'LIGHT • SCENT • GIFTING',
      tagline: 'Candles for a Calmer, Brighter You',
      description: 'Hand-poured 100% soy wax candles infused with therapeutic Damask rose, oud, and sandalwood for mindful sanctuaries.',
      image: '/images/home/barakah/image-5.png',
      objectPosition: 'object-center',
      badge: 'From ₹499',
      badgeClass: 'bg-[#5B1730] text-white',
      pill: '100% Pure Soy Wax',
    },
  ];

  return (
    <div className="bg-[#FFFDF9] text-[#1C1917] overflow-x-hidden">
      {/* 1. HERO SECTION: Royal Arabian Ivory & Gold Split Hero with Arch Frame */}
      <section id="home" className="relative border-b border-[#EADFC8] bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EE] to-[#FFFDF8] py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Subtle ambient Arabian arch watermark & decorative corner arches */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 20%, rgba(200, 155, 60, 0.15), transparent 45%), radial-gradient(circle at 10% 80%, rgba(165, 31, 34, 0.06), transparent 50%)',
          }}
        />

        {/* Decorative Arabian arch silhouettes from reference site */}
        <div className="absolute right-6 bottom-6 w-36 h-36 border border-[#C89B3C]/40 rounded-t-[72px] rounded-b-none pointer-events-none hidden lg:block opacity-60">
          <div className="absolute inset-2.5 border border-[#C89B3C]/25 rounded-t-[60px]" />
        </div>
        <div className="absolute left-6 top-8 w-24 h-24 border border-[#C89B3C]/30 rounded-t-[48px] rounded-b-none pointer-events-none hidden xl:block opacity-40">
          <div className="absolute inset-2 border border-[#C89B3C]/20 rounded-t-[40px]" />
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Prestigious Editorial Copy & Clean Hero CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[58px] leading-[1.08] text-[#16140F] font-normal tracking-tight m-0">
                EVERYTHING <br />
                WITH <span className="italic text-[#C89B3C] underline decoration-[#C89B3C]/40 underline-offset-8">BARAKAH</span>
              </h1>

              <p className="font-serif text-xs sm:text-[13px] tracking-[0.18em] uppercase text-[#625D53] font-semibold m-0">
                KERALA PURE &bull; BRIDAL COLLECTION &bull; BARAKAH NATURALS
              </p>

              <p className="text-sm sm:text-base text-[#524D44] max-w-xl leading-relaxed m-0 font-normal">
                Discover Barakah Bazaar — an exclusive marketplace uniting bespoke royal bridal couture, single-origin cold-pressed Kerala coconut oil, and artisanal therapeutic soy candles into one refined journey.
              </p>

              {/* Action Button: Signature Gold Gradient */}
              <div className="pt-2">
                <a
                  href="#collections"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#9F7627] to-[#C89B3C] hover:from-[#8A651F] hover:to-[#B3882F] text-white text-xs font-bold uppercase tracking-[0.16em] rounded-xs shadow-md hover:shadow-lg transition-all duration-200 no-underline"
                >
                  <span>Explore Our Collections</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Right Column: Bespoke Hero Visual in Decorative Arch Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              {/* Outer decorative arch outline */}
              <div className="absolute -inset-3 rounded-t-[105px] rounded-b-2xl border border-[#C89B3C]/35 -z-10 translate-x-1.5 translate-y-1.5 pointer-events-none" />

              <div className="relative aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-t-[90px] rounded-b-xl border border-[#EADFC8] shadow-xl bg-stone-100">
                <Image
                  src="/images/home/barakah_luxury_hero.jpg"
                  alt="Barakah Bazaar Luxury Ambiance — Pure Oil, Royal Silk & Scented Candles"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover object-center transition-transform duration-700 hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                  <div>
                    <p className="font-serif italic text-sm m-0 text-white">The Barakah Marketplace</p>
                    <p className="text-[11px] text-stone-200 m-0">Goodness &bull; Elegance &bull; Blessings</p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    Artisanal Heritage
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR COLLECTIONS: 3 Portrait Cards with Reference-Style Detailing */}
      <section id="collections" className="py-16 sm:py-24 bg-[#FFFDF9] relative">
        {/* Reference subtle radial dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(rgba(185, 135, 37, 0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 45%)',
          }}
        />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12 relative z-10">
          {/* Section Header with Signature Gold Rule */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#9F7627] block">
              DISCOVER A WORLD OF QUALITY, BEAUTY AND BLESSINGS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1917] m-0">
              OUR COLLECTIONS
            </h2>
            <div className="w-16 h-0.5 bg-[#C89B3C] mx-auto my-3" />
            <p className="text-xs sm:text-[13px] tracking-[0.16em] text-[#78716C] uppercase font-medium m-0">
              CURATED FOR YOUR HOME &bull; YOUR SPECIAL MOMENTS &bull; YOUR EVERYDAY
            </p>
          </div>

          {/* Three Cards Grid (Portrait 3:4 aspect ratio with zero head trimming!) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {collections.map((col) => (
              <article
                key={col.slug}
                className="group relative bg-white border border-[#EADFC8] rounded-xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Image Container in Portrait 3:4 */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF6EE]">
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={`object-cover ${col.objectPosition} group-hover:scale-104 transition-transform duration-700`}
                  />
                  {/* Category-accented badge */}
                  <div className={`absolute top-3 left-3 ${col.badgeClass} px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs`}>
                    {col.badge}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs px-2.5 py-1 rounded-xs text-[10px] font-semibold tracking-wide text-white">
                    {col.pill}
                  </div>
                </div>

                {/* Card Body matching reference site structure */}
                <div className="p-6 text-center flex flex-col flex-1 space-y-2.5">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#9F7627] uppercase">
                    {col.categorySubtitle}
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-[#1C1917] m-0 tracking-tight leading-snug">
                    {col.name}
                  </h3>

                  <p className="font-serif text-xs text-[#6C6559] uppercase tracking-wider font-semibold m-0">
                    {col.tagline}
                  </p>

                  <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3 m-0">
                    {col.description}
                  </p>

                  <div className="pt-3 mt-auto">
                    <Link
                      href={col.href}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-[#9F7627] to-[#C89B3C] hover:from-[#8A651F] hover:to-[#B3882F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-[3px] shadow-xs hover:shadow-md transition-all no-underline"
                    >
                      <span>SHOP {col.name}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 4-Pillar Trust Grid with Champagne Borders */}
          <div className="bg-white border border-[#EADFC8] rounded-xl overflow-hidden shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EADFC8]">
              <div className="p-5 text-center space-y-1 group hover:bg-[#FAF6EE]/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#EADFC8] mx-auto flex items-center justify-center text-[#C89B3C]">
                  <Award size={16} />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] m-0">Premium Quality</h4>
                <p className="text-xs text-[#78716C] m-0">Always Verified & Pure</p>
              </div>

              <div className="p-5 text-center space-y-1 group hover:bg-[#FAF6EE]/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#EADFC8] mx-auto flex items-center justify-center text-[#C89B3C]">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] m-0">Secure Checkout</h4>
                <p className="text-xs text-[#78716C] m-0">UPI, Cards & Verified COD</p>
              </div>

              <div className="p-5 text-center space-y-1 group hover:bg-[#FAF6EE]/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#EADFC8] mx-auto flex items-center justify-center text-[#C89B3C]">
                  <Truck size={16} />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] m-0">Express Pan-India Delivery</h4>
                <p className="text-xs text-[#78716C] m-0">Insured Doorstep Dispatch</p>
              </div>

              <div className="p-5 text-center space-y-1 group hover:bg-[#FAF6EE]/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#EADFC8] mx-auto flex items-center justify-center text-[#C89B3C]">
                  <Headphones size={16} />
                </div>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] m-0">Personalized Support</h4>
                <p className="text-xs text-[#78716C] m-0">WhatsApp Care at Every Step</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS: Responsive Grid */}
      <section id="featured" className="py-16 sm:py-20 bg-white border-y border-[#EADFC8]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EADFC8] pb-5">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#9F7627] block mb-1">
                HANDPICKED JUST FOR YOU
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] m-0">
                FEATURED PRODUCTS
              </h2>
              <p className="text-xs text-[#78716C] tracking-[0.14em] uppercase font-medium m-0 mt-1">
                FAVOURITES FROM ACROSS BARAKAHBAZAAR
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/coconut-oil"
                className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:text-[#C89B3C] transition-colors no-underline px-3 py-1.5 rounded-xs bg-[#FAF6EE] border border-[#EADFC8]"
              >
                Coconut Oil
              </Link>
              <Link
                href="/bridal"
                className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:text-[#C89B3C] transition-colors no-underline px-3 py-1.5 rounded-xs bg-[#FAF6EE] border border-[#EADFC8]"
              >
                Bridal Atelier
              </Link>
              <Link
                href="/naturals"
                className="text-xs font-semibold uppercase tracking-wider text-[#1C1917] hover:text-[#C89B3C] transition-colors no-underline px-3 py-1.5 rounded-xs bg-[#FAF6EE] border border-[#EADFC8]"
              >
                Naturals
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. BRAND PHILOSOPHY & CRAFTSMANSHIP NARRATIVE */}
      <section id="philosophy" className="py-16 sm:py-24 bg-[#FAF6EE] relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Story Visual in Arch Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[4/3] sm:aspect-square w-full max-w-[420px] overflow-hidden rounded-t-[80px] rounded-b-xl border border-[#EADFC8] shadow-md bg-stone-100">
                <Image
                  src="/images/home/barakah/image-4.jpg"
                  alt="Barakah Philosophy and Craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-serif italic text-base m-0">The Spirit of Barakah</p>
                  <p className="text-xs text-stone-200 m-0">Goodness &bull; Elegance &bull; Blessings</p>
                </div>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#EADFC8]">
                <Sparkles size={13} className="text-[#C89B3C]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#9F7627] uppercase">
                  MORE THAN A MARKETPLACE
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal leading-[1.15] m-0">
                A BLESSED <span className="italic text-[#C89B3C]">JOURNEY</span>
              </h2>

              <div className="w-16 h-0.5 bg-[#C89B3C]" />

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed m-0 font-normal">
                BarakahBazaar brings together products that make everyday life more beautiful — authentic Kerala coconut goodness, timeless bridal celebration wear, and artisanal soy candles for meaningful, calm spaces.
              </p>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed m-0 font-normal">
                Every collection is designed to feel warm, premium, and easy to discover, so you can find something authentic for your home, your special occasions, and your brighter tomorrow.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="#collections"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] hover:bg-[#C89B3C] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-xs shadow-xs transition-colors no-underline"
                >
                  <span>SHOP ALL COLLECTIONS</span>
                  <ArrowRight size={13} />
                </a>

                <a
                  href="https://wa.me/918951789665?text=Hello%20Barakah%20Bazaar%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20story%20and%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-[#FAF6EE] text-[#1C1917] border border-[#C89B3C] text-xs font-bold uppercase tracking-[0.12em] rounded-xs transition-colors no-underline"
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <span>Connect with Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL INVITATION BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-2xl border border-[#EADFC8] bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF8] to-[#FAF6EE] p-8 sm:p-14 text-center shadow-xs relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-[#9F7627] block">
              FOR YOUR HOME &bull; FOR YOUR SPECIAL MOMENTS &bull; FOR A BRIGHTER TOMORROW
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#1C1917] m-0">
              WELCOME TO BARAKAHBAZAAR
            </h2>

            <p className="font-serif italic text-xs sm:text-sm text-[#78716C] tracking-[0.18em] uppercase m-0">
              GOODNESS &bull; ELEGANCE &bull; BLESSINGS
            </p>

            <div className="pt-3 flex flex-wrap justify-center items-center gap-3">
              <a
                href="#collections"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#9F7627] to-[#C89B3C] hover:from-[#8A651F] hover:to-[#B3882F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-xs shadow-md transition-all no-underline"
              >
                <span>EXPLORE THE STORE</span>
                <ArrowRight size={14} />
              </a>

              <a
                href="https://wa.me/918951789665?text=Hello%20Barakah%20Bazaar%2C%20I%20would%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-[#FAF6EE] text-[#1C1917] border border-[#C89B3C] text-xs font-bold uppercase tracking-[0.12em] rounded-xs transition-colors no-underline"
              >
                <MessageCircle size={15} className="text-[#25D366]" />
                <span>ORDER ON WHATSAPP</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Assistance */}
      <FloatingWhatsApp />
    </div>
  );
}
