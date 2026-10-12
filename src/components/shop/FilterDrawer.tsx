'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';

export interface FilterDrawerProps {
  categorySlug: string;
  totalProducts?: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ categorySlug, totalProducts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const isBridal = categorySlug === 'bridal';

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/${categorySlug}?${params.toString()}`);
    setOpen(false);
  };

  const clearFilters = () => {
    router.push(`/${categorySlug}`);
    setOpen(false);
  };

  const currentSort = searchParams.get('sort') || 'newest';

  return (
    <div className="flex items-center justify-between gap-4 py-3 my-4">
      {/* Left: Filter text button with icon */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] hover:text-black cursor-pointer py-1"
      >
        <SlidersHorizontal size={14} strokeWidth={1.5} />
        <span>Filter products</span>
      </button>

      {/* Right: Product count + Sort select with 2px hairline border */}
      <div className="flex items-center gap-4">
        {typeof totalProducts === 'number' && (
          <span className="text-xs text-[var(--ink-muted)]">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <label htmlFor="sort-select" className="text-xs text-[var(--ink-muted)]">
            Sort:
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => applyFilter('sort', e.target.value)}
            className="text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] py-1.5 px-2.5 rounded-[2px] outline-hidden focus:border-[var(--ink)] cursor-pointer"
          >
            <option value="newest">Featured / Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Filter products">
        <div className="space-y-6 pt-2">
          {/* Price Filters */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3">
              Price Range
            </h4>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  applyFilter('minPrice', '0');
                  applyFilter('maxPrice', '1000');
                }}
                className="text-left text-xs text-[var(--ink)] py-2 px-3 rounded-[2px] bg-[var(--surface-subtle)] hover:bg-[var(--line)] cursor-pointer"
              >
                Under ₹1,000
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilter('minPrice', '1000');
                  applyFilter('maxPrice', '5000');
                }}
                className="text-left text-xs text-[var(--ink)] py-2 px-3 rounded-[2px] bg-[var(--surface-subtle)] hover:bg-[var(--line)] cursor-pointer"
              >
                ₹1,000 - ₹5,000
              </button>
              <button
                type="button"
                onClick={() => {
                  applyFilter('minPrice', '5000');
                  applyFilter('maxPrice', '');
                }}
                className="text-left text-xs text-[var(--ink)] py-2 px-3 rounded-[2px] bg-[var(--surface-subtle)] hover:bg-[var(--line)] cursor-pointer"
              >
                Above ₹5,000
              </button>
            </div>
          </div>

          {/* Bridal Filters */}
          {isBridal && (
            <>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3">
                  Jewellery &amp; Apparel Type
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Choker & Necklace Sets',
                    'Temple Jewellery',
                    'Bangles & Kadas',
                    'Hair Ornaments',
                    'Earrings & Jhumkas',
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => applyFilter('subCategory', sub)}
                      className="px-3 py-1.5 text-xs border border-[var(--line)] rounded-[2px] hover:border-[var(--ink)] bg-[var(--surface)] cursor-pointer transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3">
                  Occasion
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Bride', 'Wedding', 'Reception', 'Haldi', 'Mehendi'].map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => applyFilter('occasion', occ)}
                      className="px-3.5 py-1.5 text-xs border border-[var(--line)] rounded-[2px] hover:border-[var(--ink)] bg-[var(--surface)] cursor-pointer transition-colors"
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3">
                  Apparel Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => applyFilter('size', s)}
                      className="w-10 h-10 text-xs font-medium border border-[var(--line)] rounded-[2px] hover:border-[var(--ink)] bg-[var(--surface)] cursor-pointer transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Naturals & Coconut Oil Filters */}
          {!isBridal && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)] mb-3">
                Pack Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {['100 g', '250 g', '500 g', '250 ml', '500 ml', '1 L'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => applyFilter('packSize', size)}
                    className="px-3.5 py-1.5 text-xs border border-[var(--line)] rounded-[2px] hover:border-[var(--ink)] bg-[var(--surface)] cursor-pointer transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[var(--line)] flex gap-3">
            <Button variant="secondary" size="md" className="flex-1 rounded-[2px]" onClick={clearFilters}>
              Clear All
            </Button>
            <Button variant="primary" size="md" className="flex-1 rounded-[2px]" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
