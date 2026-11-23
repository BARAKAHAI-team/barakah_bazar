'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ShoppingBag, Heart, Star, Check, ArrowRight } from 'lucide-react';
import { clientStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';
import { QuickAddModal, QuickAddProductData, QuickAddVariant } from '@/components/shop/QuickAddModal';

export interface FeaturedProductItem {
  id: string;
  variantId: string;
  name: string;
  category: string;
  categorySlug: 'coconut-oil' | 'bridal' | 'naturals';
  slug: string;
  pricePaise: number;
  compareAtPricePaise: number;
  rating: number;
  reviewCount: number;
  images: string[];
  highlights?: string;
  badge?: 'Bestseller' | 'New' | 'Limited' | 'Low stock' | null;
  hasVariants?: boolean;
  stock: number;
  variants?: QuickAddVariant[];
}

export const FEATURED_PRODUCTS_DATA: FeaturedProductItem[] = [
  {
    id: 'prod-oil-500',
    variantId: 'v-oil-500',
    name: 'Kerala Pure Coconut Oil 500ml',
    category: 'KERALA PURE COCONUT OIL',
    categorySlug: 'coconut-oil',
    slug: 'kerala-pure-coconut-oil-500ml',
    pricePaise: 24900,
    compareAtPricePaise: 29900,
    rating: 4.9,
    reviewCount: 68,
    images: [
      '/images/home/products/oil_500ml_a.jpg',
      '/images/home/products/oil_500ml_b.jpg',
      '/images/home/oil/image-5.jpeg',
    ],
    highlights: '500ml · Cold-pressed · Single-origin Kerala',
    badge: 'Bestseller',
    hasVariants: false,
    stock: 24,
  },
  {
    id: 'prod-bridal-suit',
    variantId: 'v-brd-01-M',
    name: 'Emerald Zari Festive Suit',
    category: 'BARAKAH BRIDAL',
    categorySlug: 'bridal',
    slug: 'emerald-zari-bridal-suit',
    pricePaise: 899900,
    compareAtPricePaise: 1299900,
    rating: 4.9,
    reviewCount: 34,
    images: [
      '/images/home/products/bridal_suit_a.jpg',
      '/images/home/products/bridal_suit_b.jpg',
      '/images/home/bridal/image-1.jpeg',
    ],
    highlights: 'Pure Silk Georgette · Gold Zari Needlework',
    badge: 'New',
    hasVariants: true,
    stock: 6,
    variants: [
      { id: 'v-brd-01-XS', size: 'XS', stock: 2, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-01-S', size: 'S', stock: 4, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-01-M', size: 'M', stock: 6, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-01-L', size: 'L', stock: 3, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-01-XL', size: 'XL', stock: 1, pricePaise: 899900, compareAtPricePaise: 1299900 },
    ],
  },
  {
    id: 'prod-candle-rose',
    variantId: 'v-nat-1-std',
    name: 'Artisanal Rose Luxe Candle',
    category: 'BARAKAH NATURALS',
    categorySlug: 'naturals',
    slug: 'trio-rose-love-candles',
    pricePaise: 49900,
    compareAtPricePaise: 69900,
    rating: 4.8,
    reviewCount: 42,
    images: [
      '/images/home/products/candle_rose_a.jpg',
      '/images/home/products/candle_rose_b.jpg',
      '/images/home/barakah/image-1.jpg',
    ],
    highlights: '100% Soy Wax · Pure Damask Rose Essence',
    badge: 'Limited',
    hasVariants: false,
    stock: 12,
  },
  {
    id: 'prod-bridal-lehenga',
    variantId: 'v-brd-04-M',
    name: 'Royal Crimson Bridal Lehenga',
    category: 'BARAKAH BRIDAL',
    categorySlug: 'bridal',
    slug: 'rose-pink-bridal-lehenga',
    pricePaise: 1149900,
    compareAtPricePaise: 1599900,
    rating: 5.0,
    reviewCount: 29,
    images: [
      '/images/home/products/bridal_lehenga_a.jpg',
      '/images/home/bridal/image-7.jpeg',
      '/images/home/bridal/image-4.jpeg',
    ],
    highlights: 'Raw Silk · Antique Tilla Zari Embellishment',
    badge: 'Low stock',
    hasVariants: true,
    stock: 3,
    variants: [
      { id: 'v-brd-04-S', size: 'S', stock: 1, pricePaise: 1149900, compareAtPricePaise: 1599900 },
      { id: 'v-brd-04-M', size: 'M', stock: 3, pricePaise: 1149900, compareAtPricePaise: 1599900 },
      { id: 'v-brd-04-L', size: 'L', stock: 2, pricePaise: 1149900, compareAtPricePaise: 1599900 },
      { id: 'v-brd-04-XL', size: 'XL', stock: 0, pricePaise: 1149900, compareAtPricePaise: 1599900 },
    ],
  },
  {
    id: 'prod-candle-oud',
    variantId: 'v-nat-5-std',
    name: 'Minimalist Ceramic Oud Candle',
    category: 'BARAKAH NATURALS',
    categorySlug: 'naturals',
    slug: 'royal-urli-aura-candle',
    pricePaise: 59900,
    compareAtPricePaise: 84900,
    rating: 4.9,
    reviewCount: 38,
    images: [
      '/images/home/products/candle_oud_a.jpg',
      '/images/home/products/candle_oud_b.jpg',
      '/images/home/barakah/image-3.jpg',
    ],
    highlights: 'Pure Soy Wax · Natural Assam Oud Aroma',
    badge: null,
    hasVariants: false,
    stock: 15,
  },
  {
    id: 'prod-oil-300',
    variantId: 'v-oil-300',
    name: 'Kerala Pure Coconut Oil 300ml',
    category: 'KERALA PURE COCONUT OIL',
    categorySlug: 'coconut-oil',
    slug: 'kerala-pure-coconut-oil-300ml',
    pricePaise: 14900,
    compareAtPricePaise: 19900,
    rating: 4.9,
    reviewCount: 52,
    images: [
      '/images/home/products/oil_300ml_a.jpg',
      '/images/home/products/oil_300ml_b.jpg',
      '/images/home/oil/image-2.jpeg',
    ],
    highlights: '300ml · Unrefined · Traditional Cold-Pressed',
    badge: null,
    hasVariants: false,
    stock: 45,
  },
  {
    id: 'prod-sage-suit',
    variantId: 'v-brd-02-M',
    name: 'Sage Green Heritage Suit',
    category: 'BARAKAH BRIDAL',
    categorySlug: 'bridal',
    slug: 'sage-green-heritage-suit',
    pricePaise: 899900,
    compareAtPricePaise: 1299900,
    rating: 4.9,
    reviewCount: 28,
    images: [
      '/images/home/bridal/image-2.jpeg',
      '/images/home/bridal/image-10.jpeg',
      '/images/bridal/bridal-02.jpeg',
    ],
    highlights: 'Chanderi Silk · Banarasi Gota Patti Borders',
    badge: null,
    hasVariants: true,
    stock: 8,
    variants: [
      { id: 'v-brd-02-XS', size: 'XS', stock: 2, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-02-S', size: 'S', stock: 5, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-02-M', size: 'M', stock: 8, pricePaise: 899900, compareAtPricePaise: 1299900 },
      { id: 'v-brd-02-L', size: 'L', stock: 4, pricePaise: 899900, compareAtPricePaise: 1299900 },
    ],
  },
  {
    id: 'prod-pepper-tellicherry',
    variantId: 'v-pep-200',
    name: 'Tellicherry Bold Black Pepper',
    category: 'BARAKAH NATURALS',
    categorySlug: 'naturals',
    slug: 'tellicherry-black-pepper',
    pricePaise: 28000,
    compareAtPricePaise: 35000,
    rating: 5.0,
    reviewCount: 36,
    images: [
      '/images/home/barakah/image-3.jpg',
      '/images/home/barakah/image-4.jpg',
    ],
    highlights: '200g · TGSEB Grade · Malabar High Hills',
    badge: null,
    hasVariants: false,
    stock: 20,
  },
];

type CategoryFilter = 'all' | 'coconut-oil' | 'bridal' | 'naturals';

// Individual Card Component
const FeaturedProductCard: React.FC<{
  product: FeaturedProductItem;
  onAddToCart: (p: FeaturedProductItem) => void;
  onOpenQuickAdd: (p: FeaturedProductItem) => void;
  isAdding: boolean;
  isAdded: boolean;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, p: FeaturedProductItem) => void;
}> = ({
  product,
  onAddToCart,
  onOpenQuickAdd,
  isAdding,
  isAdded,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const preloadedRef = useRef(false);

  const images = product.images && product.images.length > 0 ? product.images : ['/images/home/barakah_hero_new.jpg'];
  const hasMultipleImages = images.length > 1;
  const isApparel = product.categorySlug === 'bridal';

  // Preload secondary images on first hover or card interaction
  const preloadImages = useCallback(() => {
    if (preloadedRef.current || !hasMultipleImages) return;
    preloadedRef.current = true;
    for (let i = 1; i < images.length; i++) {
      const img = new window.Image();
      img.src = images[i];
    }
  }, [images, hasMultipleImages]);

  // Handle desktop hover cycling
  const handleMouseEnter = () => {
    setIsHovered(true);
    preloadImages();

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !hasMultipleImages) {
      if (hasMultipleImages) setActiveImageIdx(1);
      return;
    }

    // Immediately switch to 2nd image on hover
    setActiveImageIdx(1);

    // If 3+ images, cycle every 1.2s
    if (images.length >= 3) {
      cycleTimerRef.current = setInterval(() => {
        setActiveImageIdx((prev) => (prev + 1) % images.length);
      }, 1200);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
    setActiveImageIdx(0);
  };

  useEffect(() => {
    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, []);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    preloadImages();
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || !hasMultipleImages) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    // Threshold of 35px for swipe
    if (Math.abs(diff) > 35) {
      e.stopPropagation();
      if (diff > 0) {
        // Swiped left -> next image
        setActiveImageIdx((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev image
        setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartXRef.current = null;
  };

  const formatPrice = (paise: number) => {
    return '₹' + Math.round(paise / 100).toLocaleString('en-IN');
  };

  const calculateDiscount = (price: number, comparePrice: number) => {
    if (!comparePrice || comparePrice <= price) return null;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const discount = calculateDiscount(product.pricePaise, product.compareAtPricePaise);
  const isSoldOut = product.stock === 0;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        'group h-full flex flex-col justify-between bg-white rounded-xl overflow-hidden border border-[#E5DAC6] transition-all duration-200 relative select-none',
        // Hover styles strictly scoped to hover-capable devices
        '@media(hover:hover):hover:border-[#B8892D] @media(hover:hover):hover:shadow-[0_12px_32px_rgba(75,56,20,0.1)] @media(hover:hover):hover:-translate-y-1',
        'focus-within:border-[#B8892D] focus-within:ring-2 focus-within:ring-[#B8892D]/20'
      )}
    >
      {/* 1. Image Container: Fixed 4:5 Aspect Ratio */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-[4/5] bg-[#FBF7F0] overflow-hidden"
      >
        <Link
          href={`/${product.categorySlug}/${product.slug}`}
          className="block w-full h-full relative no-underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B8892D] focus-visible:outline-offset-2"
        >
          {images.map((imgSrc, idx) => (
            <img
              key={imgSrc}
              src={imgSrc}
              alt={`${product.name} view ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              className={clsx(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out',
                isApparel ? 'object-top' : 'object-center',
                idx === activeImageIdx ? 'opacity-100 z-1' : 'opacity-0 z-0',
                !hasMultipleImages && isHovered && 'scale-103 transition-transform duration-500'
              )}
            />
          ))}
        </Link>

        {/* Top-Left Badge: Small Uppercase Cream Pill with Gold Text */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="bg-[#FBF7F0] text-[#8A641A] border border-[#B8892D]/40 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-2xs">
              {product.badge}
            </span>
          </div>
        )}

        {/* Wishlist Button: Top-Right Translucent Circle with Gold Pop */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(e, product)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#EADFC8] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 z-10 focus-visible:outline-2 focus-visible:outline-[#B8892D]"
        >
          <Heart
            size={14}
            strokeWidth={2}
            className={clsx(
              'transition-all duration-200',
              isWishlisted ? 'fill-[#B8892D] text-[#B8892D] animate-heart-pop' : 'text-[#79591F] hover:text-[#B8892D]'
            )}
          />
        </button>

        {/* Image Dots Indicator: Bottom Center (Only rendered when 2+ images exist) */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-10 pointer-events-none">
            {images.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={clsx(
                  'h-1 rounded-full transition-all duration-300 shadow-2xs',
                  dotIdx === activeImageIdx
                    ? 'w-3.5 bg-[#B8892D]'
                    : 'w-1 bg-white/70'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Card Content Details: Equal Heights & Pinned CTA */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category Eyebrow: 11-12px letter-spaced darkened gold (4.5:1 WCAG AA) */}
          <span className="text-[11px] font-bold tracking-[1.5px] text-[#8A641A] uppercase block mb-1">
            {product.category}
          </span>

          {/* Product Name: Serif, max 2 lines, 17-18px */}
          <Link
            href={`/${product.categorySlug}/${product.slug}`}
            className="no-underline text-inherit block group/link"
          >
            <h3 className="font-serif font-bold text-[16px] sm:text-[17px] text-[#1A1A17] group-hover/link:text-[#B8892D] transition-colors leading-snug line-clamp-2 min-h-[42px] mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Highlights Line: Short attribute line from data */}
          {product.highlights && (
            <p className="text-[12px] text-[#6b6255] leading-tight line-clamp-1 mb-2 font-normal">
              {product.highlights}
            </p>
          )}

          {/* Rating Row: Star, Rating, Review Count (13px+) */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-[13px] text-[#554e42] mb-2 font-medium">
              <Star size={13} className="fill-[#B8892D] text-[#B8892D]" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 font-normal">({product.reviewCount})</span>
            </div>
          )}

          {/* Price Row: Bold current price, MRP struck through, plain text discount */}
          <div className="flex items-baseline flex-wrap gap-2 mb-1.5">
            <span className="font-serif font-bold text-[18px] sm:text-[19px] text-[#1A1A17]">
              {formatPrice(product.pricePaise)}
            </span>
            {product.compareAtPricePaise > product.pricePaise && (
              <>
                <span className="text-[13px] text-stone-400 line-through font-normal">
                  {formatPrice(product.compareAtPricePaise)}
                </span>
                {discount && (
                  <span className="text-[12px] font-bold text-[#8A641A]">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          {/* Microcopy: Low stock notice or Free Shipping */}
          <div className="text-[11px] mb-3">
            {product.stock < 5 && product.stock > 0 ? (
              <span className="text-amber-700 font-semibold">Only {product.stock} left</span>
            ) : (
              <span className="text-[#786f60]">Free shipping over ₹999</span>
            )}
          </div>
        </div>

        {/* 3. CTA Action Area: Clean "Add to Bag" on all cards */}
        <div className="mt-auto pt-3 border-t border-[#EADFC8]/50">
          {isSoldOut ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-[1.3px] uppercase border border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed text-center select-none"
            >
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              disabled={isAdding}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.hasVariants && (product.variants?.length ?? 0) > 1) {
                  onOpenQuickAdd(product);
                } else {
                  onAddToCart(product);
                }
              }}
              className={clsx(
                'w-full py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-[1.3px] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none shadow-2xs focus-visible:outline-2 focus-visible:outline-[#B8892D]',
                isAdded
                  ? 'border border-emerald-600 bg-emerald-600 text-white'
                  : 'border border-[#B8892D] text-[#8A641A] hover:bg-[#B8892D] hover:text-white hover:shadow-xs active:scale-[0.99]'
              )}
            >
              {isAdding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#8A641A] border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : isAdded ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>Added ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={14} strokeWidth={2} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Section Component
export const FeaturedProductsSection: React.FC = () => {
  const { toast } = useToast();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [modalProduct, setModalProduct] = useState<QuickAddProductData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenQuickAdd = (product: FeaturedProductItem) => {
    const quickAddData: QuickAddProductData = {
      id: product.id,
      name: product.name,
      categorySlug: product.categorySlug,
      slug: product.slug,
      image: product.images[0] || '/placeholder.jpg',
      pricePaise: product.pricePaise,
      compareAtPricePaise: product.compareAtPricePaise,
      variants: product.variants || [
        {
          id: product.variantId,
          pricePaise: product.pricePaise,
          compareAtPricePaise: product.compareAtPricePaise,
          stock: product.stock,
        },
      ],
    };
    setModalProduct(quickAddData);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (product: FeaturedProductItem) => {
    setAddingId(product.id);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: product.variantId,
          qty: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const totalQty = (data.cart?.items || []).reduce(
          (acc: number, item: { qty: number }) => acc + item.qty,
          0
        );
        clientStore.setCartCount(totalQty || clientStore.cartCount + 1);
        toast(`Added "${product.name}" to your bag`, 'success');
        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 1500);
      } else if (res.status === 401) {
        sessionStorage.setItem(
          'bz_pending_action',
          JSON.stringify({
            type: 'cart',
            variantId: product.variantId,
            qty: 1,
          })
        );
        toast('Please log in to add items to your cart.', 'info');
        window.location.href = `/login?next=/${product.categorySlug}/${product.slug}`;
      } else {
        const err = await res.json().catch(() => null);
        toast(err?.error?.message || 'Could not add to cart', 'error');
      }
    } catch {
      toast('Network error while adding to cart', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const toggleWishlist = (e: React.MouseEvent, product: FeaturedProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowWishlisted = !wishlistedIds[product.id];
    setWishlistedIds((prev) => ({ ...prev, [product.id]: isNowWishlisted }));
    clientStore.setWishlistCount(clientStore.wishlistCount + (isNowWishlisted ? 1 : -1));
    toast(
      isNowWishlisted
        ? `Added "${product.name}" to wishlist`
        : `Removed "${product.name}" from wishlist`,
      'info'
    );
  };

  return (
    <section id="featured" className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F2] border-t border-[#EADFC8]/60">
      {/* Container: Centered and Filling the Exactly Matching Section Width */}
      <div className="w-[min(1280px,92%)] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-[620px] mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold tracking-[3px] text-[#8A641A] uppercase mb-2 block">
            HANDPICKED FOR YOU
          </span>
          <h2 className="font-serif text-[clamp(28px,3.8vw,44px)] font-bold text-[#1A1A17] tracking-tight mb-2.5">
            Featured Products
          </h2>
          <div className="w-12 h-[2px] bg-[#B8892D]/60 mx-auto mb-3" />
          <p className="text-[#685c4a] text-[13px] sm:text-[15px] leading-relaxed m-0">
            Timeless Kerala pure coconut oil, regal bridal ensembles, and artisanal scented candles crafted with intention.
          </p>
        </div>

        {/* 1. Grid: Fills Container, 4 Col Desktop, 3 Col Tablet, 2 Col Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {FEATURED_PRODUCTS_DATA.map((product) => (
            <FeaturedProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onOpenQuickAdd={handleOpenQuickAdd}
              isAdding={addingId === product.id}
              isAdded={Boolean(addedIds[product.id])}
              isWishlisted={Boolean(wishlistedIds[product.id])}
              onToggleWishlist={toggleWishlist}
            />
          ))}
        </div>

        {/* Quick Add Option Selector Modal */}
        <QuickAddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={modalProduct}
          onAddedSuccess={() => {
            if (modalProduct) {
              setAddedIds((prev) => ({ ...prev, [modalProduct.id]: true }));
              setTimeout(() => {
                setAddedIds((prev) => ({ ...prev, [modalProduct.id]: false }));
              }, 1500);
            }
          }}
        />

        {/* Bottom Link */}
        <div className="text-center mt-12 sm:mt-14">
          <Link
            href="/#collections"
            className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[1.6px] uppercase text-[#8A641A] hover:text-[#1A1A17] transition-colors no-underline group"
          >
            <span>View all products</span>
            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
