'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Check, 
  ChevronDown, 
  MessageCircle
} from 'lucide-react';
import { CatalogProduct } from '@/lib/catalog/types';
import { Price } from '@/components/ui/Price';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { isUserLoggedIn, redirectToLogin } from '@/lib/auth/require-login';
import { QuickAddModal, QuickAddProductData } from '@/components/shop/QuickAddModal';

interface CoconutOilClientPageProps {
  initialProducts: CatalogProduct[];
}

export const CoconutOilClientPage: React.FC<CoconutOilClientPageProps> = ({ initialProducts }) => {
  const { toast } = useToast();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Cart & Modal State
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [modalProduct, setModalProduct] = useState<QuickAddProductData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subcategory filters
  const subCategories = ['All', 'Cold-Pressed Coconut Oil', 'Roasted Uruli Coconut Oil', 'Ayurvedic Hair Care'];

  // Map high-res curated image paths for best visual quality
  const getProductImage = (product: CatalogProduct, index: number = 0): string => {
    if (product.slug.includes('500ml') && !product.slug.includes('uruli')) {
      return index === 0 ? '/images/home/products/oil_500ml_a.jpg' : '/images/home/products/oil_500ml_b.jpg';
    }
    if (product.slug.includes('300ml')) {
      return index === 0 ? '/images/home/products/oil_300ml_a.jpg' : '/images/home/products/oil_300ml_b.jpg';
    }
    if (product.slug.includes('1-litre')) {
      return index === 0 ? '/images/oil/product-4.jpeg' : '/images/oil/product-1.jpeg';
    }
    if (product.slug.includes('uruli')) {
      return index === 0 ? '/images/oil/product-5.jpeg' : '/images/home/category_coconut_oil.jpg';
    }
    if (product.slug.includes('hair-oil')) {
      return index === 0 ? '/images/oil/product-2.jpeg' : '/images/oil/product-3.jpeg';
    }
    return product.images?.[index]?.storage_path || '/images/home/products/oil_500ml_a.jpg';
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Subcategory Filter
    if (selectedSubCategory !== 'All') {
      result = result.filter(
        (p) => (p.attributes as Record<string, string>)?.sub_category === selectedSubCategory
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.variants[0].price_paise - b.variants[0].price_paise);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.variants[0].price_paise - a.variants[0].price_paise);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating?.avg_rating || 0) - (a.rating?.avg_rating || 0));
    }

    return result;
  }, [initialProducts, selectedSubCategory, sortBy]);

  const handleAddToCart = async (product: CatalogProduct) => {
    const targetVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
    if (!targetVariant || targetVariant.stock === 0) {
      toast('This bottle is currently out of stock.', 'info');
      return;
    }

    if (!isUserLoggedIn()) {
      redirectToLogin(
        { type: 'cart', productId: product.id, variantId: targetVariant.id, qty: 1 },
        `/${product.category_slug}/${product.slug}`,
        toast,
        'Please log in to add items to your cart.'
      );
      return;
    }

    setAddingId(product.id);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: targetVariant.id,
          variant_id: targetVariant.id,
          qty: 1,
          quantity: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const total = typeof data?.totalItems === 'number' ? data.totalItems : clientStore.cartCount + 1;
        clientStore.setCartCount(total);
        clientStore.setAuth(true);

        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        toast(`Added "${product.name}" to your bag`, 'success');

        setTimeout(() => {
          setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 1500);
      } else if (res.status === 401) {
        sessionStorage.setItem(
          'bz_pending_action',
          JSON.stringify({
            type: 'cart',
            productId: product.id,
            variantId: targetVariant.id,
            qty: 1,
          })
        );
        toast('Please log in to add items to your cart.', 'info');
        window.location.href = `/login?next=/${product.category_slug}/${product.slug}`;
      } else {
        const err = await res.json().catch(() => null);
        toast(err?.error?.message || 'Could not add to cart', 'error');
      }
    } catch {
      toast('Network error while adding to bag', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const handleOpenQuickAdd = (product: CatalogProduct) => {
    if (!isUserLoggedIn()) {
      const targetVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
      redirectToLogin(
        { type: 'cart', productId: product.id, variantId: targetVariant?.id, qty: 1 },
        `/${product.category_slug}/${product.slug}`,
        toast,
        'Please log in to add items to your cart.'
      );
      return;
    }

    const quickAddData: QuickAddProductData = {
      id: product.id,
      name: product.name,
      categorySlug: product.category_slug,
      slug: product.slug,
      image: getProductImage(product, 0),
      pricePaise: product.variants[0].price_paise,
      compareAtPricePaise: product.variants[0].compare_at_price_paise,
      variants: product.variants.map((v) => ({
        id: v.id,
        packSize: (v.option_values?.['Pack size'] as string) || (v.option_values?.['Volume'] as string) || v.label,
        label: v.label,
        pricePaise: v.price_paise,
        compareAtPricePaise: v.compare_at_price_paise,
        stock: v.stock,
      })),
    };
    setModalProduct(quickAddData);
    setIsModalOpen(true);
  };

  const handleWishlistToggle = async (e: React.MouseEvent, product: CatalogProduct) => {
    e.preventDefault();
    e.stopPropagation();

    if (!clientStore.isLoggedIn) {
      sessionStorage.setItem(
        'bz_pending_action',
        JSON.stringify({ type: 'wishlist', productId: product.id })
      );
      toast('Please log in to save items to your wishlist.', 'info');
      window.location.href = `/login?next=/${product.category_slug}/${product.slug}`;
      return;
    }

    const isNowWishlisted = !wishlistedIds[product.id];
    setWishlistedIds((prev) => ({ ...prev, [product.id]: isNowWishlisted }));

    try {
      if (isNowWishlisted) {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        clientStore.setWishlistCount(clientStore.wishlistCount + 1);
        toast(`Added "${product.name}" to wishlist`, 'success');
      } else {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' });
        clientStore.setWishlistCount(Math.max(0, clientStore.wishlistCount - 1));
        toast(`Removed from wishlist`, 'info');
      }
    } catch {
      toast('Unable to update wishlist', 'error');
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1A17] overflow-x-hidden min-h-screen">
      {/* CLEAN EDITORIAL HEADER */}
      <section className="bg-white border-b border-[#EADFC8]/60 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-[700px]">
            <span className="text-[11px] font-bold tracking-[2.5px] text-[#8A641A] uppercase mb-2 block">
              HERITAGE OIL
            </span>
            <h1 className="font-serif text-[32px] sm:text-[42px] font-bold text-[#1A1A17] tracking-tight mb-3">
              Kerala Pure Coconut Oil
            </h1>
            <p className="text-[#5F5545] text-sm sm:text-base leading-relaxed m-0">
              Authentic Kerala cold-pressed virgin coconut oil, hand-harvested from coastal groves for hair, skin, and culinary wellness.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SUB-CATEGORY TABS & SORT BAR */}
      <section className="pt-6 pb-4 bg-[#FAF7F2] border-b border-[#EADFC8]/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {subCategories.map((cat) => {
                const isActive = selectedSubCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedSubCategory(cat)}
                    className={clsx(
                      'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border select-none',
                      isActive
                        ? 'bg-[#1A1A17] text-white border-[#1A1A17] shadow-xs'
                        : 'bg-white text-[#5F5545] border-[#DCD0BB] hover:border-[#B8892D] hover:text-[#1A1A17]'
                    )}
                  >
                    {cat === 'All' ? 'All Oils (5)' : cat}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <span className="text-xs text-stone-500 font-medium">Sort By:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white border border-[#DCD0BB] hover:border-[#B8892D] rounded-lg px-3.5 py-1.5 pr-8 text-xs font-semibold text-[#1A1A17] outline-hidden cursor-pointer shadow-2xs"
                >
                  <option value="featured">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG GRID */}
      <section className="py-8 sm:py-12 bg-[#FAF7F2]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const primaryImage = getProductImage(product, 0);
              const secondaryImage = getProductImage(product, 1);
              const primaryVariant = product.variants[0];
              const isSoldOut = product.variants.every((v) => v.stock === 0);
              const hasMultipleVariants = product.variants.length > 1;

              const isAdding = addingId === product.id;
              const isAdded = Boolean(addedIds[product.id]);
              const isWishlisted = Boolean(wishlistedIds[product.id]);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-white rounded-xl border border-[#E5DAC6] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#FBF7F0]">
                    <Link href={`/${product.category_slug}/${product.slug}`} className="relative block w-full h-full no-underline">
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className={clsx(
                          'object-cover object-center transition-all duration-500 group-hover:scale-105',
                          secondaryImage ? 'group-hover:opacity-0' : ''
                        )}
                      />
                      {secondaryImage && (
                        <Image
                          src={secondaryImage}
                          alt={`${product.name} Alternate View`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      )}
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, product)}
                      aria-label="Wishlist"
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-[#EADFC8] flex items-center justify-center text-stone-700 hover:text-rose-600 transition-all z-20 cursor-pointer shadow-xs"
                    >
                      <Heart
                        size={15}
                        strokeWidth={1.8}
                        className={clsx(
                          'transition-colors',
                          isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
                        )}
                      />
                    </button>
                  </div>

                  {/* Content Body */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-white">
                    <div>
                      {/* Subcategory */}
                      <span className="block text-[10px] font-bold tracking-[1.5px] text-[#8A641A] uppercase mb-1">
                        {(product.attributes as Record<string, string>)?.sub_category || 'Kerala Pure Coconut Oil'}
                      </span>

                      {/* Product Title */}
                      <Link
                        href={`/${product.category_slug}/${product.slug}`}
                        className="no-underline text-inherit group/title"
                      >
                        <h3 className="font-serif font-bold text-[15px] sm:text-[16px] text-[#1A1A17] line-clamp-2 leading-snug group-hover/title:text-[#B8892D] transition-colors mb-1.5">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Attribute line */}
                      <p className="text-[11.5px] text-[#6E6454] line-clamp-1 mb-2 font-normal">
                        {(product.attributes as Record<string, string>)?.volume || 'Pure Kerala Harvest'}
                      </p>

                      {/* Rating Row */}
                      {product.rating && (
                        <div className="flex items-center gap-1 text-xs text-[#1A1A17] font-semibold mb-2.5">
                          <span>{product.rating.avg_rating.toFixed(1)}</span>
                          <Star size={12} className="fill-[#B8892D] text-[#B8892D]" />
                          <span className="text-stone-400 font-normal">({product.rating.review_count})</span>
                        </div>
                      )}

                      {/* Price Row */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <Price
                          pricePaise={primaryVariant.price_paise}
                          compareAtPricePaise={primaryVariant.compare_at_price_paise}
                          size="md"
                          showPercent={true}
                        />
                      </div>
                    </div>

                    {/* Unified Add to Bag CTA Button */}
                    <div className="pt-2 border-t border-[#EADFC8]/60">
                      {isSoldOut ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-[1.3px] uppercase border border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed select-none text-center"
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
                            if (hasMultipleVariants) {
                              handleOpenQuickAdd(product);
                            } else {
                              handleAddToCart(product);
                            }
                          }}
                          className={clsx(
                            'w-full py-2.5 px-3 rounded-lg text-[11px] font-bold tracking-[1.3px] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer select-none shadow-2xs',
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
            })}
          </div>
        </div>
      </section>

      {/* 5. WHATSAPP CONCIERGE BANNER */}
      <section className="py-10 bg-[#F6F1E6] border-t border-b border-[#EADFC8]/60">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A17] mb-2">
            Have Questions About Our Coconut Oil?
          </h3>
          <p className="text-xs sm:text-sm text-[#5F5545] max-w-md mx-auto mb-5 leading-relaxed">
            Our customer concierge is available to assist you with orders, packaging, or bulk dispatch.
          </p>
          <a
            href="https://wa.me/918951789665?text=Hello%20BarakahBazar,%20I%20have%20a%20question%20about%20Kerala%20Pure%20Coconut%20Oil."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A17] hover:bg-[#B8892D] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors no-underline"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            <span>Chat on WhatsApp: +91 8951789665</span>
          </a>
        </div>
      </section>

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
    </div>
  );
};
