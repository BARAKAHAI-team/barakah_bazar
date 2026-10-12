import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] pt-12 pb-12 mt-16 text-xs">
      {/* Main Footer Links */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="font-serif text-xl text-[var(--ink)] font-bold block mb-2">
            Barakah Bazaar
          </span>
          <p className="text-[var(--ink-muted)] text-xs leading-relaxed mb-4">
            Curated Indian collections across bridal wear, natural farm produce, and pure Kerala coconut oil.
          </p>
        </div>

        <div>
          <span className="text-[var(--ink)] font-semibold text-xs uppercase tracking-wider block mb-3">
            Categories
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link href="/bridal" className="hover:text-[var(--ink)] hover:underline no-underline">
                Barakah Bridal Collections
              </Link>
            </li>
            <li>
              <Link href="/naturals" className="hover:text-[var(--ink)] hover:underline no-underline">
                Barakah Naturals
              </Link>
            </li>
            <li>
              <Link href="/coconut-oil" className="hover:text-[var(--ink)] hover:underline no-underline">
                Barakah Kerala Pure Coconut Oil
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <span className="text-[var(--ink)] font-semibold text-xs uppercase tracking-wider block mb-3">
            Customer Care
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link href="/orders" className="hover:text-[var(--ink)] hover:underline no-underline">
                Track My Order
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="hover:text-[var(--ink)] hover:underline no-underline">
                Returns &amp; Exchange
              </Link>
            </li>
            <li>
              <Link href="/policies/shipping" className="hover:text-[var(--ink)] hover:underline no-underline">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--ink)] hover:underline no-underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <span className="text-[var(--ink)] font-semibold text-xs uppercase tracking-wider block mb-3">
            Policies
          </span>
          <ul className="list-none p-0 m-0 space-y-2 text-[var(--ink-muted)]">
            <li>
              <Link href="/policies/privacy" className="hover:text-[var(--ink)] hover:underline no-underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms" className="hover:text-[var(--ink)] hover:underline no-underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--ink)] hover:underline no-underline">
                About Barakah Bazaar
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-[var(--line)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--ink-muted)]">
        <p className="m-0">&copy; 2026 Barakah Bazaar. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/policies/privacy" className="hover:text-[var(--ink)] hover:underline no-underline">
            Privacy
          </Link>
          <Link href="/policies/terms" className="hover:text-[var(--ink)] hover:underline no-underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
