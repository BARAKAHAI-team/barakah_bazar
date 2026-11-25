import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Globe, Mail, Building2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About Barakah Bazaar',
  description:
    'Barakah Bazaar — Bringing Tradition, Quality & Trust Together. Operated and managed by BARAKAH AI.',
};

const COLLECTIONS = [
  {
    number: '01',
    title: 'Kerala Pure Coconut Oil',
    href: '/coconut-oil',
    description:
      'Experience the natural goodness of Kerala with our carefully selected pure coconut oil. Inspired by traditional Kerala practices, our coconut oil is a wonderful addition to everyday cooking and personal care routines.',
  },
  {
    number: '02',
    title: 'Premium Bridal Collections',
    href: '/bridal',
    description:
      'Celebrate your special moments with our elegant bridal collections. Each selection reflects traditional beauty, timeless designs, and the charm of Indian ethnic fashion.',
  },
  {
    number: '03',
    title: 'Natural Farm Products',
    href: '/naturals',
    description:
      'Discover our selection of natural farm products, bringing the goodness of nature closer to your home. We believe in appreciating traditional products and the value of quality ingredients.',
  },
];

const COMMITMENTS = [
  'Offering carefully selected quality products.',
  'Celebrating traditional craftsmanship and heritage.',
  'Bringing natural and authentic products to customers.',
  'Providing a convenient and reliable shopping experience.',
  'Building lasting relationships with our customers.',
];

