import React from 'react';
import Image from 'next/image';
import { Sparkles, MessageCircle, Heart, CheckCircle2, Flame, Droplets, SunMedium } from 'lucide-react';

interface CategoryEditorialStoryProps {
  slug: string;
}

export const CategoryEditorialStory: React.FC<CategoryEditorialStoryProps> = ({ slug }) => {
  if (slug === 'bridal') {
    return (
      <section className="bg-[#FAF6EE] border-t border-[#EADFC8] py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Story Visual in Arched Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-t-[80px] rounded-b-xl border border-[#EADFC8] shadow-md bg-stone-100">
                <Image
                  src="/images/bridal/hero.jpeg"
                  alt="Barakah Bazaar Bridal Craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover object-[center_top]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-serif italic text-base m-0">The Royal Atelier</p>
                  <p className="text-xs text-stone-200 m-0">Handcrafted Zari & Tilla Needlework</p>
                </div>
              </div>
            </div>

            {/* Editorial Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
                <Sparkles size={13} className="text-[#800020]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#800020] uppercase">
                  Bespoke Craftsmanship
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-900 font-normal leading-tight m-0">
                Woven with Heritage. <br />
                <span className="italic text-[#800020]">Tailored for Eternal Moments.</span>
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed m-0 font-normal">
                Every piece in our bridal collection is designed to bring regal grace and timeless modesty together. From hand-stitched zardozi borders to rich pure georgette and velvet fabrics, each outfit celebrates the joy of Indian wedding ceremonies.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
                  <h4 className="font-serif text-sm font-bold text-stone-900 m-0 mb-1">
                    Personalized Sizing & Consultations
                  </h4>
                  <p className="text-xs text-stone-500 m-0 leading-relaxed">
                    Custom measurements and alterations coordinated directly through our bridal styling concierge.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-2xs">
                  <h4 className="font-serif text-sm font-bold text-stone-900 m-0 mb-1">
                    Transparent Festive Pricing
                  </h4>
                  <p className="text-xs text-stone-500 m-0 leading-relaxed">
                    All festive ensembles offered at a transparent ₹8,999 (MRP ₹12,999) with full Pan-India insured delivery.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/918951789665?text=Hello%20Barakah%20Bazaar%2C%20I%20am%20looking%20for%20a%20bridal%20outfit%20and%20would%20like%20sizing%20guidance."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-xs shadow-xs transition-colors no-underline"
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <span>Consult with Bridal Stylist</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (slug === 'coconut-oil') {
    return (
      <section className="bg-[#FAF6EE] border-t border-[#EADFC8] py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
          {/* Top Story Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-t-[80px] rounded-b-xl border border-[#EADFC8] shadow-md bg-stone-100">
                <Image
                  src="/images/oil/product-1.jpeg"
                  alt="Kerala Pure Coconut Oil Harvest"
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-serif italic text-base m-0">Kerala Pure Coconut Oil</p>
                  <p className="text-xs text-stone-200 m-0">Single-Origin Coastal Copra Extraction</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-[#EADFC8] shadow-2xs">
                <Droplets size={13} className="text-[#123B20]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#123B20] uppercase">
                  From Kerala, With Purity
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-900 font-normal leading-tight m-0">
                Pure for Generations. <br />
                <span className="italic text-[#123B20]">Cold-Pressed for Everyday Wellness.</span>
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed m-0 font-normal">
                Kerala Pure Coconut Oil brings the unmistakable aroma and versatility of coastal Kerala copra directly to your home. Cold-pressed using traditional Marachekku wooden expellers, our oil contains zero mineral oils, artificial bleaching, or chemical preservatives.
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-xs text-stone-700">
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#EADFC8] px-3 py-1.5 rounded-xs">
                  <CheckCircle2 size={13} className="text-[#123B20]" />
                  <span>Lab Tested & FSSAI Compliant</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#EADFC8] px-3 py-1.5 rounded-xs">
                  <CheckCircle2 size={13} className="text-[#123B20]" />
                  <span>Unrefined & Sulfur-Free</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-[#EADFC8] px-3 py-1.5 rounded-xs">
                  <CheckCircle2 size={13} className="text-[#123B20]" />
                  <span>Convenient 300ml, 500ml & 1L Packs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Everyday Uses Grid */}
          <div className="space-y-5 pt-4 border-t border-[#EADFC8]">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal m-0 mb-1">
                Versatile Everyday Rituals
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 m-0">
                Pure natural nourishment for the entire family.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white p-4.5 rounded-lg border border-[#EADFC8] shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF6EE] border border-[#EADFC8] flex items-center justify-center text-[#123B20]">
                  <Droplets size={14} />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900 m-0">For Scalp & Hair</h4>
                <p className="text-xs text-stone-600 m-0 leading-relaxed">
                  Gently warm a tablespoon and massage into scalp to nourish hair roots and tame frizz.
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-lg border border-[#EADFC8] shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF6EE] border border-[#EADFC8] flex items-center justify-center text-[#123B20]">
                  <SunMedium size={14} />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900 m-0">For Skin Hydration</h4>
                <p className="text-xs text-stone-600 m-0 leading-relaxed">
                  Natural botanical moisturizer for dry skin, elbows, and lips with natural lauric acid.
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-lg border border-[#EADFC8] shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF6EE] border border-[#EADFC8] flex items-center justify-center text-[#123B20]">
                  <Heart size={14} />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900 m-0">Gentle Baby Massage</h4>
                <p className="text-xs text-stone-600 m-0 leading-relaxed">
                  Pure and chemical-free for soothing newborn massage and healthy infant skin barrier.
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-lg border border-[#EADFC8] shadow-2xs space-y-1.5">
                <div className="w-7 h-7 rounded-full bg-[#FAF6EE] border border-[#EADFC8] flex items-center justify-center text-[#123B20]">
                  <Flame size={14} />
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-900 m-0">Authentic Kerala Cuisine</h4>
                <p className="text-xs text-stone-600 m-0 leading-relaxed">
                  The quintessential foundation for authentic Kerala roast, poriyals, avial, and tempering.
                </p>
              </div>
            </div>
          </div>

          {/* Wholesale & Bulk Supply Card */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-[#EADFC8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#123B20]">
                Wholesale & Trade Enquiries
              </span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900 m-0">
                Need Bulk Supply for Stores or Kitchens?
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl m-0 leading-relaxed">
                We supply retailers, organic stores, and commercial kitchens across India with competitive MOQ rates and prompt dispatch.
              </p>
            </div>

            <a
              href="https://wa.me/918951789665?text=Hello%20Kerala%20Pure%2C%20I%20am%20interested%20in%20wholesale%2Fbulk%20orders.%20Please%20share%20your%20commercial%20pricing%20and%20MOQ."
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-[#123B20] hover:bg-stone-900 text-white text-xs font-semibold uppercase tracking-[0.14em] rounded-xs shadow-xs transition-colors no-underline"
            >
              <MessageCircle size={15} />
              <span>Enquire Wholesale on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  // naturals
  return (
    <section className="bg-[#FAF6EE] border-t border-[#EADFC8] py-12 sm:py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-[4/5] w-full max-w-[360px] overflow-hidden rounded-t-[80px] rounded-b-xl border border-[#EADFC8] shadow-md bg-stone-100">
              <Image
                src="/images/naturals/barakah-philosophy.jpg"
                alt="Barakah Naturals Philosophy"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-serif italic text-base m-0">The Spirit of Barakah</p>
                <p className="text-xs text-stone-200 m-0">Handcrafted Scent & Peace for Sacred Spaces</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
              <Sparkles size={13} className="text-[#5B1730]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#5B1730] uppercase">
                Aromatherapy & Rituals
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-stone-900 font-normal leading-tight m-0">
              The Philosophy of Barakah. <br />
              <span className="italic text-[#5B1730]">Infusing Warmth & Calming Grace.</span>
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed m-0 font-normal">
              At Barakah Naturals, every candle and spice is curated to bring mindful intentionality into everyday living. Hand-poured from 100% natural soy wax, our candles burn clean and slow, infusing your environment with sacred aromas of Damask rose, Oud, amber, and vanilla.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-xs text-stone-700">
              <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xs">
                <CheckCircle2 size={13} className="text-[#5B1730]" />
                <span>Zero Paraffin • 100% Soy Wax</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xs">
                <CheckCircle2 size={13} className="text-[#5B1730]" />
                <span>Cotton Lead-Free Wicks</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-1.5 rounded-xs">
                <CheckCircle2 size={13} className="text-[#5B1730]" />
                <span>Bespoke Gift Packaging</span>
              </span>
            </div>
          </div>
        </div>

        {/* Candle Care Rituals Grid */}
        <div className="space-y-5 pt-4 border-t border-stone-200">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal m-0 mb-1">
              The Ritual of Candle Care
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 m-0">
              Maximize burn time and aromatic throw with mindful care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4.5 rounded-lg border border-stone-200 shadow-2xs space-y-1.5 text-center sm:text-left">
              <div className="w-7 h-7 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#5B1730] mx-auto sm:mx-0">
                <Flame size={14} />
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900 m-0">The Crucial First Burn</h4>
              <p className="text-xs text-stone-600 m-0 leading-relaxed">
                Allow the wax to melt completely across to the edge on your first lighting (2-3 hours) to prevent tunneling.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-lg border border-stone-200 shadow-2xs space-y-1.5 text-center sm:text-left">
              <div className="w-7 h-7 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#5B1730] mx-auto sm:mx-0">
                <Sparkles size={14} />
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900 m-0">Trim Your Wick</h4>
              <p className="text-xs text-stone-600 m-0 leading-relaxed">
                Always trim your cotton wick to 1/4 inch before lighting to ensure a gentle, steady flame with minimal soot.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-lg border border-stone-200 shadow-2xs space-y-1.5 text-center sm:text-left">
              <div className="w-7 h-7 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-[#5B1730] mx-auto sm:mx-0">
                <Heart size={14} />
              </div>
              <h4 className="font-serif text-sm font-bold text-stone-900 m-0">Custom Gift Sets</h4>
              <p className="text-xs text-stone-600 m-0 leading-relaxed">
                Ordering for weddings or corporate gifts? Reach out via WhatsApp for personalized gift hamper curation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
