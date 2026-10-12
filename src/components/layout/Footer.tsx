import React from 'react';
import Link from 'next/link';
import { IndianMotifDivider } from '@/components/ui/IndianMotifDivider';
import { SITE_CONFIG } from '@/lib/config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-[var(--ink-muted)] pt-8 pb-12 mt-16 text-xs border-t border-[var(--line)]">
      {/* 12px-tall flat geometric Indian repeating motif divider above footer content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 mb-8">
        <IndianMotifDivider />
      </div>

      {/* Main Dense Footer Columns */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand Info & Regional Tagline Slot */}
        <div>
          <span className="font-serif text-2xl text-[var(--ink)] font-bold block mb-2">
            Barakah Bazaar
          </span>
          {SITE_CONFIG.regionalTagline ? (
            <p className="text-xs text-[var(--ink)] font-medium mb-2 leading-relaxed">
              {SITE_CONFIG.regionalTagline}
            </p>
          ) : null}
          <p className="text-[var(--ink-muted)] text-xs leading-relaxed mb-4">
            Curated Indian collections across bespoke bridal couture, single-origin natural spices, and pure Kerala coconut oil.
          </p>
        </div>

        {/* Column 1: Shop */}
        <div>
          <span className="text-[var(--ink)] font-bold text-xs uppercase tracking-wider block mb-3">
            Shop
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link
                href="/bridal"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Barakah Bridal Collections
              </Link>
            </li>
            <li>
              <Link
                href="/naturals"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Barakah Naturals
              </Link>
            </li>
            <li>
              <Link
                href="/coconut-oil"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Barakah Kerala Pure Coconut Oil
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Customer Care */}
        <div>
          <span className="text-[var(--ink)] font-bold text-xs uppercase tracking-wider block mb-3">
            Customer Care
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link
                href="/orders"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Track My Order
              </Link>
            </li>
            <li>
              <Link
                href="/policies/returns"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Returns &amp; Exchange
              </Link>
            </li>
            <li>
              <Link
                href="/policies/shipping"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Contact Us
              </Link>
            </li>
            {/* WhatsApp Contact Link (rendered ONLY if number is provided) */}
            {SITE_CONFIG.whatsappNumber ? (
              <li>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-bridal)] hover:underline no-underline font-medium text-emerald-800 transition-colors"
                >
                  WhatsApp Support ({SITE_CONFIG.whatsappNumber})
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Column 3: About & Policies */}
        <div>
          <span className="text-[var(--ink)] font-bold text-xs uppercase tracking-wider block mb-3">
            About
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link
                href="/about"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                About Barakah Bazaar
              </Link>
            </li>
            <li>
              <Link
                href="/policies/privacy"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/policies/terms"
                className="hover:text-[var(--accent-bridal)] hover:underline no-underline transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Verified Payment Row & Legal Notice */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 mt-8 border-t border-[var(--line)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--ink-muted)]">
        <p className="m-0 text-center sm:text-left">
          Secure payments via Razorpay (UPI, cards, netbanking).
        </p>
        <p className="m-0 text-center sm:text-right text-[11px]">
          &copy; {new Date().getFullYear()} Barakah Bazaar. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
