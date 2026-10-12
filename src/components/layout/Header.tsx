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
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-t-2 border-[var(--accent-bridal)]">
      {/* Top Announcement Bar: Renders ONLY if active notice exists in DB. Default: no bar at all */}
      {activeNotice && (
        <div className="bg-[var(--surface-subtle)] text-[var(--ink)] text-xs py-2 px-4 border-b border-[var(--line)] text-center">
          <p className="max-w-[1200px] mx-auto m-0 font-medium">{activeNotice}</p>
        </div>
      )}

      {/* Main Row: ~64px height */}
      <div className="border-b border-[var(--line)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile menu toggle + Logo (wordmark only) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 text-[var(--ink)] hover:bg-[var(--surface-subtle)] rounded-[2px] cursor-pointer"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            <Link href="/" className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] no-underline">
              Barakah Bazaar
            </Link>
          </div>

          {/* Center: Search (flexible width, square button) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-6 relative items-stretch"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search for bridal lehengas, spices, oils..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-white border border-gray-300 rounded-[2px] text-xs text-gray-900 placeholder:text-gray-400 outline-hidden focus:border-[var(--accent-bridal)]"
              />
              <Search
                size={15}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
              />
            </div>
            <button
              type="submit"
              className="ml-2 px-4 h-10 bg-[var(--ink)] hover:bg-[var(--accent-bridal)] text-white text-xs font-medium rounded-[2px] cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>

          {/* Right: Actions (Wishlist, Cart, Account) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden p-2 text-[var(--ink)] hover:bg-[var(--surface-subtle)] rounded-[2px]"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[var(--ink)] hover:text-[var(--accent-bridal)] rounded-[2px] transition-colors no-underline"
            >
              <Heart size={18} strokeWidth={1.5} />
              <span className="text-[12px] font-medium hidden sm:inline">
                Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
              </span>
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart (${cartCount} items)`}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[var(--ink)] hover:text-[var(--accent-bridal)] rounded-[2px] transition-colors no-underline"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="text-[12px] font-medium">
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </span>
            </Link>

            <Link
              href={isLoggedIn ? '/account' : '/login'}
              aria-label={isLoggedIn ? 'Account' : 'Sign in'}
              className="flex items-center gap-1.5 px-2 py-1.5 text-[var(--ink)] hover:text-[var(--accent-bridal)] rounded-[2px] transition-colors no-underline"
            >
              <User size={18} strokeWidth={1.5} />
              <span className="text-[12px] font-medium hidden sm:inline">
                {isLoggedIn ? (clientStore.userName ? clientStore.userName.split(' ')[0] : 'Account') : 'Sign in'}
              </span>
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

          <nav aria-label="Drawer category navigation" className="flex flex-col gap-1 mt-2">
            {CATEGORY_NAV_LINKS.map((link) => {
              const isActive = activeCategory?.href === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    borderLeftColor: isActive ? link.accent : 'transparent',
                  }}
                  className={clsx(
                    'flex items-center justify-between p-3 text-sm font-medium border-l-2 no-underline transition-colors',
                    isActive
                      ? 'bg-[var(--surface-subtle)] text-[var(--ink)] font-semibold'
                      : 'text-[var(--ink)] hover:bg-[var(--surface-subtle)]'
                  )}
                >
                  <span>{link.label}</span>
                  <ChevronRight size={15} className="text-[var(--ink-muted)]" />
                </Link>
              );
            })}
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
