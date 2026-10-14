'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Search, Heart, ShoppingBag, User, Menu, ChevronRight, ChevronDown } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { clientStore } from '@/lib/store';

export interface CategoryNavLink {
  href: string;
  label: string;
  accent: string;
}

export const CATEGORY_NAV_LINKS: CategoryNavLink[] = [
  {
    href: '/bridal',
    label: 'Barakah Bridal Collections',
    accent: 'var(--accent-bridal)',
  },
  {
    href: '/naturals',
    label: 'Barakah Naturals',
    accent: 'var(--accent-naturals)',
  },
  {
    href: '/coconut-oil',
    label: 'Barakah Kerala Pure Coconut Oil',
    accent: 'var(--accent-coconut)',
  },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkState = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          clientStore.setAuth(true, data.profile?.name);

          // fetch cart
          const cartRes = await fetch('/api/cart');
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const totalQty = (cartData.items || []).reduce(
              (acc: number, item: { qty: number }) => acc + item.qty,
              0
            );
            clientStore.setCartCount(totalQty);
          }

          // fetch wishlist
          const wishRes = await fetch('/api/wishlist');
          if (wishRes.ok) {
            const wishData = await wishRes.json();
            clientStore.setWishlistCount((wishData.productIds || []).length);
          }
        }
      } catch {
        // guest mode
      }

      // Check for active site notice from DB
      try {
        const noticeRes = await fetch('/api/site-notices');
        if (noticeRes.ok) {
          const noticeData = await noticeRes.json();
          if (noticeData.notice?.text) {
            setActiveNotice(noticeData.notice.text);
          }
        }
      } catch {
        // No notice
      }
    };

    checkState();

    const unsubscribe = clientStore.subscribe(() => {
      setCartCount(clientStore.cartCount);
      setWishlistCount(clientStore.wishlistCount);
      setIsLoggedIn(clientStore.isLoggedIn);
    });

    return unsubscribe;
  }, []);

  const getActiveCategory = () => {
    for (const link of CATEGORY_NAV_LINKS) {
      if (pathname === link.href || pathname.startsWith(`${link.href}/`)) {
        return link;
      }
    }
    return null;
  };

  const activeCategory = getActiveCategory();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-t-2 border-[#C89B3C]">
      {/* Signature Arabian Gold Top Ribbon matching reference site exactly */}
      <div className="h-[34px] bg-gradient-to-r from-[#a77418] via-[#d1a44c] to-[#a77418] text-white flex items-center justify-around text-[11px] font-bold tracking-[0.4px] px-4 shadow-2xs">
        <span className="flex items-center gap-1.5">✨ Free Delivery on Orders Above ₹1,499</span>
        <span className="hidden sm:inline">🔒 100% Secure Payments</span>
        <span className="hidden md:inline">⭐ Trusted by Thousands</span>
        <a
          href="https://wa.me/918971896965"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-white flex items-center gap-1 font-semibold"
        >
          <span>📞</span> +91 8971896965
        </a>
      </div>

      {/* Top Announcement Bar: Renders ONLY if active notice exists in DB */}
      {activeNotice && (
        <div className="bg-[var(--surface-subtle)] text-[var(--ink)] text-xs py-2 px-4 border-b border-[var(--line)] text-center">
          <p className="max-w-[1200px] mx-auto m-0 font-medium">{activeNotice}</p>
        </div>
      )}

      {/* Main Nav: Exactly matching reference index.html (.nav) */}
      <div className="h-[86px] bg-[rgba(255,253,249,0.96)] backdrop-blur-[15px] border-b border-[#EADFC8] sticky top-0 z-50 px-[4.5%] flex items-center justify-between gap-4">
        {/* Left: Desktop Nav Links (or mobile hamburger) */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 text-[#241F17] hover:bg-[#FAF6EE] rounded-full border border-[#EADFC8] cursor-pointer"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>

          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-7">
            <Link
              href="/"
              className={clsx(
                'font-serif text-[13px] font-semibold tracking-wide transition-colors no-underline',
                pathname === '/' ? 'text-[#9A7025] underline decoration-[#C89B3C] underline-offset-8' : 'text-[#241F17] hover:text-[#9A7025]'
              )}
            >
              Home
            </Link>
            <Link
              href="/#collections"
              className="font-serif text-[13px] font-semibold tracking-wide text-[#241F17] hover:text-[#9A7025] transition-colors no-underline"
            >
              Shop
            </Link>
            <div className="relative group">
              <Link
                href="/#collections"
                className="font-serif text-[13px] font-semibold tracking-wide text-[#241F17] hover:text-[#9A7025] transition-colors no-underline inline-flex items-center gap-1.5"
              >
                <span>Categories</span>
                <ChevronDown size={12} strokeWidth={2.2} className="text-[#C89B3C] group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              {/* Dropdown Menu */}
              <div className="absolute left-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                <div className="bg-white border border-[#EADFC8] rounded-md shadow-lg py-2 min-w-[200px]">
                  <Link
                    href="/coconut-oil"
                    className="block px-4 py-2 text-xs font-serif text-[#241F17] hover:bg-[#FAF6EE] hover:text-[#9A7025] no-underline"
                  >
                    Kerala Pure Coconut Oil
                  </Link>
                  <Link
                    href="/bridal"
                    className="block px-4 py-2 text-xs font-serif text-[#241F17] hover:bg-[#FAF6EE] hover:text-[#9A7025] no-underline"
                  >
                    Bridal Collection
                  </Link>
                  <Link
                    href="/naturals"
                    className="block px-4 py-2 text-xs font-serif text-[#241F17] hover:bg-[#FAF6EE] hover:text-[#9A7025] no-underline"
                  >
                    Barakah Naturals
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/#philosophy"
              className="font-serif text-[13px] font-semibold tracking-wide text-[#241F17] hover:text-[#9A7025] transition-colors no-underline"
            >
              About Us
            </Link>
          </nav>
        </div>

        {/* Center: Brand Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block text-center group no-underline min-w-[200px] sm:min-w-[240px]">
            <span className="font-serif text-[27px] sm:text-[29px] font-bold text-[#9b6d1e] tracking-tight block leading-[0.85]">
              BarakahBazaar
            </span>
            <small className="block font-sans text-[7px] sm:text-[7.5px] font-bold tracking-[2px] text-[#756246] uppercase mt-1 sm:mt-1.5">
              GOODNESS &bull; ELEGANCE &bull; BLESSINGS
            </small>
          </Link>
        </div>

        {/* Right: Search Pill & 3 Circular Buttons matching reference */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Pill */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex relative items-center"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 lg:w-56 h-[37px] pl-4 pr-9 bg-white border border-[#EADFC8] rounded-full text-xs text-[#241F17] placeholder:text-[#8A8273] outline-hidden focus:border-[#C89B3C] transition-all shadow-2xs"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#79591F] hover:text-[#9A7025] cursor-pointer bg-transparent border-0 p-0"
              >
                <Search size={14} strokeWidth={2} />
              </button>
            </div>
          </form>

          <Link
            href="/search"
            aria-label="Search"
            className="md:hidden w-[37px] h-[37px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors"
          >
            <Search size={15} strokeWidth={1.75} />
          </Link>

          {/* Circle 1: User / Profile */}
          <Link
            href={mounted && isLoggedIn ? '/account' : '/login'}
            aria-label={mounted && isLoggedIn ? 'Account' : 'Sign in'}
            className="w-[37px] h-[37px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors no-underline shadow-2xs"
          >
            <User size={15} strokeWidth={1.75} />
          </Link>

          {/* Circle 2: Wishlist */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
            className="w-[37px] h-[37px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors relative no-underline shadow-2xs"
          >
            <Heart size={15} strokeWidth={1.75} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#A51F22] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Circle 3: Cart */}
          <Link
            href="/cart"
            aria-label={`Cart (${cartCount} items)`}
            className="w-[37px] h-[37px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors relative no-underline shadow-2xs"
          >
            <ShoppingBag size={15} strokeWidth={1.75} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#C89B3C] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>



      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Barakah Bazaar"
      >
        <div className="flex flex-col gap-4 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-[var(--surface)] border border-[var(--line)] rounded-[2px] text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-hidden"
            />
            <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </form>

          <nav aria-label="Drawer navigation" className="flex flex-col gap-1 mt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between"
            >
              <span>Home</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/#collections"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between"
            >
              <span>Collections</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/#featured"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between"
            >
              <span>Featured</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/#philosophy"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between"
            >
              <span>Our Story</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between"
            >
              <span>Contact Us</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
          </nav>

          <div className="border-t border-[var(--line)] my-2" />

          <div className="flex flex-col gap-1">
            <Link
              href={isLoggedIn ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] rounded-[2px] no-underline flex items-center justify-between"
            >
              <span>{isLoggedIn ? 'Account' : 'Sign in'}</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] rounded-[2px] no-underline flex items-center justify-between"
            >
              <span>My Orders</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] rounded-[2px] no-underline flex items-center justify-between"
            >
              <span>Wishlist ({wishlistCount})</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
          </div>
        </div>
      </Drawer>
    </header>
  );
};
