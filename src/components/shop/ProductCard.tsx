'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { Heart, Star } from 'lucide-react';
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

  // Check if all variants are out of stock
  const isSoldOut = product.variants.every((v) => v.stock === 0);

  // Base primary variant
  const primaryVariant = product.variants[0];
  const isBridal = product.category_slug === 'bridal';

  const hasDiscount = Boolean(
    primaryVariant.compare_at_price_paise &&
      primaryVariant.compare_at_price_paise > primaryVariant.price_paise
  );

  // Created in last 30 days
  const isCreatedWithin30Days = () => {
    if (!product.created_at) return false;
    const created = new Date(product.created_at).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return created > thirtyDaysAgo;
  };

  // Determine single label: priority is Sold out -> Discount -> New (never both discount & new)
  let singleLabel: string | null = null;
  if (isSoldOut) {
    singleLabel = 'Sold out';
  } else if (hasDiscount) {
    singleLabel = 'Sale';
  } else if (product.badge === 'New' || isCreatedWithin30Days()) {
    singleLabel = 'New';
  }

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

  return (
    <div
      className={clsx(
        'group flex flex-col relative bg-[var(--surface)] text-[var(--ink)]',
        className
      )}
    >
      {/* Product Image Slot: Consistent aspect ratio (4:5 bridal, 1:1 others) */}
      <Link
        href={`/${product.category_slug}/${product.slug}`}
        className="block relative overflow-hidden bg-[var(--surface-2)] no-underline"
      >
        <div
          className={clsx(
            'w-full relative overflow-hidden bg-[var(--surface-2)]',
            isBridal ? 'aspect-[4/5]' : 'aspect-square'
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.images?.[0]?.alt || product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <span className="text-xs text-[var(--ink-muted)] text-center font-medium line-clamp-3 select-none px-2">
                {product.name}
              </span>
            </div>
          )}
        </div>

        {/* Single small rectangular label: square corners, ink text on bg-surface with 1px border */}
        {singleLabel && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 text-[10px] uppercase font-medium bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-none">
              {singleLabel}
            </span>
          </div>
        )}

        {/* Wishlist Button: plain heart icon button, no circle, no bg, 44x44 hit area */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center bg-transparent border-none text-[var(--ink)] hover:text-black transition-colors z-10 cursor-pointer"
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            className={clsx(
              'transition-colors',
              isWishlisted ? 'fill-[var(--ink)] text-[var(--ink)]' : 'text-[var(--ink)]'
            )}
          />
        </button>
      </Link>

      {/* Product Information */}
      <div className="pt-3 pb-2 flex flex-col flex-1">
        {/* Rating if reviews exist */}
        {product.rating && product.rating.review_count > 0 && (
          <div className="flex items-center gap-1 mb-1 text-[11px] text-[var(--ink-muted)]">
            <span className="font-medium text-[var(--ink)]">
              {product.rating.avg_rating.toFixed(1)}
            </span>
            <Star size={10} strokeWidth={1.5} className="fill-[var(--ink)] text-[var(--ink)]" />
            <span>({product.rating.review_count})</span>
          </div>
        )}

        <Link
          href={`/${product.category_slug}/${product.slug}`}
          className="no-underline text-inherit hover:underline"
        >
          <h3 className="font-serif text-sm sm:text-base font-normal text-[var(--ink)] m-0 line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-xs text-[var(--ink-muted)] mt-1 mb-2 line-clamp-1">
            {product.short_description}
          </p>
        )}

        {/* Price Block: ₹ price with compare_at_price struck through in muted ink */}
        <div className="mt-auto pt-1 flex items-baseline justify-between">
          <Price
            pricePaise={primaryVariant.price_paise}
            compareAtPricePaise={primaryVariant.compare_at_price_paise}
            size="sm"
            showPercent={false}
          />
        </div>
      </div>
    </div>
  );
};
