import React from 'react';
import Link from 'next/link';
import { IndianMotifDivider } from '@/components/ui/IndianMotifDivider';
import { SITE_CONFIG } from '@/lib/config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1D1911] text-[#CFC7B7] pt-12 pb-8 mt-16 text-xs border-t-2 border-[#C89B3C]">
      {/* Main 4-Column Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        {/* Brand Column (Span 4) */}
        <div className="md:col-span-4 space-y-3">
          <Link href="/" className="inline-block no-underline">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E3C476] tracking-tight block">
              Barakah Bazaar
            </span>
            <small className="block font-sans text-[8px] sm:text-[9px] font-bold tracking-[0.24em] text-[#BDB3A0] uppercase mt-1">
              GOODNESS &bull; ELEGANCE &bull; BLESSINGS
            </small>
          </Link>

          <p className="text-xs text-[#BDB3A0] leading-relaxed max-w-sm m-0">
            One elegant marketplace for pure cold-pressed Kerala coconut oil, royal bespoke bridal lehengas, and handcrafted natural aromatherapy candles.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2C261B] border border-[#423A2B] rounded-xs text-[11px] text-[#E3C476] font-medium">
              <span>Verified Pan-India Dispatch</span>
            </span>
          </div>
        </div>

        {/* Column 2: Collections (Span 3) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-serif text-base sm:text-lg font-bold text-[#E3C476] m-0">
            Collections
          </h4>
          <ul className="list-none p-0 m-0 space-y-2 text-xs">
            <li>
              <Link
                href="/coconut-oil"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Kerala Pure Coconut Oil
              </Link>
            </li>
            <li>
              <Link
                href="/bridal"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Barakah Bridal Collections
              </Link>
            </li>
            <li>
              <Link
                href="/naturals"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Barakah Naturals Candles
              </Link>
            </li>
            <li>
              <Link
                href="/#philosophy"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Our Heritage &amp; Story
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care (Span 2) */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-serif text-base sm:text-lg font-bold text-[#E3C476] m-0">
            Customer Care
          </h4>
          <ul className="list-none p-0 m-0 space-y-2 text-xs">
            <li>
              <Link
                href="/orders"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Track My Order
              </Link>
            </li>
            <li>
              <Link
                href="/policies/returns"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Shipping &amp; Delivery
              </Link>
            </li>
            <li>
              <Link
                href="/policies/returns"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Returns &amp; Policies
              </Link>
            </li>
            <li>
              <Link
                href="/policies/privacy"
                className="text-[#CFC7B7] hover:text-[#E3C476] transition-colors no-underline"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Connect & Support (Span 3) */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-serif text-base sm:text-lg font-bold text-[#E3C476] m-0">
            Connect
          </h4>
          <p className="text-xs text-[#BDB3A0] leading-relaxed m-0">
            Dedicated customer concierge available for styling guidance, orders, and inquiries.
          </p>

          <div className="pt-1 space-y-1.5">
            <a
              href="https://wa.me/918951789665"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#E3C476] hover:text-white font-medium text-xs no-underline transition-colors"
            >
              <span>WhatsApp: +91 8951789665</span>
            </a>
            <p className="text-[11px] text-[#8F8778] m-0">
              Hours: 10:00 AM &ndash; 8:00 PM IST
            </p>
          </div>
        </div>
      </div>

      {/* Verified Payment & Copyright Row */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 mt-8 border-t border-[#423A2B] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#9D9587]">
        <p className="m-0 text-center sm:text-left">
          Secure Payments via UPI, Cards, NetBanking &bull; 100% Genuine Provenance
        </p>
        <p className="m-0 text-center sm:text-right">
          &copy; {new Date().getFullYear()} BarakahBazaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
