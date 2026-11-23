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
import { CatalogProduct, CatalogCategory } from '@/lib/catalog/types';
import { Price } from '@/components/ui/Price';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { QuickAddModal, QuickAddProductData } from '@/components/shop/QuickAddModal';

interface DynamicCategoryClientPageProps {
  category: CatalogCategory;
  initialProducts: CatalogProduct[];
}

export const DynamicCategoryClientPage: React.FC<DynamicCategoryClientPageProps> = ({
  category,
  initialProducts,
}) => {
  const { toast } = useToast();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Cart & Modal State
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>({});
  const [modalProduct, setModalProduct] = useState<QuickAddProductData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamically extract unique subcategories from products
  const subCategories = useMemo(() => {
    const subs = new Set<string>();
    initialProducts.forEach((p) => {
      const sub = (p.attributes as Record<string, string>)?.sub_category ||
                  (p.attributes as Record<string, string>)?.collection;
      if (sub) subs.add(sub);
    });
    return ['All', ...Array.from(subs)];
  }, [initialProducts]);

  const getProductImage = (product: CatalogProduct, index: number = 0): string => {
    if (product.images && product.images.length > index && product.images[index]?.storage_path) {
      return product.images[index].storage_path;
    }
    return product.thumbnail_url || category.imageUrl || '/images/home/products/oil_500ml_a.jpg';
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (selectedSubCategory !== 'All') {
      result = result.filter((p) => {
        const attrs = (p.attributes as Record<string, string>) || {};
        return attrs.sub_category === selectedSubCategory || attrs.collection === selectedSubCategory;
      });
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.variants[0]?.price_paise || 0) - (b.variants[0]?.price_paise || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.variants[0]?.price_paise || 0) - (a.variants[0]?.price_paise || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating?.avg_rating || 0) - (a.rating?.avg_rating || 0));
    }

    return result;
  }, [initialProducts, selectedSubCategory, sortBy]);

  const handleAddToCart = async (product: CatalogProduct) => {
    const targetVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];
    if (!targetVariant || targetVariant.stock === 0) {
      toast('This item is currently out of stock.', 'info');
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
    const quickAddData: QuickAddProductData = {
      id: product.id,
      name: product.name,
      categorySlug: product.category_slug,
      slug: product.slug,
      image: getProductImage(product, 0),
      pricePaise: product.variants[0]?.price_paise || 0,
      compareAtPricePaise: product.variants[0]?.compare_at_price_paise,
      variants: product.variants.map((v) => ({
        id: v.id,
        size: (v.option_values?.['Size'] as string) || (v.option_values?.['size'] as string) || null,
        color: (v.option_values?.['Colour'] as string) || (v.option_values?.['Color'] as string) || null,
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
        toast('Removed from wishlist', 'info');
      }
    } catch {
      toast('Unable to update wishlist', 'error');
    }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1A17] overflow-x-hidden min-h-screen">
      {/* EDITORIAL HEADER */}
      <section className="bg-white border-b border-[#EADFC8]/60 py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          <div className="max-w-[700px]">
            <span className="text-[11px] font-bold tracking-[2.5px] text-[#8A641A] uppercase mb-2 block">
              {category.eyebrow || category.name.toUpperCase()}
            </span>
            <h1 className="font-serif text-[32px] sm:text-[42px] font-bold text-[#1A1A17] tracking-tight mb-3">
              {category.name}
            </h1>
            <p className="text-[#5F5545] text-sm sm:text-base leading-relaxed m-0">
              {category.description || category.tagline || 'Explore handcrafted luxury items from BarakahBazar.'}
            </p>
          </div>
        </div>
      </section>

      {/* FILTER & SORT CONTROLS BAR */}
      <section className="bg-white/80 backdrop-blur-xs border-b border-[#EADFC8]/60 py-3.5 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {subCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSubCategory(cat)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap',
                  selectedSubCategory === cat
                    ? 'bg-[#1A1A17] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-stone-600 hover:text-stone-900 border border-[#E5DAC6] hover:border-stone-400'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Product Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden sm:inline">
              Showing <strong className="text-stone-900">{filteredProducts.length}</strong> items
            </span>

            <div className="relative">
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-[#FAF7F2] border border-[#E5DAC6] text-xs font-semibold text-stone-800 rounded-lg pl-3 pr-8 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#B8892D] cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="py-8 sm:py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-[#E5DAC6] p-8 max-w-md mx-auto">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">No products found</h3>
              <p className="text-xs text-stone-500 mb-5">
                There are no active products in this collection yet. Check back soon or browse other collections.
              </p>
              <Link
                href="/"
                className="inline-flex px-5 py-2.5 bg-[#1A1A17] text-white text-xs font-bold uppercase tracking-wider rounded-lg no-underline hover:bg-[#B8892D] transition-colors"
              >
                Browse Store
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const primaryVariant = product.variants[0] || { price_paise: 0, stock: 0 };
                const isSoldOut = product.variants.every((v) => v.stock === 0);
                const primaryImage = getProductImage(product, 0);
                const secondaryImage = getProductImage(product, 1);
                const isWishlisted = !!wishlistedIds[product.id];
                const isAdding = addingId === product.id;
                const isAdded = !!addedIds[product.id];
                const hasMultipleVariants = product.variants.length > 1;

                const attrs = (product.attributes as Record<string, string>) || {};
                const specText = attrs.fabric || attrs.wax || attrs.origin || attrs.volume || product.short_description || '';

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white rounded-xl border border-[#E5DAC6] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image Frame with relative parent Link */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#FBF7F0]">
                      <Link href={`/${product.category_slug}/${product.slug}`} className="relative block w-full h-full no-underline">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className={clsx(
                            'object-cover object-center transition-all duration-500 group-hover:scale-105',
                            secondaryImage && secondaryImage !== primaryImage ? 'group-hover:opacity-0' : ''
                          )}
                        />
                        {secondaryImage && secondaryImage !== primaryImage && (
                          <Image
                            src={secondaryImage}
                            alt={`${product.name} Alternate View`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        )}
                      </Link>

                      {/* Badge */}
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-wider uppercase bg-[#1A1A17] text-white shadow-2xs z-10">
                          {product.badge}
                        </span>
                      )}

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
                          {attrs.sub_category || category.name}
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

                        {/* Attribute spec line */}
                        {specText && (
                          <p className="text-[11.5px] text-[#6E6454] line-clamp-1 mb-2 font-normal">
                            {specText}
                          </p>
                        )}

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
          )}
        </div>
      </section>

      {/* WHATSAPP CONCIERGE BANNER */}
      <section className="py-10 bg-[#F6F1E6] border-t border-b border-[#EADFC8]/60">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6 text-center">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A17] mb-2">
            Have Questions About {category.name}?
          </h3>
          <p className="text-xs sm:text-sm text-[#5F5545] max-w-md mx-auto mb-5 leading-relaxed">
            Our concierge team is available to assist you with bespoke requests, bulk orders, or product details.
          </p>
          <a
            href={`https://wa.me/918951789665?text=${encodeURIComponent(`Hello BarakahBazar, I would like to inquire about ${category.name}.`)}`}
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
