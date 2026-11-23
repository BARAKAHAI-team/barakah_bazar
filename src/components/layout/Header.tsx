'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Search, Heart, ShoppingBag, User, Menu, ChevronRight, ChevronDown, X, TrendingUp } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { clientStore } from '@/lib/store';

import { cleanCategoryName } from '@/lib/catalog/utils';
export { cleanCategoryName };

export interface CategoryNavLink {
  href: string;
  label: string;
  accent: string;
}

export const CATEGORY_NAV_LINKS: CategoryNavLink[] = [
  {
    href: '/bridal',
    label: 'Bridal Collections',
    accent: 'var(--accent-bridal)',
  },
  {
    href: '/naturals',
    label: 'Naturals',
    accent: 'var(--accent-naturals)',
  },
  {
    href: '/coconut-oil',
    label: 'Kerala Pure Coconut Oil',
    accent: 'var(--accent-coconut)',
  },
];

export interface NavCategory {
  slug: string;
  name: string;
  tagline?: string;
  accent?: string;
  imageUrl?: string;
}

export const DEFAULT_NAV_CATEGORIES: NavCategory[] = [
  {
    slug: 'bridal',
    name: 'Bridal Collections',
    tagline: 'Curated bridal couture, festive lehengas & embroidered suits',
  },
  {
    slug: 'naturals',
    name: 'Naturals',
    tagline: 'Artisanal scented candles & single-origin natural spices',
  },
  {
    slug: 'coconut-oil',
    name: 'Kerala Pure Coconut Oil',
    tagline: '100% pure & natural traditional cold-pressed Kerala coconut oil',
  },
];

export const TRENDING_SEARCHES = [
  'Bridal Lehenga',
  'Kerala Coconut Oil',
  'Scented Candles',
  'Temple Jewellery',
  'Organic Spices',
];