export default function AboutPage() {
  return (
    <div className="bg-white text-[#211e18]">
      {/* Editorial Intro Header */}
      <section className="bg-[#FAF7F2] border-b border-[#EADFC8]">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pb-18">
          <Breadcrumbs items={[{ label: 'About Us' }]} />

          <div className="mt-8 max-w-[780px]">
            <span className="text-[11px] font-bold tracking-[2.5px] uppercase text-[#b98725] block mb-3">
              About Barakah Bazaar
            </span>
            <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[48px] font-semibold leading-[1.1] tracking-tight text-[#2c2214] m-0 mb-6">
              Bringing Tradition, Quality &amp; Trust Together
            </h1>

            <div className="space-y-4 text-[15px] sm:text-[16px] leading-[1.8] text-[#534838]">
              <p className="m-0">
                Barakah Bazaar is a destination where tradition meets quality, bringing together carefully selected products that celebrate heritage, craftsmanship, and natural goodness.
              </p>
              <p className="m-0">
                We bring together three distinctive collections under one roof:{' '}
                <strong className="font-semibold text-[#2c2214]">
                  premium bridal collections, natural farm products, and pure Kerala cold-pressed coconut oil.
                </strong>
              </p>
              <p className="m-0">
                Our vision is to make quality products accessible while preserving the traditional values, authenticity, and craftsmanship behind them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Collections */}
      <section className="py-14 sm:py-16 border-b border-[#EADFC8]/70 bg-white">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-[10px] font-bold tracking-[2.2px] uppercase text-[#b98725] block mb-2">
              Three Pillars
            </span>
            <h2 className="font-serif text-[26px] sm:text-[32px] font-semibold text-[#2c2214] m-0">
              Our Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {COLLECTIONS.map((item) => (
              <div
                key={item.number}
                className="flex flex-col justify-between p-6 sm:p-7 bg-[#FAF7F2]/60 border border-[#EADFC8] rounded-lg"
              >
                <div>
                  <span className="font-serif text-[13px] font-semibold tracking-[1.5px] text-[#b98725] block mb-3">
                    {item.number}
                  </span>
                  <h3 className="font-serif text-[20px] font-semibold text-[#2c2214] m-0 mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[14px] leading-[1.75] text-[#5a4e3d] m-0">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#EADFC8]/80">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[1.4px] uppercase text-[#8C6418] hover:text-[#2c2214] no-underline transition-colors group"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Commitment & Our Vision */}
      <section className="py-14 sm:py-16 border-b border-[#EADFC8]/70 bg-[#FAF7F2]/40">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Commitment (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-[#EADFC8] rounded-lg">
              <h2 className="font-serif text-[26px] font-semibold text-[#2c2214] m-0 mb-3">
                Our Commitment
              </h2>
              <p className="text-[14.5px] leading-[1.75] text-[#534838] m-0 mb-5">
                At Barakah Bazaar, we believe that trust is built through quality, transparency, and customer satisfaction. We are committed to:
              </p>

              <ul className="list-none p-0 m-0 space-y-3">
                {COMMITMENTS.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[14px] text-[#3a2f20] leading-relaxed">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#FAF7F2] border border-[#EADFC8] flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[#b98725]" strokeWidth={2.5} />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision & Closing Statement (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 border border-[#EADFC8] rounded-lg">
                <h2 className="font-serif text-[26px] font-semibold text-[#2c2214] m-0 mb-3">
                  Our Vision
                </h2>
                <p className="text-[14.5px] leading-[1.75] text-[#534838] m-0">
                  Our vision is to grow Barakah Bazaar into a trusted destination for traditional, natural, and lifestyle products, connecting customers with quality and heritage through a seamless shopping experience.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-6 sm:p-8 border border-[#EADFC8] rounded-lg">
                <h3 className="font-serif text-[20px] font-semibold text-[#2c2214] m-0 mb-3">
                  Barakah Bazaar &ndash; Quality You Can Trust
                </h3>
                <p className="text-[14px] leading-[1.75] text-[#534838] m-0 mb-4">
                  Every product tells a story. Every tradition carries value. At Barakah Bazaar, we bring them together under one roof.
                </p>
                <p className="text-[13px] font-bold tracking-[0.5px] text-[#8C6418] m-0">
                  Discover Tradition. Experience Quality. Shop with Trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business & Support Information */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#EADFC8] rounded-lg bg-[#FAF7F2]/50 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b border-[#EADFC8]">
              <div>
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#b98725] block mb-1">
                  Brand &amp; Operations
                </span>
                <h2 className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#2c2214] m-0">
                  About Barakah Bazaar
                </h2>
              </div>
              <p className="text-[13.5px] text-[#534838] m-0">
                Barakah Bazaar is an e-commerce brand operated and managed by{' '}
                <strong className="font-semibold text-[#2c2214]">BARAKAH AI</strong>.
              </p>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 m-0">
              <div className="space-y-1">
                <dt className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7a6d5a] flex items-center gap-1.5">
                  <Building2 size={13} className="text-[#b98725]" />
                  <span>Business Entity</span>
                </dt>
                <dd className="m-0 text-[14px] font-semibold text-[#2c2214]">
                  <a
                    href="https://barakahai.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2c2214] hover:text-[#8C6418] underline decoration-[#D8CCB5] underline-offset-4 transition-colors"
                  >
                    BARAKAH AI
                  </a>
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7a6d5a]">
                  Brand Name
                </dt>
                <dd className="m-0 text-[14px] font-semibold text-[#2c2214]">Barakah Bazaar</dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7a6d5a] flex items-center gap-1.5">
                  <Globe size={13} className="text-[#b98725]" />
                  <span>Website</span>
                </dt>
                <dd className="m-0 text-[14px]">
                  <a
                    href="https://www.barakhabazaar.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#8C6418] hover:text-[#2c2214] underline underline-offset-4"
                  >
                    www.barakhabazaar.in
                  </a>
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#7a6d5a] flex items-center gap-1.5">
                  <Mail size={13} className="text-[#b98725]" />
                  <span>Customer Support</span>
                </dt>
                <dd className="m-0 text-[14px]">
                  <a
                    href="mailto:barakahbazaar786@gmail.com"
                    className="font-medium text-[#8C6418] hover:text-[#2c2214] underline underline-offset-4 break-all"
                  >
                    barakahbazaar786@gmail.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
