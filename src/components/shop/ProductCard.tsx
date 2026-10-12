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

export interface ProductCardProps {
  product: CatalogProduct;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingQuick, setAddingQuick] = useState(false);

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

    if (!clientStore.isLoggedIn) {
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
      return;
    }

    setAddingQuick(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: targetVariant.id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        clientStore.setCartCount(clientStore.cartCount + 1);
        toast(`Added to bag!`, 'success');
      } else {
        toast('Could not add to cart', 'error');
      }
    } catch {
      toast('Network error while adding to cart', 'error');
    } finally {
      setAddingQuick(false);
    }
  };

  const subCategoryOrBrand =
    (product.attributes as Record<string, string>)?.sub_category || 'Barakah';

  return (
    <div
      className={clsx(
        'group flex flex-col relative bg-transparent border border-transparent hover:border-[var(--line)] rounded-[2px] p-2 transition-all duration-200 text-[var(--ink)]',
        className
      )}
    >
      {/* Product Image Slot: Consistent ratio (3:4 bridal, 1:1 others) */}
      <div className="relative overflow-hidden bg-[var(--surface-2)] rounded-[2px]">
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

        {/* Wishlist Button: plain heart icon top-right */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full border border-stone-200/50 text-[var(--ink)] hover:text-[var(--accent-bridal)] transition-colors z-20 cursor-pointer shadow-sm"
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            className={clsx(
              'transition-colors',
              isWishlisted
                ? 'fill-[var(--accent-bridal)] text-[var(--accent-bridal)]'
                : 'text-stone-600 hover:text-stone-900'
            )}
          />
        </button>

        {/* Hover "Add to Bag / Cart" Action */}
        {!isSoldOut ? (
          <div className="hidden md:flex absolute inset-x-0 bottom-0 z-20 flex-col opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-lg pointer-events-auto">
            {uniqueSizes.length > 1 ? (
              <div className="bg-white/95 backdrop-blur-md border-t border-[var(--line)] p-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider px-0.5">
                  <span>Quick Add Size</span>
                  {addingQuick && <span className="text-[var(--accent-bridal)]">Adding...</span>}
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {uniqueSizes.map(({ size, variantId, inStock }) => (
                    <button
                      key={size}
                      type="button"
                      disabled={!inStock || addingQuick}
                      onClick={(e) => handleAddToCart(e, variantId)}
                      className={clsx(
                        'min-w-[28px] h-7 px-1.5 text-[11px] font-bold rounded-[2px] transition-colors flex items-center justify-center cursor-pointer select-none',
                        inStock
                          ? 'bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-900 border border-stone-300'
                          : 'bg-stone-50 text-stone-300 border border-stone-200 cursor-not-allowed line-through'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 bg-gradient-to-t from-black/50 to-transparent">
                <button
                  type="button"
                  disabled={addingQuick}
                  onClick={(e) => handleAddToCart(e)}
                  className="w-full py-2 px-3 bg-white hover:bg-stone-900 hover:text-white text-stone-900 border border-stone-200 shadow-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 rounded-[2px] cursor-pointer select-none"
                >
                  <ShoppingBag size={14} />
                  {addingQuick ? 'Adding to bag...' : 'Add to Bag'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:block absolute inset-x-0 bottom-0 p-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <div className="w-full py-1.5 bg-stone-100/90 text-stone-500 border border-stone-200 text-xs font-semibold uppercase tracking-wider text-center rounded-[2px]">
              Sold Out
            </div>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="pt-2 pb-1 flex flex-col flex-1">
        {/* Brand / Sub-category Line: small muted 12px */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[12px] text-[var(--ink-muted)] font-normal line-clamp-1">
            {subCategoryOrBrand}
          </span>
          {isNew && (
            <span className="text-[11px] font-medium text-[var(--ink)] uppercase tracking-wider">
              New
            </span>
          )}
        </div>

        {/* Product Name: 2 lines max, 14px, ink, truncated with ellipsis */}
        <Link
          href={`/${product.category_slug}/${product.slug}`}
          className="no-underline text-inherit group/title mb-1.5"
        >
          <h3 className="font-sans text-[14px] font-normal text-[var(--ink)] m-0 line-clamp-2 leading-snug group-hover/title:underline">
            {product.name}
          </h3>
        </Link>

        {/* Price Row: bold price, struck MRP, plain green discount (computed from compare_at_price) */}
        <div className="flex items-baseline flex-wrap gap-2 tabular-nums mb-1">
          <Price
            pricePaise={primaryVariant.price_paise}
            compareAtPricePaise={primaryVariant.compare_at_price_paise}
            size="sm"
            showPercent={true}
          />
        </div>

        {/* Rating Row ONLY if the product has at least one review: "4.3 ★ (28)" */}
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

        {/* Variant Hint Line: derived from product variants */}
        {variantHint && (
          <div className="text-[11px] text-[var(--ink-muted)] mt-auto pt-0.5">
            {variantHint}
          </div>
        )}

        {isSoldOut && (
          <div className="text-[11px] font-medium text-[var(--ink-muted)] mt-auto pt-0.5">
            Sold out
          </div>
        )}
      </div>
    </div>
  );
};
