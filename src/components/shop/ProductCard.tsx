'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { CatalogProduct } from '@/lib/catalog/types';
import { Price } from '@/components/ui/Price';
import { useToast } from '@/components/ui/Toast';
import { clientStore } from '@/lib/store';
import { QuickAddModal, QuickAddProductData } from '@/components/shop/QuickAddModal';

export interface ProductCardProps {
  product: CatalogProduct;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingQuick, setAddingQuick] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Check if all variants are out of stock
  const isSoldOut = product.variants.every((v) => v.stock === 0);

  // Base primary variant
  const primaryVariant = product.variants[0];
  const isBridal = product.category_slug === 'bridal';
  const primaryImage = product.images?.[0]?.storage_path;
  const secondaryImage = product.images?.[1]?.storage_path;

  // Extract unique sizes if this is a sized apparel/item
  const uniqueSizes = Array.from(
    new Set(product.variants.map((v) => v.option_values?.['Size']).filter(Boolean))
  ).map((size) => {
    const matchingVariant =
      product.variants.find((v) => v.option_values?.['Size'] === size && v.stock > 0) ||
      product.variants.find((v) => v.option_values?.['Size'] === size);
    return {
      size: size as string,
      variantId: matchingVariant?.id,
      inStock: (matchingVariant?.stock ?? 0) > 0,
    };
  });

  // Created in last 30 days
  const isCreatedWithin30Days = () => {
    if (!product.created_at) return false;
    const created = new Date(product.created_at).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return created > thirtyDaysAgo;
  };
  const isNew = product.badge === 'New' || isCreatedWithin30Days();

  // Derive variant hint line under price
  const getVariantHint = (): string | null => {
    if (product.variants.length <= 1) return null;

    const sizes = Array.from(
      new Set(product.variants.map((v) => v.option_values['Size']).filter(Boolean))
    );
    if (sizes.length > 1) {
      if (sizes.includes('XS') && sizes.includes('XL')) return 'Sizes XS-XL';
      if (sizes.includes('S') && sizes.includes('XL')) return 'Sizes S-XL';
      if (sizes.includes('S') && sizes.includes('L')) return 'Sizes S-L';
      return `${sizes.length} sizes`;
    }

    const colours = Array.from(
      new Set(product.variants.map((v) => v.option_values['Colour']).filter(Boolean))
    );
    if (colours.length > 1) {
      return `${colours.length} colours`;
    }

    const packSizes = Array.from(
      new Set(product.variants.map((v) => v.option_values['Pack size']).filter(Boolean))
    );
    if (packSizes.length > 1) {
      return `${packSizes.length} pack sizes`;
    }

    return `${product.variants.length} options`;
  };
  const variantHint = getVariantHint();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
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

    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' });
        setIsWishlisted(false);
        clientStore.setWishlistCount(Math.max(0, clientStore.wishlistCount - 1));
        toast('Removed from wishlist');
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        setIsWishlisted(true);
        clientStore.setWishlistCount(clientStore.wishlistCount + 1);
        toast('Added to wishlist', 'success');
      }
    } catch {
      toast('Unable to update wishlist', 'error');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, variantId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const targetVariant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : product.variants.find((v) => v.stock > 0) || primaryVariant;

    if (!targetVariant || targetVariant.stock === 0) {
      toast('Selected item is currently sold out.', 'info');
      return;
    }

    setAddingQuick(true);
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
        toast(`Added to bag!`, 'success');
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
        const errData = await res.json().catch(() => null);
        toast(errData?.error?.message || 'Could not add to cart', 'error');
      }
    } catch {
      toast('Network error while adding to cart', 'error');
    } finally {
      setAddingQuick(false);
    }
  };

  const subCategoryOrBrand =
    (product.attributes as Record<string, string>)?.sub_category || 'Barakah';

  const handleBagClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 1) {
      setIsQuickAddOpen(true);
    } else {
      handleAddToCart(e);
    }
  };

  const quickAddData: QuickAddProductData = {
    id: product.id,
    name: product.name,
    categorySlug: product.category_slug,
    slug: product.slug,
    image: primaryImage || '/placeholder.jpg',
    pricePaise: primaryVariant.price_paise,
    compareAtPricePaise: primaryVariant.compare_at_price_paise,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.option_values?.['Size'] || v.option_values?.['size'] || null,
      color: v.option_values?.['Colour'] || v.option_values?.['Color'] || v.option_values?.['colour'] || null,
      packSize: v.option_values?.['Pack size'] || v.option_values?.['Pack Size'] || null,
      label: v.label,
      pricePaise: v.price_paise,
      compareAtPricePaise: v.compare_at_price_paise,
      stock: v.stock,
    })),
  };

  return (
    <>
      <div
        className={clsx(
          'group flex flex-col relative bg-white border border-stone-200/80 hover:border-stone-400 rounded-md p-2.5 sm:p-3 transition-all duration-200 text-[var(--ink)] shadow-xs hover:shadow-md',
          className
        )}
      >
      {/* Product Image Slot: Consistent ratio (3:4 bridal, 1:1 others) */}
      <div className="relative overflow-hidden bg-[var(--surface-2)] rounded-[4px]">
        <Link
          href={`/${product.category_slug}/${product.slug}`}
          className="block relative overflow-hidden bg-[var(--surface-2)] no-underline"
        >
          <div
            className={clsx(
              'w-full relative overflow-hidden bg-[var(--surface-2)]',
              isBridal ? 'aspect-[3/4]' : 'aspect-square'
            )}
          >
            {primaryImage ? (
              <>
                <Image
                  src={primaryImage}
                  alt={product.images?.[0]?.alt || product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={clsx(
                    'object-cover object-center transition-all duration-300 group-hover:scale-102',
                    secondaryImage ? 'group-hover:opacity-0' : ''
                  )}
                />
                {secondaryImage && (
                  <Image
                    src={secondaryImage}
                    alt={product.images?.[1]?.alt || `${product.name} alternate view`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <span className="text-xs text-[var(--ink-muted)] text-center font-medium line-clamp-3 select-none px-2">
                  {product.name}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist Button: always visible top-right */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
          className="absolute top-2 right-2 p-1.5 sm:p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full border border-stone-200/80 text-stone-700 hover:text-rose-600 transition-all z-20 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            className={clsx(
              'transition-colors',
              isWishlisted
                ? 'fill-rose-500 text-rose-500'
                : 'text-stone-600 hover:text-stone-900'
            )}
          />
        </button>
      </div>

      {/* Product Information */}
      <div className="pt-2.5 pb-1 flex flex-col flex-1">
        {/* Brand / Sub-category Line */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[12px] text-[var(--ink-muted)] font-normal line-clamp-1">
            {subCategoryOrBrand}
          </span>
          {isNew && (
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded uppercase tracking-wider">
              New
            </span>
          )}
        </div>

        {/* Product Name */}
        <Link
          href={`/${product.category_slug}/${product.slug}`}
          className="no-underline text-inherit group/title mb-1.5"
        >
          <h3 className="font-sans text-[14px] font-medium text-[var(--ink)] m-0 line-clamp-2 leading-snug group-hover/title:underline">
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline flex-wrap gap-2 tabular-nums mb-1">
          <Price
            pricePaise={primaryVariant.price_paise}
            compareAtPricePaise={primaryVariant.compare_at_price_paise}
            size="sm"
            showPercent={true}
          />
        </div>

        {/* Rating Row */}
        {product.rating && product.rating.review_count > 0 && (
          <div className="flex items-center gap-1 text-[12px] text-[var(--ink)] font-medium tabular-nums mb-1">
            <span>{product.rating.avg_rating.toFixed(1)}</span>
            <Star
              size={11}
              strokeWidth={1.5}
              className="fill-[var(--accent-bridal)] text-[var(--accent-bridal)]"
            />
            <span className="text-[var(--ink-muted)] font-normal">
              ({product.rating.review_count})
            </span>
          </div>
        )}

        {/* Variant Hint */}
        {variantHint && (
          <div className="text-[11px] text-[var(--ink-muted)] mt-auto pt-0.5 mb-2">
            {variantHint}
          </div>
        )}
      </div>

      {/* Always-visible Add to Bag Action Area */}
      <div className="mt-auto pt-2 border-t border-stone-100 flex flex-col gap-1.5">
        {isSoldOut ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-3 bg-stone-100 text-stone-400 border border-stone-200 text-xs font-semibold uppercase tracking-wider text-center rounded-[4px] cursor-not-allowed select-none"
          >
            Sold Out
          </button>
        ) : (
          <button
            type="button"
            disabled={addingQuick}
            onClick={handleBagClick}
            className="w-full py-2.5 px-3 bg-[#1A1A17] hover:bg-[#B8892D] text-white text-xs font-semibold uppercase tracking-wider rounded-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-75 select-none"
          >
            <ShoppingBag size={14} className={clsx(addingQuick && 'animate-spin')} />
            {addingQuick ? 'Adding to bag...' : 'Add to Bag'}
          </button>
        )}
      </div>
    </div>

    {/* Quick-Add Option Selector Modal */}
    <QuickAddModal
      isOpen={isQuickAddOpen}
      onClose={() => setIsQuickAddOpen(false)}
      product={quickAddData}
    />
  </>
  );
};
