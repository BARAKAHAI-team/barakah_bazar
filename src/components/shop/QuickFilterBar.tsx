'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';

export interface QuickFilterBarProps {
  categorySlug: string;
  totalProducts?: number;
  hasReviews?: boolean;
}

export const QuickFilterBar: React.FC<QuickFilterBarProps> = ({
  categorySlug,
  totalProducts,
  hasReviews = true,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isBridal = categorySlug === 'bridal';

  // Read current filters from URL
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSize = searchParams.get('size') || '';
  const currentColour = searchParams.get('colour') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentDiscount = searchParams.get('discount') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentPackSize = searchParams.get('packSize') || '';
  const currentSubCategory = searchParams.get('subCategory') || '';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/${categorySlug}?${params.toString()}`);
    setActiveDropdown(null);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/${categorySlug}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(`/${categorySlug}`);
    setMobileDrawerOpen(false);
  };

  // Build active filter chips
  const activeChips: { key: string; label: string }[] = [];
  if (currentSubCategory) activeChips.push({ key: 'subCategory', label: currentSubCategory });
  if (currentSize) activeChips.push({ key: 'size', label: `Size: ${currentSize}` });
  if (currentColour) activeChips.push({ key: 'colour', label: `Colour: ${currentColour}` });
  if (currentMinPrice || currentMaxPrice) {
    if (!currentMinPrice && currentMaxPrice === '1000') {
      activeChips.push({ key: 'price', label: 'Under ₹1,000' });
    } else if (currentMinPrice === '1000' && currentMaxPrice === '5000') {
      activeChips.push({ key: 'price', label: '₹1,000 - ₹5,000' });
    } else if (currentMinPrice === '5000') {
      activeChips.push({ key: 'price', label: 'Above ₹5,000' });
    } else {
      activeChips.push({ key: 'price', label: 'Custom Price' });
    }
  }
  if (currentDiscount) activeChips.push({ key: 'discount', label: `${currentDiscount}% and above` });
  if (currentRating) activeChips.push({ key: 'rating', label: `${currentRating}★ and above` });
  if (currentPackSize) activeChips.push({ key: 'packSize', label: `Pack: ${currentPackSize}` });

  return (
    <div className="sticky top-[120px] z-30 bg-white border-b border-[var(--line)] py-2.5">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Main Bar: Dropdowns on Desktop, Drawer Button on Mobile */}
        <div className="flex items-center justify-between gap-4" ref={dropdownRef}>
          {/* Mobile Filter Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[var(--line)] rounded-[2px] bg-white text-[var(--ink)] cursor-pointer"
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              <span>Filters &amp; Sort</span>
              {activeChips.length > 0 && (
                <span className="w-4 h-4 bg-[var(--ink)] text-white text-[10px] rounded-[2px] flex items-center justify-center">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                  currentSort !== 'newest'
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                )}
              >
                <span>
                  Sort:{' '}
                  {currentSort === 'price_asc'
                    ? 'Price: Low to High'
                    : currentSort === 'price_desc'
                    ? 'Price: High to Low'
                    : 'Featured'}
                </span>
                <ChevronDown size={13} strokeWidth={1.5} />
              </button>

              {activeDropdown === 'sort' && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs">
                  {[
                    { label: 'Featured / Newest', val: 'newest' },
                    { label: 'Price: Low to High', val: 'price_asc' },
                    { label: 'Price: High to Low', val: 'price_desc' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => updateParam('sort', s.val)}
                      className={clsx(
                        'w-full text-left px-3 py-2 cursor-pointer transition-colors',
                        currentSort === s.val
                          ? 'bg-stone-100 font-semibold text-[var(--ink)]'
                          : 'text-gray-700 hover:bg-stone-50'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Size Dropdown (Bridal) */}
            {isBridal && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                    currentSize
                      ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                  )}
                >
                  <span>Size {currentSize && `(${currentSize})`}</span>
                  <ChevronDown size={13} strokeWidth={1.5} />
                </button>

                {activeDropdown === 'size' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-[var(--line)] rounded-[2px] p-2 z-40 text-xs">
                    <div className="grid grid-cols-3 gap-1.5">
                      {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateParam('size', currentSize === s ? '' : s)}
                          className={clsx(
                            'py-1.5 text-center border rounded-[2px] cursor-pointer font-medium text-xs',
                            currentSize === s
                              ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                              : 'bg-white border-[var(--line)] hover:border-gray-400 text-gray-800'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Colour Dropdown (Bridal) */}
            {isBridal && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'colour' ? null : 'colour')}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                    currentColour
                      ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                  )}
                >
                  <span>Colour {currentColour && `(${currentColour})`}</span>
                  <ChevronDown size={13} strokeWidth={1.5} />
                </button>

                {activeDropdown === 'colour' && (
                  <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs max-h-56 overflow-y-auto">
                    {[
                      'Bridal Red',
                      'Deep Crimson',
                      'Maroon',
                      'Plum',
                      'Emerald Green',
                      'Blush Pink',
                      'Soft Peach',
                      'Gold & Pearl White',
                    ].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => updateParam('colour', currentColour === col ? '' : col)}
                        className={clsx(
                          'w-full text-left px-3 py-1.5 cursor-pointer transition-colors',
                          currentColour === col
                            ? 'bg-stone-100 font-semibold text-[var(--ink)]'
                            : 'text-gray-700 hover:bg-stone-50'
                        )}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pack Size Dropdown (Naturals & Coconut Oil) */}
            {!isBridal && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'packSize' ? null : 'packSize')}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                    currentPackSize
                      ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                  )}
                >
                  <span>Pack Size {currentPackSize && `(${currentPackSize})`}</span>
                  <ChevronDown size={13} strokeWidth={1.5} />
                </button>

                {activeDropdown === 'packSize' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs">
                    {['100 g', '250 g', '500 g', '250 ml', '500 ml', '1 L'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateParam('packSize', currentPackSize === p ? '' : p)}
                        className={clsx(
                          'w-full text-left px-3 py-1.5 cursor-pointer',
                          currentPackSize === p
                            ? 'bg-stone-100 font-semibold text-[var(--ink)]'
                            : 'text-gray-700 hover:bg-stone-50'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                  currentMinPrice || currentMaxPrice
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                )}
              >
                <span>Price</span>
                <ChevronDown size={13} strokeWidth={1.5} />
              </button>

              {activeDropdown === 'price' && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete('minPrice');
                      params.set('maxPrice', '1000');
                      params.set('page', '1');
                      router.push(`/${categorySlug}?${params.toString()}`);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Under ₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('minPrice', '1000');
                      params.set('maxPrice', '5000');
                      params.set('page', '1');
                      router.push(`/${categorySlug}?${params.toString()}`);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-stone-50 cursor-pointer"
                  >
                    ₹1,000 - ₹5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('minPrice', '5000');
                      params.delete('maxPrice');
                      params.set('page', '1');
                      router.push(`/${categorySlug}?${params.toString()}`);
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-stone-50 cursor-pointer"
                  >
                    Above ₹5,000
                  </button>
                </div>
              )}
            </div>

            {/* Discount Dropdown: '30% and above' etc */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'discount' ? null : 'discount')}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                  currentDiscount
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                )}
              >
                <span>Discount</span>
                <ChevronDown size={13} strokeWidth={1.5} />
              </button>

              {activeDropdown === 'discount' && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs">
                  {['10', '20', '30'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateParam('discount', currentDiscount === d ? '' : d)}
                      className={clsx(
                        'w-full text-left px-3 py-2 cursor-pointer',
                        currentDiscount === d
                          ? 'bg-stone-100 font-semibold text-[var(--ink)]'
                          : 'text-gray-700 hover:bg-stone-50'
                      )}
                    >
                      {d}% and above
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Dropdown: '4 and above' only if reviews exist */}
            {hasReviews && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'rating' ? null : 'rating')}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-[2px] bg-white transition-colors cursor-pointer',
                    currentRating
                      ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink)] hover:border-gray-400'
                  )}
                >
                  <span>Rating</span>
                  <ChevronDown size={13} strokeWidth={1.5} />
                </button>

                {activeDropdown === 'rating' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-[var(--line)] rounded-[2px] py-1 z-40 text-xs">
                    <button
                      type="button"
                      onClick={() => updateParam('rating', currentRating === '4' ? '' : '4')}
                      className={clsx(
                        'w-full text-left px-3 py-2 cursor-pointer',
                        currentRating === '4'
                          ? 'bg-stone-100 font-semibold text-[var(--ink)]'
                          : 'text-gray-700 hover:bg-stone-50'
                      )}
                    >
                      4★ and above
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Total product count */}
          {typeof totalProducts === 'number' && (
            <span className="text-xs text-[var(--ink-muted)] tabular-nums ml-auto whitespace-nowrap">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Active Filter Removable Text Chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2.5 mt-2 border-t border-[var(--line)]">
            <span className="text-[11px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold mr-1">
              Active:
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.key + chip.label}
                type="button"
                onClick={() => removeFilter(chip.key)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-100 text-[var(--ink)] border border-[var(--line)] rounded-[2px] hover:border-gray-500 cursor-pointer transition-colors"
              >
                <span>{chip.label}</span>
                <X size={12} strokeWidth={2} />
              </button>
            ))}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[var(--accent-bridal)] hover:underline ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        title="Filter & Sort"
      >
        <div className="space-y-6 pt-2 pb-6">
          {/* Mobile Sort */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2">
              Sort By
            </h4>
            <div className="space-y-1">
              {[
                { label: 'Featured / Newest', val: 'newest' },
                { label: 'Price: Low to High', val: 'price_asc' },
                { label: 'Price: High to Low', val: 'price_desc' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => updateParam('sort', s.val)}
                  className={clsx(
                    'w-full text-left px-3 py-2 text-xs border rounded-[2px] transition-colors',
                    currentSort === s.val
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-semibold'
                      : 'bg-white text-gray-700 border-[var(--line)]'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Size */}
          {isBridal && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2">
                Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateParam('size', currentSize === s ? '' : s)}
                    className={clsx(
                      'w-10 h-10 text-xs font-semibold border rounded-[2px]',
                      currentSize === s
                        ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                        : 'bg-white text-gray-800 border-[var(--line)]'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Discount */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-2">
              Discount
            </h4>
            <div className="flex flex-wrap gap-2">
              {['10', '20', '30'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateParam('discount', currentDiscount === d ? '' : d)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium border rounded-[2px]',
                    currentDiscount === d
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                      : 'bg-white text-gray-800 border-[var(--line)]'
                  )}
                >
                  {d}% and above
                </button>
              ))}
            </div>
          </div>

          {/* Clear & Apply Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex-1 py-2.5 text-xs font-semibold text-center border border-[var(--line)] rounded-[2px] text-[var(--ink)]"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex-1 py-2.5 text-xs font-semibold text-center bg-[var(--ink)] text-white rounded-[2px]"
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
