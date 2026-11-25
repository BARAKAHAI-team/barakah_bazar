'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowUpRight, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#F6F2E9] text-[#2C2419] pt-6 pb-4 mt-8 text-xs border-t-2 border-[#B8892D]">
      {/* Main 4-Column Grid */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Brand Column (Span 4) */}
        <div className="md:col-span-4 space-y-2.5">
          <Link href="/" className="inline-block no-underline group select-none">
            <img
              src="/new-logo.png"
              alt="Barakah Bazaar"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
            />
          </Link>

          <p className="text-[12.5px] text-[#524736] leading-relaxed max-w-sm m-0 font-normal">
            A luxury sanctuary for 100% pure Kerala cold-pressed coconut oil, regal bespoke bridal couture, and botanical hand-poured soy candles.
          </p>

          {/* Core Pillars: Pure • Halal • Trusted */}
          <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 bg-white border border-[#D8CCB5] rounded text-[10.5px] text-[#8C6418] font-semibold tracking-wide">
              Pure
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-white border border-[#D8CCB5] rounded text-[10.5px] text-[#8C6418] font-semibold tracking-wide">
              Halal
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 bg-white border border-[#D8CCB5] rounded text-[10.5px] text-[#8C6418] font-semibold tracking-wide">
              Trusted
            </span>
          </div>
        </div>

        {/* Column 2: Signature Collections (Span 3) */}
        <div className="md:col-span-3 space-y-2.5">
          <h4 className="font-serif text-[15px] font-bold text-[#1A1A17] tracking-wide m-0">
            Signature Collections
          </h4>
          <ul className="list-none p-0 m-0 space-y-1.5 text-[12.5px]">
            <li>
              <Link
                href="/coconut-oil"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Kerala Pure Coconut Oil</span>
                <ArrowUpRight size={13} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/bridal"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Bridal Collections</span>
                <ArrowUpRight size={13} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/naturals"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Naturals</span>
                <ArrowUpRight size={13} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
            <li>
              <Link
                href="/#why-barakah"
                className="text-[#4D4233] hover:text-[#B8892D] transition-colors no-underline flex items-center justify-between group/link py-0.5"
              >
                <span>Why BarakahBazar</span>
                <ArrowUpRight size={13} className="text-[#968974] group-hover/link:text-[#B8892D] transition-colors" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care (Span 2) */}
        <div className="md:col-span-2 space-y-2.5">
          <h4 className="font-serif text-[15px] font-bold text-[#1A1A17] tracking-wide m-0">
            Customer Care
          </h4>
          <ul className="list-none p-0 m-0 space-y-1.5 text-[12.5px]">
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

        {/* Column 4: Customer Support (Span 3) */}
        <div className="md:col-span-3 space-y-2.5">
          <h4 className="font-serif text-[15px] font-bold text-[#1A1A17] tracking-wide m-0">
            Customer Support
          </h4>
          <p className="text-[12.5px] text-[#524736] leading-relaxed m-0 font-normal">
            For order assistance, product inquiries, or support, reach out to us via email:
          </p>
          <a
            href="mailto:barakahbazaar786@gmail.com"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D8CCB5] hover:border-[#B8892D] text-[#1A1A17] hover:text-[#8C6418] rounded-md text-[12px] font-medium transition-colors no-underline shadow-2xs break-all"
          >
            <Mail size={14} className="text-[#B8892D] shrink-0" />
            <span>Email: barakahbazaar786@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Verified Pan-India Dispatch, Attribution & Copyright Row */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 mt-5 border-t border-[#DFD3BD] flex flex-col lg:flex-row justify-between items-center gap-3 text-[11.5px] text-[#6B5E4A]">
        <div className="flex items-center gap-2 text-center lg:text-left">
          <ShieldCheck size={14} className="text-[#B8892D] shrink-0" />
          <span>Encrypted Checkout &bull; Verified Pan-India Express Delivery &bull; 100% Genuine Provenance</span>
        </div>

        <a
          href="https://barakahai.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#D8CCB5] hover:border-[#B8892D] shadow-2xs transition-all duration-200 no-underline group shrink-0"
        >
          <span className="text-[9.5px] font-semibold tracking-[1.6px] uppercase text-[#6B5E4A]">
            DESIGNED &amp; DEVELOPED BY
          </span>
          <span className="h-3 w-[1px] bg-[#D8CCB5]" aria-hidden="true" />
          <span className="text-[12px] font-bold tracking-tight text-[#1A1A17]">
            Barakah<span className="text-[#B8892D] group-hover:text-[#8C6418] transition-colors">AI</span>
          </span>
        </a>

        <div className="text-center lg:text-right space-y-0.5 shrink-0">
          <p className="m-0 font-medium text-[#4D4233]">Barakah Bazaar is operated by BARAKAH AI.</p>
          <p className="m-0">&copy; 2026 BARAKAH AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
