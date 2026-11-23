'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, MessageCircle, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#F6F2E9] text-[#2C2419] pt-14 pb-10 mt-20 text-xs border-t-2 border-[#B8892D]">
      {/* Main 4-Column Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand Column (Span 4) */}
        <div className="md:col-span-4 space-y-4">
          <Link href="/" className="inline-block no-underline group select-none">
            <img
              src="/new-logo.png"
              alt="Barakah Bazaar"
              className="h-20 sm:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
            />
          </Link>

          <p className="text-[13px] text-[#524736] leading-relaxed max-w-sm m-0 font-normal">
            A luxury sanctuary for 100% pure Kerala cold-pressed coconut oil, regal bespoke bridal couture, and botanical hand-poured soy candles.
          </p>

          {/* Core Pillars: Pure • Halal • Trusted */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8CCB5] rounded-md text-[11px] text-[#8C6418] font-semibold tracking-wide shadow-2xs">
              <span>Pure</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8CCB5] rounded-md text-[11px] text-[#8C6418] font-semibold tracking-wide shadow-2xs">
              <span>Halal</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D8CCB5] rounded-md text-[11px] text-[#8C6418] font-semibold tracking-wide shadow-2xs">
              <span>Trusted</span>
            </span>
          </div>
        </div>

        {/* Column 2: Signature Collections (Span 3) */}
        <div className="md:col-span-3 space-y-3.5">
          <h4 className="font-serif text-[16px] font-bold text-[#1A1A17] tracking-wide m-0">
            Signature Collections
          </h4>
          <ul className="list-none p-0 m-0 space-y-2.5 text-[13px]">
            <li>
              <Link
                href="/coconut-oil"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Kerala Pure Coconut Oil</span>
                <ArrowUpRight size={14} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/bridal"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Bridal Collections</span>
                <ArrowUpRight size={14} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/naturals"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Naturals</span>
                <ArrowUpRight size={14} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/#why-barakah"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Why BarakahBazar</span>
                <ArrowUpRight size={14} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care (Span 2) */}
        <div className="md:col-span-2 space-y-3.5">
          <h4 className="font-serif text-[16px] font-bold text-[#1A1A17] tracking-wide m-0">
            Customer Care
          </h4>
          <ul className="list-none p-0 m-0 space-y-2.5 text-[13px]">
            <li>
              <Link
                href="/orders"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline block py-0.5"
              >
                Track My Order
              </Link>
            </li>
            <li>
              <Link
                href="/policies/returns"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline block py-0.5"
              >
                Shipping &amp; Delivery
              </Link>
            </li>
            <li>
              <Link
                href="/policies/returns"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline block py-0.5"
              >
                Returns &amp; Exchange
              </Link>
            </li>
            <li>
              <Link
                href="/policies/privacy"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline block py-0.5"
              >
                Privacy &amp; Security
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Dedicated Concierge (Span 3) */}
        <div className="md:col-span-3 space-y-3.5">
          <h4 className="font-serif text-[16px] font-bold text-[#1A1A17] tracking-wide m-0">
            Direct Concierge
          </h4>
          <p className="text-[13px] text-[#524736] leading-relaxed m-0 font-normal">
            Personal guidance for bespoke bridal consultation, bulk cold-pressed oil, or order inquiries.
          </p>

          <div className="pt-1.5 space-y-2">
            <a
              href="https://wa.me/918951789665"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white border border-[#D8CCB5] hover:border-[#25D366] text-[#1A1A17] hover:text-[#15803D] hover:bg-[#F2FBF5] rounded-md text-[12.5px] font-medium transition-all shadow-2xs"
            >
              <MessageCircle size={16} className="text-[#25D366]" />
              <span>WhatsApp: +91 8951789665</span>
            </a>
            <p className="text-[11.5px] text-[#786C58] m-0">
              Assistance Hours: 10:00 AM &ndash; 8:00 PM IST
            </p>
          </div>
        </div>
      </div>

      {/* Verified Pan-India Dispatch & Security Row */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 mt-10 border-t border-[#DFD3BD] flex flex-col sm:flex-row justify-between items-center gap-4 text-[12px] text-[#6B5E4A]">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck size={15} className="text-[#B8892D] shrink-0" />
          <span>Encrypted Checkout &bull; Verified Pan-India Express Delivery &bull; 100% Genuine Provenance</span>
        </div>
        <p className="m-0 text-center sm:text-right">
          &copy; {new Date().getFullYear()} BarakahBazaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
