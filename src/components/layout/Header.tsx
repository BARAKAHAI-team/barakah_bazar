'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Search, Heart, ShoppingBag, User, Menu, ChevronRight } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  useEffect(() => {
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
      {/* Signature Arabian Gold Top Ribbon from reference site */}
      <div className="bg-gradient-to-r from-[#8F681F] via-[#C89B3C] to-[#8F681F] text-white text-[11px] py-1.5 px-4 tracking-wide shadow-2xs">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <span className="hidden sm:inline font-medium">✨ Free Pan-India Delivery on Orders Above ₹1,499</span>
          <span className="mx-auto sm:mx-0 font-bold tracking-[0.18em] uppercase text-[10px] sm:text-[11px]">
            GOODNESS &bull; ELEGANCE &bull; BLESSINGS
          </span>
          <a
            href="https://wa.me/918951789665"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline hover:underline text-white font-semibold text-[11px]"
          >
            WhatsApp Support: +91 8951789665
          </a>
        </div>
      </div>

      {/* Top Announcement Bar: Renders ONLY if active notice exists in DB */}
      {activeNotice && (
        <div className="bg-[var(--surface-subtle)] text-[var(--ink)] text-xs py-2 px-4 border-b border-[var(--line)] text-center">
          <p className="max-w-[1200px] mx-auto m-0 font-medium">{activeNotice}</p>
        </div>
      )}

      {/* Main Row: Refined Navigation with Georgia Links & Circular Gold Buttons */}
      <div className="border-b border-[#EADFC8] bg-[#FFFDF9]/98 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Left: Mobile menu toggle + Logo with tagline */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-2 text-[#241F17] hover:bg-[#FAF6EE] rounded-full border border-[#EADFC8] cursor-pointer"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>

            <Link href="/" className="group no-underline">
              <span className="font-serif text-2xl sm:text-[26px] font-bold tracking-tight text-[#9A7025] group-hover:text-[#805B18] transition-colors block leading-none">
                Barakah Bazaar
              </span>
              <small className="block font-sans text-[7.5px] sm:text-[8.5px] font-extrabold tracking-[0.22em] text-[#756246] uppercase mt-1">
                GOODNESS &bull; ELEGANCE &bull; BLESSINGS
              </small>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Non-category links) */}
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
              Collections
            </Link>
            <Link
              href="/#featured"
              className="font-serif text-[13px] font-semibold tracking-wide text-[#241F17] hover:text-[#9A7025] transition-colors no-underline"
            >
              Featured
            </Link>
            <Link
              href="/#philosophy"
              className="font-serif text-[13px] font-semibold tracking-wide text-[#241F17] hover:text-[#9A7025] transition-colors no-underline"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className={clsx(
                'font-serif text-[13px] font-semibold tracking-wide transition-colors no-underline',
                pathname === '/contact' ? 'text-[#9A7025] underline decoration-[#C89B3C] underline-offset-8' : 'text-[#241F17] hover:text-[#9A7025]'
              )}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right: Search Pill & Circular Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Pill */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex relative items-center"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 lg:w-52 h-9 pl-8 pr-3 bg-white border border-[#EADFC8] rounded-full text-xs text-[#241F17] placeholder:text-[#8A8273] outline-hidden focus:border-[#C89B3C] focus:w-60 transition-all shadow-2xs"
                />
                <Search
                  size={14}
                  strokeWidth={1.75}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A7025] pointer-events-none"
                />
              </div>
            </form>

            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden w-9 h-9 rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors"
            >
              <Search size={16} strokeWidth={1.75} />
            </Link>

            {/* Circular Wishlist Button */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="w-9 h-9 rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors relative no-underline shadow-2xs"
            >
              <Heart size={16} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#A51F22] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Circular Cart Button */}
            <Link
              href="/cart"
              aria-label={`Cart (${cartCount} items)`}
              className="w-9 h-9 rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors relative no-underline shadow-2xs"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#C89B3C] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Circular Account Button */}
            <Link
              href={isLoggedIn ? '/account' : '/login'}
              aria-label={isLoggedIn ? 'Account' : 'Sign in'}
              className="w-9 h-9 rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#C89B3C] hover:bg-[#FAF6EE] transition-colors no-underline shadow-2xs"
            >
              <User size={16} strokeWidth={1.75} />
            </Link>
          </div>
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
