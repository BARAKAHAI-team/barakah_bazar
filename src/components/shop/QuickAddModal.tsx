'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { X, Check, ShoppingBag, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { clientStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';

export interface QuickAddVariant {
  id: string;
  size?: string | null;
  color?: string | null;
  packSize?: string | null;
  label?: string | null;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  stock: number;
}

export interface QuickAddProductData {
  id: string;
  name: string;
  categorySlug: string;
  slug: string;
  image: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  variants: QuickAddVariant[];
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: QuickAddProductData | null;
  onAddedSuccess?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddedSuccess,
}) => {
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Extract unique options
  const uniqueSizes = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  }, [product]);

  const uniqueColors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];
  }, [product]);

  const uniquePacks = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.packSize).filter(Boolean))) as string[];
  }, [product]);

  // Initialize selections when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setIsAdded(false);
      setIsAdding(false);

      // Find first in-stock variant or default to first
      const firstInStock = product.variants.find((v) => v.stock > 0) || product.variants[0];
      if (firstInStock) {
        setSelectedSize(firstInStock.size || null);
        setSelectedColor(firstInStock.color || null);
        setSelectedPack(firstInStock.packSize || null);
      }
    }
  }, [isOpen, product]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  // Resolve matching variant
  const selectedVariant =
    product.variants.find((v) => {
      const matchSize = !uniqueSizes.length || v.size === selectedSize;
      const matchColor = !uniqueColors.length || v.color === selectedColor;
      const matchPack = !uniquePacks.length || v.packSize === selectedPack;
      return matchSize && matchColor && matchPack;
    }) || product.variants[0];

  const isCurrentSoldOut = !selectedVariant || selectedVariant.stock <= 0;
  const isLowStock = selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5;

  const currentPricePaise = selectedVariant?.pricePaise || product.pricePaise;
  const currentCompareAtPricePaise =
    selectedVariant?.compareAtPricePaise ?? product.compareAtPricePaise;

  const formatPrice = (paise: number) => {
    return '₹' + Math.round(paise / 100).toLocaleString('en-IN');
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || isCurrentSoldOut || isAdding) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          variant_id: selectedVariant.id,
          qty: 1,
          quantity: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const total = typeof data?.totalItems === 'number' ? data.totalItems : clientStore.cartCount + 1;
        clientStore.setCartCount(total);
        clientStore.setAuth(true);

        setIsAdded(true);
        toast(`Added ${product.name} to bag!`, 'success');
        if (onAddedSuccess) onAddedSuccess();

        // Close modal after brief success confirmation
        setTimeout(() => {
          onClose();
        }, 800);
      } else if (res.status === 401) {
        sessionStorage.setItem(
          'bz_pending_action',
          JSON.stringify({
            type: 'cart',
            productId: product.id,
            variantId: selectedVariant.id,
            qty: 1,
          })
        );
        toast('Please log in to add items to your cart.', 'info');
        window.location.href = `/login?next=/${product.categorySlug}/${product.slug}`;
      } else {
        const errData = await res.json().catch(() => null);
        toast(errData?.error?.message || 'Could not add to cart', 'error');
      }
    } catch {
      toast('Network error while adding to bag', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] bg-white rounded-2xl border border-[#E5DAC6] shadow-[0_20px_50px_rgba(26,20,10,0.3)] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#EADFC8]/60">
          <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#8A641A]">
            Select Options
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-stone-500 hover:text-[#1A1A17] hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Summary Row */}
        <div className="p-5 flex gap-4 items-start bg-[#FAF7F2]/60 border-b border-[#EADFC8]/40">
          <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-[#EADFC8] bg-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="quick-add-title" className="font-serif font-bold text-base text-[#1A1A17] leading-snug line-clamp-2 mb-1.5">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="font-bold text-base text-[#1A1A17]">
                {formatPrice(currentPricePaise)}
              </span>
              {currentCompareAtPricePaise && currentCompareAtPricePaise > currentPricePaise && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(currentCompareAtPricePaise)}
                </span>
              )}
            </div>

            {/* Stock microcopy */}
            <div className="mt-1 text-xs">
              {isCurrentSoldOut ? (
                <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                  <AlertCircle size={12} /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="text-amber-700 font-medium">
                  Only {selectedVariant.stock} left in stock
                </span>
              ) : (
                <span className="text-emerald-700 font-medium">In stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Options Body */}
        <div className="p-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* Colors (if multiple) */}
          {uniqueColors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A17]">
                  Colour: <span className="font-normal text-stone-600">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const isSelected = selectedColor === color;
                  const hasStock = product.variants.some(
                    (v) => v.color === color && v.stock > 0
                  );
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={clsx(
                        'px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-[#B8892D] bg-[#FAF7F2] text-[#8A641A] shadow-xs font-semibold ring-1 ring-[#B8892D]'
                          : hasStock
                          ? 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                          : 'border-stone-200 bg-stone-50 text-stone-400 line-through'
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes (if multiple) */}
          {uniqueSizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A17]">
                  Size: <span className="font-normal text-stone-600">{selectedSize}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  // check if variant with this size (and color if selected) is in stock
                  const variantForSize = product.variants.find(
                    (v) =>
                      v.size === size &&
                      (!uniqueColors.length || v.color === selectedColor)
                  );
                  const inStock = (variantForSize?.stock ?? 0) > 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={clsx(
                        'min-w-[44px] h-10 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center cursor-pointer select-none',
                        isSelected
                          ? 'border-[#B8892D] bg-[#B8892D] text-white shadow-xs'
                          : inStock
                          ? 'border-stone-300 bg-white text-[#1A1A17] hover:border-[#B8892D] hover:bg-[#FAF7F2]'
                          : 'border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed line-through'
                      )}
                      disabled={!inStock && !variantForSize}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pack Size / Volume (if multiple) */}
          {uniquePacks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1A1A17]">
                  Pack Option: <span className="font-normal text-stone-600">{selectedPack}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniquePacks.map((pack) => {
                  const isSelected = selectedPack === pack;
                  return (
                    <button
                      key={pack}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={clsx(
                        'px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-[#B8892D] bg-[#FAF7F2] text-[#8A641A] font-semibold ring-1 ring-[#B8892D]'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      )}
                    >
                      {pack}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 pt-3 border-t border-[#EADFC8]/60 bg-white">
          <button
            type="button"
            disabled={isCurrentSoldOut || isAdding}
            onClick={handleAddToCart}
            className={clsx(
              'w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-[1.4px] uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs select-none',
              isCurrentSoldOut
                ? 'bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#B8892D] hover:bg-[#9E7321] text-white hover:shadow-md active:scale-[0.99]'
            )}
          >
            {isAdding ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Adding to Bag...</span>
              </>
            ) : isAdded ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                <span>Added to Bag ✓</span>
              </>
            ) : isCurrentSoldOut ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2} />
                <span>Add to Bag &bull; {formatPrice(currentPricePaise)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
