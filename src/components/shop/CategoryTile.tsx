'use client';

import React from 'react';
import Link from 'next/link';

import Image from 'next/image';

export interface CategoryTileProps {
  slug: string;
  name: string;
  description: string;
  accent: string;
  imageUrl?: string;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  slug,
  name,
  description,
  accent,
  imageUrl,
}) => {
  const handleClick = () => {
    // Set 1-year cookie bz_category for remembering active selection
    document.cookie = `bz_category=${slug}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <Link
      href={`/${slug}`}
      onClick={handleClick}
      className="group flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[2px] p-6 hover:border-[var(--ink)] transition-colors no-underline text-inherit"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)] block mb-1">
        Barakah
      </span>

      <h2 className="font-serif text-2xl font-bold text-[var(--ink)] m-0 leading-tight">
        {name}
      </h2>

      <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-2 mb-6 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Image slot */}
      <div className="w-full aspect-[4/3] bg-[var(--surface-2)] mb-6 relative overflow-hidden rounded-[2px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-xs text-[var(--ink-muted)] text-center font-medium">
              {name}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-[var(--line)]">
        <span
          style={{ color: accent }}
          className="text-xs font-semibold uppercase tracking-wider group-hover:underline"
        >
          Shop {name} &rarr;
        </span>
      </div>
    </Link>
  );
};
