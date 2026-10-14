import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BarakahBazaar — A More Blessed Tomorrow',
  description:
    'BarakahBazaar — Kerala Pure Coconut Oil, Bridal Collection and Barakah Naturals in one elegant marketplace.',
};

export default function LandingPage() {
  return (
    <div className="bg-[#fffdf9] text-[#211e18] overflow-x-hidden">
      {/* 1. HERO SECTION: Full-bleed user_collection_hero.jpg artwork with smooth horizontal gradient */}
      <section id="home" className="relative min-h-[625px] flex items-center overflow-hidden bg-[#fbf7ee]">
        {/* Full-bleed hero artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(251,247,238,0.99) 0%, rgba(251,247,238,0.94) 29%, rgba(251,247,238,0.45) 57%, rgba(251,247,238,0.08) 100%), url("/images/home/user_collection_hero.jpg")',
          }}
        />

        {/* Decorative Arch on right */}
        <div className="absolute right-[5%] bottom-[5%] w-[150px] h-[150px] border border-[rgba(185,135,37,0.55)] rounded-t-[80px] rounded-b-none opacity-65 pointer-events-none hidden md:block">
          <div className="absolute inset-[13px] border border-[rgba(185,135,37,0.35)] rounded-t-[68px]" />
        </div>

        {/* Hero inner copy */}
        <div className="relative w-[min(1180px,91%)] mx-auto py-[92px] pb-[105px] z-10">
          <div className="text-[10px] tracking-[5px] text-[#b98725] font-black uppercase">
            ONE BEAUTIFUL MARKETPLACE
          </div>
          <h1 className="font-serif text-[clamp(48px,6.3vw,82px)] leading-[0.91] max-w-[640px] my-[17px] text-[#16140f] font-bold tracking-tight">
            EVERYTHING<br />WITH <span className="italic text-[#b98725]">BARAKAH</span>
          </h1>
          <p className="max-w-[520px] text-[#625d53] text-[15px] sm:text-[16px] leading-[1.8] font-normal my-0">
            KERALA PURE &nbsp; &bull; &nbsp; BRIDAL COLLECTION &nbsp; &bull; &nbsp; BARAKAH NATURALS
          </p>
          <div className="pt-2">
            <a
              href="#collections"
              className="inline-flex items-center gap-2 bg-[#b98725] hover:bg-[#a6771d] text-white px-[23px] py-[14px] rounded-[4px] text-[11px] font-black tracking-[1.2px] mt-[10px] shadow-[0_8px_24px_rgba(185,135,37,0.24)] transition-all no-underline uppercase"
            >
              <span>EXPLORE OUR COLLECTIONS</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. OUR COLLECTIONS */}
      <section id="collections" className="py-[76px] bg-[#fffdf9] relative">
        {/* Subtle radial dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(185,135,37,0.09) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 35%)',
          }}
        />

        <div className="w-[min(1180px,91%)] mx-auto relative z-10">
          <div className="text-center mb-[38px]">
            <span className="text-[10px] tracking-[5px] text-[#b98725] font-black uppercase block mb-2">
              DISCOVER A WORLD OF QUALITY, BEAUTY AND BLESSINGS
            </span>
            <h2 className="font-serif font-bold text-[36px] sm:text-[42px] my-[10px] text-[#16140f]">
              OUR COLLECTIONS
            </h2>
            <p className="text-[12px] text-[#6d675c] tracking-[2px] uppercase m-0">
              CURATED FOR YOUR HOME &bull; YOUR SPECIAL MOMENTS &bull; YOUR EVERYDAY
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
            {/* Card 1: Kerala Pure */}
            <article className="bg-white border border-[#e8dcc2] rounded-[7px] overflow-hidden shadow-[0_15px_45px_rgba(75,56,20,0.09)] hover:-translate-y-[7px] hover:shadow-[0_22px_55px_rgba(75,56,20,0.15)] transition-all duration-300 group">
              <div className="h-[280px] bg-[#f2eee4] overflow-hidden">
                <img
                  src="/images/home/oil/image-4.jpeg"
                  alt="Kerala Pure Coconut Oil"
                  className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-600"
                />
              </div>
              <div className="text-center p-[19px_15px_23px]">
                <div className="text-[9px] tracking-[2.5px] text-[#b98725] font-black uppercase">
                  100% PURE &bull; NATURAL &bull; AUTHENTIC
                </div>
                <h3 className="font-serif font-bold text-[25px] my-2 text-[#16140f]">
                  KERALA PURE
                </h3>
                <p className="font-serif text-[12px] text-[#6c6559] mb-[14px] mt-0">
                  COCONUT OIL
                </p>
                <Link
                  href="/coconut-oil"
                  className="inline-block bg-[#b98725] hover:bg-[#a6771d] text-white px-4 py-[9px] rounded-[3px] text-[10px] font-black tracking-[1px] no-underline uppercase transition-colors"
                >
                  SHOP NOW &rarr;
                </Link>
              </div>
            </article>

            {/* Card 2: Bridal Collection */}
            <article className="bg-white border border-[#e8dcc2] rounded-[7px] overflow-hidden shadow-[0_15px_45px_rgba(75,56,20,0.09)] hover:-translate-y-[7px] hover:shadow-[0_22px_55px_rgba(75,56,20,0.15)] transition-all duration-300 group">
              <div className="h-[280px] bg-[#f2eee4] overflow-hidden">
                <img
                  src="/images/home/bridal/image-6.jpeg"
                  alt="Bridal Collection"
                  className="w-full h-full object-cover object-[center_top] group-hover:scale-[1.035] transition-transform duration-600"
                />
              </div>
              <div className="text-center p-[19px_15px_23px]">
                <div className="text-[9px] tracking-[2.5px] text-[#b98725] font-black uppercase">
                  ELEGANCE FOR YOUR SPECIAL MOMENTS
                </div>
                <h3 className="font-serif font-bold text-[25px] my-2 text-[#16140f]">
                  BRIDAL COLLECTION
                </h3>
                <p className="font-serif text-[12px] text-[#6c6559] mb-[14px] mt-0">
                  TIMELESS &bull; GRACEFUL &bull; CELEBRATION
                </p>
                <Link
                  href="/bridal"
                  className="inline-block bg-[#b98725] hover:bg-[#a6771d] text-white px-4 py-[9px] rounded-[3px] text-[10px] font-black tracking-[1px] no-underline uppercase transition-colors"
                >
                  SHOP NOW &rarr;
                </Link>
              </div>
            </article>

            {/* Card 3: Barakah Naturals */}
            <article className="bg-white border border-[#e8dcc2] rounded-[7px] overflow-hidden shadow-[0_15px_45px_rgba(75,56,20,0.09)] hover:-translate-y-[7px] hover:shadow-[0_22px_55px_rgba(75,56,20,0.15)] transition-all duration-300 group">
              <div className="h-[280px] bg-[#f2eee4] overflow-hidden">
                <img
                  src="/images/home/barakah/image-5.png"
                  alt="Barakah Naturals"
                  className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-600"
                />
              </div>
              <div className="text-center p-[19px_15px_23px]">
                <div className="text-[9px] tracking-[2.5px] text-[#b98725] font-black uppercase">
                  LIGHT &bull; SCENT &bull; GIFTING
                </div>
                <h3 className="font-serif font-bold text-[25px] my-2 text-[#16140f]">
                  BARAKAH NATURALS
                </h3>
                <p className="font-serif text-[12px] text-[#6c6559] mb-[14px] mt-0">
                  CANDLES FOR A CALMER, BRIGHTER YOU
                </p>
                <Link
                  href="/naturals"
                  className="inline-block bg-[#b98725] hover:bg-[#a6771d] text-white px-4 py-[9px] rounded-[3px] text-[10px] font-black tracking-[1px] no-underline uppercase transition-colors"
                >
                  SHOP NOW &rarr;
                </Link>
              </div>
            </article>
          </div>

          {/* Connected Trust Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#e8dcc2] rounded-[8px] mt-[25px] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#e8dcc2]">
            <div className="p-5 text-center">
              <div className="text-xl mb-1 text-[#b98725]">&diams;</div>
              <b className="block font-serif font-bold text-[14px] my-[5px] text-[#16140f]">Premium Quality</b>
              <span className="text-[10px] text-[#7a746a]">Always the Best</span>
            </div>
            <div className="p-5 text-center">
              <div className="text-xl mb-1 text-[#b98725]">&diams;</div>
              <b className="block font-serif font-bold text-[14px] my-[5px] text-[#16140f]">Secure Payments</b>
              <span className="text-[10px] text-[#7a746a]">Shop with Confidence</span>
            </div>
            <div className="p-5 text-center">
              <div className="text-xl mb-1 text-[#b98725]">&diams;</div>
              <b className="block font-serif font-bold text-[14px] my-[5px] text-[#16140f]">Fast &amp; Reliable Delivery</b>
              <span className="text-[10px] text-[#7a746a]">Across India</span>
            </div>
            <div className="p-5 text-center">
              <div className="text-xl mb-1 text-[#b98725]">&diams;</div>
              <b className="block font-serif font-bold text-[14px] my-[5px] text-[#16140f]">Dedicated Support</b>
              <span className="text-[10px] text-[#7a746a]">We&apos;re Here to Help</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section id="featured" className="py-[76px] bg-white">
        <div className="w-[min(1180px,91%)] mx-auto">
          <div className="text-center mb-[38px]">
            <span className="text-[10px] tracking-[5px] text-[#b98725] font-black uppercase block mb-2">
              HANDPICKED JUST FOR YOU
            </span>
            <h2 className="font-serif font-bold text-[36px] sm:text-[42px] my-[10px] text-[#16140f]">
              FEATURED PRODUCTS
            </h2>
            <p className="text-[12px] text-[#6d675c] tracking-[2px] uppercase m-0">
              FAVOURITES FROM ACROSS BARAKAHBAZAAR
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[10px]">
            {/* Product 1 */}
            <Link
              href="/coconut-oil/kerala-pure-coconut-oil-300ml"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/oil/image-5.jpeg" alt="Pure Coconut Oil 300ml" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">KERALA PURE</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Pure Coconut Oil 300ml</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹149</div>
              </div>
            </Link>

            {/* Product 2 */}
            <Link
              href="/coconut-oil/kerala-pure-coconut-oil-500ml"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/oil/image-5.jpeg" alt="Pure Coconut Oil 500ml" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">KERALA PURE</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Pure Coconut Oil 500ml</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹249</div>
              </div>
            </Link>

            {/* Product 3 */}
            <Link
              href="/naturals"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/barakah/image-1.jpg" alt="Signature Scented Candle" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">BARAKAH NATURALS</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Signature Scented Candle</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹499</div>
              </div>
            </Link>

            {/* Product 4 */}
            <Link
              href="/bridal"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/bridal/image-8.jpeg" alt="Premium Bridal Collection" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">BRIDAL</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Premium Bridal Collection</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹8,999</div>
              </div>
            </Link>

            {/* Product 5 */}
            <Link
              href="/naturals"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/barakah/image-3.jpg" alt="Oud Classic Candle" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">BARAKAH NATURALS</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Oud Classic Candle</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹499</div>
              </div>
            </Link>

            {/* Product 6 */}
            <Link
              href="/bridal"
              className="border border-[#eee5d4] rounded-[6px] overflow-hidden bg-white hover:shadow-md transition-shadow no-underline block group"
            >
              <img src="/images/home/bridal/image-7.jpeg" alt="Royal Bridal Collection" className="w-full h-[175px] object-cover bg-[#f7f3ea] group-hover:scale-[1.02] transition-transform" />
              <div className="p-[11px]">
                <small className="text-[8px] text-[#887a61] uppercase tracking-wider block font-bold">BRIDAL</small>
                <h4 className="font-serif font-semibold text-[13px] my-[5px] mb-[10px] min-h-[30px] line-clamp-2 text-[#16140f]">Royal Bridal Collection</h4>
                <div className="font-black text-[#a87518] text-[14px]">₹12,999</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PHILOSOPHY */}
      <section id="philosophy" className="py-[76px] bg-[#fbf7ee]">
        <div className="w-[min(1180px,91%)] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[55px] items-center">
          <img
            src="/images/home/barakah/image-4.jpg"
            alt="Barakah Philosophy"
            className="w-full h-[360px] sm:h-[430px] object-cover rounded-[5px] shadow-[0_20px_60px_rgba(73,52,17,0.12)]"
          />
          <div>
            <div className="text-[10px] tracking-[5px] text-[#b98725] font-black uppercase mb-2">
              MORE THAN A MARKETPLACE
            </div>
            <h2 className="font-serif font-bold text-[36px] sm:text-[45px] leading-[1.02] my-[10px] text-[#16140f]">
              A BLESSED<br />JOURNEY
            </h2>
            <div className="w-[70px] border-t border-[#b98725] my-[15px]" />
            <p className="font-serif text-[14px] text-[#686155] leading-[1.9] my-3">
              BarakahBazaar brings together products that make everyday life more beautiful &mdash; authentic Kerala goodness, timeless bridal elegance and handcrafted candles for meaningful spaces.
            </p>
            <p className="font-serif text-[14px] text-[#686155] leading-[1.9] my-3">
              Every collection is designed to feel warm, premium and easy to discover, so customers can find something for their home, their special moments and their brighter tomorrow.
            </p>
            <Link
              href="#collections"
              className="inline-block bg-[#b98725] hover:bg-[#a6771d] text-white px-4 py-[9px] rounded-[3px] text-[10px] font-black tracking-[1px] no-underline uppercase transition-colors mt-3"
            >
              SHOP ALL PRODUCTS &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FINAL WELCOME BANNER */}
      <section
        className="w-[min(1180px,91%)] mx-auto mb-[70px] min-h-[300px] relative overflow-hidden rounded-[7px] border border-[#e8dcc2] flex items-center justify-center text-center p-8 sm:p-12"
        style={{
          background: 'linear-gradient(90deg, rgba(249,243,228,0.98), rgba(249,243,228,0.75)), url("/images/home/barakah/image-5.png") center/cover',
        }}
      >
        <div>
          <div className="text-[10px] tracking-[3px] text-[#756b58] font-bold uppercase mb-2">
            FOR YOUR HOME &bull; FOR YOUR SPECIAL MOMENTS &bull; FOR A BRIGHTER TOMORROW
          </div>
          <h2 className="font-serif font-bold text-[32px] sm:text-[45px] my-2 text-[#16140f]">
            WELCOME TO BARAKAHBAZAAR
          </h2>
          <p className="text-[11px] tracking-[3px] text-[#756b58] uppercase my-2 font-bold">
            GOODNESS &bull; ELEGANCE &bull; BLESSINGS
          </p>
          <Link
            href="#collections"
            className="inline-block bg-[#b98725] hover:bg-[#a6771d] text-white px-5 py-[11px] rounded-[3px] text-[10px] font-black tracking-[1px] no-underline uppercase transition-colors mt-3 shadow-md"
          >
            EXPLORE THE STORE &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
