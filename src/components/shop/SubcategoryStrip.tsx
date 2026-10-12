'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

export interface SubcategoryItem {
  name: string;
  value: string;
  imageUrl?: string | null;
}

export interface SubcategoryStripProps {
  categorySlug: string;
  items: SubcategoryItem[];
  activeValue?: string;
  accentColor?: string;
}

/**
 * Modern Clean Sub-category Navigation Strip.
 * Wrapped flex pills with no horizontal scroll or overlapping buttons for optimal UX.
 */
export const SubcategoryStrip: React.FC<SubcategoryStripProps> = ({
  categorySlug,
  items,
  activeValue = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-3 my-2 border-y border-[var(--line)]">
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mr-1 select-none">
          Explore:
        </span>
        {items.map((item) => {
          const isActive = activeValue === item.value;
          const href = item.value
            ? `/${categorySlug}?subCategory=${encodeURIComponent(item.value)}`
            : `/${categorySlug}`;

          return (
            <Link
              key={item.name}
              href={href}
              className={clsx(
                'inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-[13px] transition-all duration-200 no-underline cursor-pointer select-none font-medium',
                isActive
                  ? 'bg-stone-900 text-white font-semibold shadow-sm border border-stone-900 ring-2 ring-stone-900/10'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 border border-stone-200/80 hover:border-stone-300'
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