const CATEGORIES_CACHE_KEY = 'bz_nav_categories_cache_v4';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [instantResults, setInstantResults] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    category_slug: string;
    price_paise: number;
    image: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const storeDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const moreTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [navCategories, setNavCategories] = useState<NavCategory[]>(
    DEFAULT_NAV_CATEGORIES
  );

  const primaryCategories = navCategories.slice(0, 3);
  const overflowCategories = navCategories.slice(3);
  const isOverflowActive = overflowCategories.some((cat) => pathname?.startsWith(`/${cat.slug}`));

  // Debounced live search query
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setInstantResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.products)) {
            setInstantResults(data.products);
          }
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Store Dropdown Hover / Click Handlers
  const handleStoreMouseEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setStoreDropdownOpen(true);
  };

  const handleStoreMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setStoreDropdownOpen(false);
    }, 180);
  };

  const handleStoreToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setStoreDropdownOpen((prev) => !prev);
  };

  // More Categories Overflow Dropdown Hover / Click Handlers
  const handleMoreMouseEnter = () => {
    if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
    setMoreDropdownOpen(true);
  };

  const handleMoreMouseLeave = () => {
    moreTimerRef.current = setTimeout(() => {
      setMoreDropdownOpen(false);
    }, 180);
  };

  const handleMoreToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
    setMoreDropdownOpen((prev) => !prev);
  };

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target as Node)) {
        setStoreDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStoreDropdownOpen(false);
        setMoreDropdownOpen(false);
        setMobileSearchOpen(false);
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
      if (moreTimerRef.current) clearTimeout(moreTimerRef.current);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setStoreDropdownOpen(false);
    setMoreDropdownOpen(false);
    setMobileSearchOpen(false);
    setSearchDropdownOpen(false);
  }, [pathname]);

  // Sync search input with URL search parameter if user lands on /search?q=...
  useEffect(() => {
    if (typeof window !== 'undefined' && pathname === '/search') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q !== null) {
        setSearchQuery(q);
      }
    }
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 1. Categories: Stale-While-Revalidate
    // Immediate display from cache to prevent flicker, plus single background check on mount
    try {
      const raw = localStorage.getItem(CATEGORIES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.categories) && parsed.categories.length > 0) {
          setNavCategories(parsed.categories);
        }
      }
    } catch {}

    // Single background revalidation on page mount (no polling loop)
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.categories) && data.categories.length > 0) {
          try {
            localStorage.setItem(
              CATEGORIES_CACHE_KEY,
              JSON.stringify({ timestamp: Date.now(), categories: data.categories })
            );
          } catch {}
          setNavCategories(data.categories);
        }
      })
      .catch(() => null);

    // 2. Auth check: ONLY if the user actually has a session cookie
    if (typeof document !== 'undefined' && document.cookie.includes('bz_session=')) {
      const meChecked = sessionStorage.getItem('bz_me_checked');
      if (!meChecked) {
        sessionStorage.setItem('bz_me_checked', '1');
        fetch('/api/me')
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              clientStore.setAuth(true, data.user.name);
              fetch('/api/cart')
                .then((r) => (r.ok ? r.json() : null))
                .then((cData) => {
                  if (cData?.cart?.items) {
                    const totalQty = cData.cart.items.reduce((acc: number, item: any) => acc + item.qty, 0);
                    clientStore.setCartCount(totalQty);
                  }
                })
                .catch(() => null);
            }
          })
          .catch(() => null);
      }
    }

    const handleCategoriesUpdated = () => {
      fetch('/api/categories')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.categories) && data.categories.length > 0) {
            try {
              localStorage.setItem(
                CATEGORIES_CACHE_KEY,
                JSON.stringify({ timestamp: Date.now(), categories: data.categories })
              );
            } catch {}
            setNavCategories(data.categories);
          }
        })
        .catch(() => null);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CATEGORIES_CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed?.categories) && parsed.categories.length > 0) {
            setNavCategories(parsed.categories);
          }
        } catch {}
      }
    };

    window.addEventListener('bz_categories_updated', handleCategoriesUpdated);
    window.addEventListener('storage', handleStorageChange);

    const unsubscribe = clientStore.subscribe(() => {
      setCartCount(clientStore.cartCount);
      setWishlistCount(clientStore.wishlistCount);
      setIsLoggedIn(clientStore.isLoggedIn);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('bz_categories_updated', handleCategoriesUpdated);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/search');
    }
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Detect whether current route is a collection/category page
  const isLandingPage = pathname === '/';
  const isStaticOrUtilityPage = [
    '/about',
    '/contact',
    '/login',
    '/account',
    '/cart',
    '/checkout',
    '/orders',
    '/wishlist',
    '/policies',
    '/search',
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  const isCategoryPage =
    !isLandingPage &&
    !isStaticOrUtilityPage &&
    (['/bridal', '/naturals', '/coconut-oil'].some((p) => pathname.startsWith(p)) ||
      navCategories.some((c) => pathname === `/${c.slug}` || pathname.startsWith(`/${c.slug}/`)) ||
      pathname.split('/').filter(Boolean).length >= 1);

  return (
    <header className="sticky top-0 z-40 transition-all duration-300">
      {/* Main Nav: Luxury Frosted Floating Header with Left-Aligned Logo */}
      <div
        className={clsx(
          'w-full sticky top-0 z-50 px-4 sm:px-[4.5%] flex items-center justify-between gap-4 sm:gap-8 transition-all duration-300',
          scrolled
            ? 'h-[76px] sm:h-[80px] bg-white/95 backdrop-blur-md shadow-[0_4px_25px_rgba(75,56,20,0.06)] border-b border-[#EADFC8]/80'
            : 'h-[96px] sm:h-[106px] lg:h-[112px] bg-white border-b border-[#EADFC8]/40'
        )}
      >
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-1 text-[#241F17] hover:bg-stone-50 rounded-full border border-[#EADFC8] cursor-pointer transition-colors shadow-2xs"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>

          {/* Luxury Left-Aligned Brand Logo - Big & Standalone */}
          <Link href="/" className="flex items-center no-underline group select-none py-1">
            <img
              src="/new-logo.png"
              alt="Barakah Bazaar"
              className={clsx(
                'w-auto object-contain transition-all duration-300 group-hover:scale-[1.03] shrink-0',
                scrolled
                  ? 'h-[64px] sm:h-[70px] lg:h-[74px]'
                  : 'h-[86px] sm:h-[96px] lg:h-[102px]'
              )}
            />
          </Link>
        </div>

        {/* Center: Dynamic Navigation (Landing & Info vs Category / Collection Mode) */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 xl:gap-8" suppressHydrationWarning>
          {isCategoryPage ? (
            /* --- CATEGORY MODE: Direct Collection Switcher (Max 3 direct + "More" dropdown if 4+) --- */
            <>
              <Link
                href="/"
                className="font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 group/nav text-[#241F17] hover:text-[#b98725]"
              >
                Home
                <span className="absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300 w-0 group-hover/nav:w-full" />
              </Link>

              {/* Primary 3 Categories */}
              {primaryCategories.map((cat) => {
                const active = pathname?.startsWith(`/${cat.slug}`);
                return (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    className={clsx(
                      'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 group/nav whitespace-nowrap',
                      active ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                    )}
                  >
                    {cleanCategoryName(cat.name)}
                    <span
                      className={clsx(
                        'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                        active ? 'w-full' : 'w-0 group-hover/nav:w-full'
                      )}
                    />
                  </Link>
                );
              })}

              {/* Overflow Categories "More" Dropdown (when > 3 categories) */}
              {overflowCategories.length > 0 && (
                <div
                  ref={moreDropdownRef}
                  className="relative"
                  onMouseEnter={handleMoreMouseEnter}
                  onMouseLeave={handleMoreMouseLeave}
                >
                  <button
                    type="button"
                    onClick={handleMoreToggle}
                    aria-expanded={moreDropdownOpen}
                    className={clsx(
                      'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 flex items-center gap-1.5 cursor-pointer bg-transparent border-0 group/nav',
                      isOverflowActive || moreDropdownOpen ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                    )}
                  >
                    <span>More</span>
                    <ChevronDown
                      size={13}
                      strokeWidth={2}
                      className={clsx(
                        'transition-transform duration-300',
                        moreDropdownOpen ? 'rotate-180 text-[#b98725]' : 'text-[#8A8273] group-hover/nav:text-[#b98725]'
                      )}
                    />
                    <span
                      className={clsx(
                        'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                        isOverflowActive || moreDropdownOpen ? 'w-full' : 'w-0 group-hover/nav:w-full'
                      )}
                    />
                  </button>

                  {/* Overflow Popover Dropdown Card */}
                  {moreDropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200"
                      style={{ minWidth: '280px' }}
                    >
                      <div className="bg-white/98 backdrop-blur-md border border-[#EADFC8] rounded-xl shadow-[0_16px_40px_rgba(75,56,20,0.12)] p-2">
                        <div className="flex flex-col gap-1">
                          {overflowCategories.map((cat) => {
                            const isItemActive = pathname?.startsWith(`/${cat.slug}`);
                            return (
                              <Link
                                key={cat.slug}
                                href={`/${cat.slug}`}
                                onClick={() => setMoreDropdownOpen(false)}
                                className={clsx(
                                  'group/item flex flex-col p-2.5 rounded-lg transition-all no-underline',
                                  isItemActive ? 'bg-[#FAF6EE] text-[#b98725]' : 'hover:bg-[#FAF6EE] text-[#241F17]'
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span
                                    className={clsx(
                                      'font-serif text-[13px] font-semibold transition-colors leading-tight',
                                      isItemActive ? 'text-[#b98725]' : 'text-[#241F17] group-hover/item:text-[#b98725]'
                                    )}
                                  >
                                    {cleanCategoryName(cat.name)}
                                  </span>
                                  <ChevronRight
                                    size={13}
                                    className={clsx(
                                      'transition-all shrink-0 ml-2',
                                      isItemActive
                                        ? 'text-[#b98725] opacity-100'
                                        : 'text-[#b98725] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0'
                                    )}
                                  />
                                </div>
                                {cat.tagline && (
                                  <p className="text-[11px] text-[#797161] line-clamp-1 mt-0.5 m-0 font-sans">
                                    {cat.tagline}
                                  </p>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* --- LANDING & STATIC MODE: Home, Store Dropdown, About Us, Contact --- */
            <>
              <Link
                href="/"
                className={clsx(
                  'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 group/nav',
                  pathname === '/' ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                )}
              >
                Home
                <span
                  className={clsx(
                    'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                    pathname === '/' ? 'w-full' : 'w-0 group-hover/nav:w-full'
                  )}
                />
              </Link>

              {/* Store Dropdown Menu */}
              <div
                ref={storeDropdownRef}
                className="relative"
                onMouseEnter={handleStoreMouseEnter}
                onMouseLeave={handleStoreMouseLeave}
              >
                <button
                  type="button"
                  onClick={handleStoreToggle}
                  aria-expanded={storeDropdownOpen}
                  className={clsx(
                    'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 flex items-center gap-1.5 cursor-pointer bg-transparent border-0 group/nav',
                    storeDropdownOpen ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                  )}
                >
                  <span>Store</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={clsx(
                      'transition-transform duration-300',
                      storeDropdownOpen ? 'rotate-180 text-[#b98725]' : 'text-[#8A8273] group-hover/nav:text-[#b98725]'
                    )}
                  />
                  <span
                    className={clsx(
                      'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                      storeDropdownOpen ? 'w-full' : 'w-0 group-hover/nav:w-full'
                    )}
                  />
                </button>

                {/* Category Dropdown Menu */}
                {storeDropdownOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 transition-all duration-200"
                    style={{ minWidth: '300px' }}
                  >
                    <div className="bg-white/98 backdrop-blur-md border border-[#EADFC8] rounded-xl shadow-[0_16px_40px_rgba(75,56,20,0.12)] p-2">
                      <div className="flex flex-col gap-1">
                        {navCategories.map((cat) => (
                          <Link
                            key={cat.slug}
                            href={`/${cat.slug}`}
                            onClick={() => setStoreDropdownOpen(false)}
                            className="group/item flex flex-col p-2.5 rounded-lg hover:bg-[#FAF6EE] transition-all no-underline"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-[13px] font-semibold text-[#241F17] group-hover/item:text-[#b98725] transition-colors leading-tight">
                                {cleanCategoryName(cat.name)}
                              </span>
                              <ChevronRight size={13} className="text-[#b98725] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all shrink-0 ml-2" />
                            </div>
                            {cat.tagline && (
                              <p className="text-[11px] text-[#797161] line-clamp-1 mt-0.5 m-0 font-sans">
                                {cat.tagline}
                              </p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* About Us Link */}
              <Link
                href="/about"
                className={clsx(
                  'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 group/nav',
                  pathname === '/about' ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                )}
              >
                About Us
                <span
                  className={clsx(
                    'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                    pathname === '/about' ? 'w-full' : 'w-0 group-hover/nav:w-full'
                  )}
                />
              </Link>

              {/* Contact Link */}
              <Link
                href="/contact"
                className={clsx(
                  'font-sans text-[11px] font-bold tracking-[1.6px] uppercase transition-colors no-underline relative py-1 group/nav',
                  pathname === '/contact' ? 'text-[#b98725]' : 'text-[#241F17] hover:text-[#b98725]'
                )}
              >
                Contact
                <span
                  className={clsx(
                    'absolute bottom-0 left-0 h-[2px] bg-[#b98725] transition-all duration-300',
                    pathname === '/contact' ? 'w-full' : 'w-0 group-hover/nav:w-full'
                  )}
                />
              </Link>
            </>
          )}
        </nav>

        {/* Right: Search Pill & Interactive Circular Action Pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Luxury Desktop Search Pill with Instant Live Dropdown */}
          <div ref={searchContainerRef} className="hidden md:block relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                className={clsx(
                  'relative flex items-center h-[38px] rounded-full border transition-all duration-300',
                  searchFocused
                    ? 'w-60 lg:w-76 bg-white border-[#b98725] shadow-[0_4px_20px_rgba(185,135,37,0.14)] ring-1 ring-[#b98725]/30'
                    : 'w-44 lg:w-56 bg-[#FAF7F2]/90 border-[#EADFC8] hover:border-[#b98725]/60 hover:bg-white shadow-2xs'
                )}
              >
                {/* Left Icon: Magnifying Glass Submit Button */}
                <button
                  type="submit"
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label="Submit search"
                  className="pl-3.5 pr-2 h-full flex items-center justify-center text-[#79591F] hover:text-[#b98725] cursor-pointer bg-transparent border-0 transition-colors shrink-0"
                >
                  <Search size={15} strokeWidth={2} />
                </button>

                {/* Search Input: Clean typography, suppressed webkit native clear button */}
                <input
                  ref={searchInputRef}
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Search products..."
                  value={searchQuery}
                  onFocus={() => {
                    setSearchFocused(true);
                    setSearchDropdownOpen(true);
                  }}
                  onBlur={() => {
                    // Slight timeout so click events on dropdown links can complete
                    setTimeout(() => setSearchFocused(false), 200);
                  }}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchDropdownOpen) setSearchDropdownOpen(true);
                  }}
                  className="w-full h-full bg-transparent text-xs text-[#241F17] placeholder:text-[#8A8273] font-medium outline-hidden pr-8 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />

                {/* Right: Single Clean (X) Button when query has text */}
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchQuery('');
                      setInstantResults([]);
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-stone-200/90 hover:bg-stone-300 text-[#554E43] flex items-center justify-center transition-colors cursor-pointer border-0 p-0"
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </form>

            {/* Instant Live Search Results Popover Dropdown */}
            {searchDropdownOpen && searchFocused && (
              <div
                className="absolute top-full right-0 mt-2 z-50 bg-white/98 backdrop-blur-md border border-[#EADFC8] rounded-xl shadow-[0_16px_40px_rgba(75,56,20,0.14)] p-2.5 transition-all duration-200"
                style={{ width: '320px' }}
              >
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold tracking-[1.5px] uppercase text-[#b98725] flex items-center justify-between">
                      <span>Products</span>
                      {isSearching && <span className="text-[10px] font-normal text-[#8A8273] lowercase">searching...</span>}
                    </div>

                    {instantResults.length > 0 ? (
                      <div className="flex flex-col gap-1 mt-1">
                        {instantResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/${product.category_slug}/${product.slug}`}
                            onClick={() => {
                              setSearchDropdownOpen(false);
                              setSearchFocused(false);
                            }}
                            className="group/prod flex items-center gap-3 p-2 rounded-lg hover:bg-[#FAF6EE] transition-all no-underline"
                          >
                            <div className="w-10 h-10 rounded-md bg-[#FAF6EE] border border-[#EADFC8] overflow-hidden shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#8A8273]">
                                  <Search size={14} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#241F17] group-hover/prod:text-[#b98725] transition-colors truncate m-0 font-sans">
                                {product.name}
                              </p>
                              <span className="text-[11px] font-bold text-[#b98725] block mt-0.5">
                                ₹{(product.price_paise / 100).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-[#8A8273] group-hover/prod:text-[#b98725] shrink-0 opacity-0 group-hover/prod:opacity-100 transition-opacity"
                            />
                          </Link>
                        ))}

                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSearchSubmit(e);
                          }}
                          className="w-full mt-1 pt-2 border-t border-[#EADFC8]/60 pb-0.5 text-center text-xs font-bold text-[#b98725] hover:underline flex items-center justify-center gap-1 cursor-pointer bg-transparent border-0"
                        >
                          <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    ) : !isSearching ? (
                      <div className="py-4 px-2 text-center text-xs text-[#8A8273]">
                        No matching items found. Press Enter to search catalog.
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <div className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-bold tracking-[1.5px] uppercase text-[#b98725] mb-2">
                      <TrendingUp size={12} strokeWidth={2} />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(term);
                            router.push(`/search?q=${encodeURIComponent(term)}`);
                            setSearchDropdownOpen(false);
                            setSearchFocused(false);
                          }}
                          className="px-2.5 py-1 bg-[#FAF6EE] hover:bg-[#b98725] text-[#241F17] hover:text-white border border-[#EADFC8] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button (Toggles Mobile Search Bar) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle search"
            className={clsx(
              'md:hidden w-[36px] h-[36px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer',
              mobileSearchOpen ? 'border-[#b98725] bg-[#FAF6EE] text-[#b98725]' : 'text-[#79591F] hover:border-[#b98725]'
            )}
          >
            <Search size={15} strokeWidth={1.75} />
          </button>

          {/* Action 1: User / Profile */}
          <Link
            href={mounted && isLoggedIn ? '/account' : '/login'}
            aria-label={mounted && isLoggedIn ? 'Account' : 'Sign in'}
            className="w-[36px] sm:w-[38px] h-[36px] sm:h-[38px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#b98725] hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 transition-all no-underline shadow-2xs relative"
            title={mounted && isLoggedIn ? 'Your Account' : 'Sign In'}
          >
            <User size={15} strokeWidth={1.75} />
            {mounted && isLoggedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-0.5 right-0.5 border border-white" />
            )}
          </Link>

          {/* Action 2: Wishlist */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
            className="hidden sm:flex w-[38px] h-[38px] rounded-full border border-[#EADFC8] bg-white items-center justify-center text-[#79591F] hover:border-[#b98725] hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 transition-all relative no-underline shadow-2xs"
          >
            <Heart size={15} strokeWidth={1.75} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#A51F22] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Action 3: Bag / Cart */}
          <Link
            href="/cart"
            aria-label={`Cart (${cartCount} items)`}
            className="w-[36px] sm:w-[38px] h-[36px] sm:h-[38px] rounded-full border border-[#EADFC8] bg-white flex items-center justify-center text-[#79591F] hover:border-[#b98725] hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 transition-all relative no-underline shadow-2xs"
          >
            <ShoppingBag size={15} strokeWidth={1.75} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#b98725] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Inline Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden w-full bg-white/98 backdrop-blur-md border-b border-[#EADFC8] px-4 py-3 shadow-md">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="search"
                autoFocus
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-9 bg-[#FAF7F2] border border-[#EADFC8] rounded-full text-xs text-[#241F17] placeholder:text-[#8A8273] outline-hidden focus:border-[#b98725] focus:bg-white [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              <Search size={15} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#79591F]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-stone-200 text-[#554E43] flex items-center justify-center p-0 cursor-pointer border-0"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-[#b98725] hover:bg-[#a6771d] text-white rounded-full text-xs font-bold tracking-wide transition-colors shrink-0 shadow-xs cursor-pointer border-0"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Barakah Bazaar"
      >
        <div className="flex flex-col gap-4 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-20 bg-[var(--surface)] border border-[var(--line)] rounded-[2px] text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-hidden focus:border-[#b98725]"
            />
            <Search size={15} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
            <button
              type="submit"
              className="absolute right-1 top-1 h-8 px-3 bg-[#b98725] hover:bg-[#a6771d] text-white text-[11px] font-bold rounded-[2px] cursor-pointer"
            >
              Search
            </button>
          </form>

          <nav aria-label="Drawer navigation" className="flex flex-col gap-1 mt-2" suppressHydrationWarning>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between rounded-[4px]"
            >
              <span>Home</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>

            {/* Shop Section Header */}
            <div className="pt-2 pb-1 px-3">
              <span className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#b98725]">
                Store / Categories
              </span>
            </div>

            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="pl-5 pr-3 py-2 text-xs text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between rounded-[4px]"
              >
                <span>{cleanCategoryName(cat.name)}</span>
                <ChevronRight size={14} className="text-[var(--ink-muted)]" />
              </Link>
            ))}

            <div className="border-t border-[#EADFC8]/40 my-2" />

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between rounded-[4px]"
            >
              <span>About Us</span>
              <ChevronRight size={15} className="text-[var(--ink-muted)]" />
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm text-[var(--ink)] hover:bg-[var(--surface-subtle)] font-medium no-underline flex items-center justify-between rounded-[4px]"
            >
              <span>Contact</span>
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
