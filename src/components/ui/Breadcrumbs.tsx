import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={clsx('py-3 text-xs', className)}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0 text-[var(--ink-muted)]">
        <li>
          <Link href="/" className="hover:text-[var(--ink)] hover:underline">
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} strokeWidth={1.5} className="text-[var(--line)]" />
              {isLast || !item.href ? (
                <span className="font-medium text-[var(--ink)]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[var(--ink)] hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
