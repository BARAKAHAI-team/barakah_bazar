import React from 'react';
import clsx from 'clsx';
import { formatINR } from '@/lib/pricing/money';

export interface PriceProps {
  pricePaise: number;
  compareAtPricePaise?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
  className?: string;
}

export const Price: React.FC<PriceProps> = ({
  pricePaise,
  compareAtPricePaise,
  size = 'md',
  showPercent = false,
  className,
}) => {
  const hasDiscount =
    compareAtPricePaise && compareAtPricePaise > pricePaise;

  const percentOff = hasDiscount && showPercent
    ? Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl sm:text-2xl font-serif',
  };

  return (
    <div className={clsx('flex items-baseline flex-wrap gap-2 tabular-nums', className)}>
      <span className={clsx('font-semibold text-[var(--ink)]', sizeClasses[size])}>
        {formatINR(pricePaise)}
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs sm:text-sm text-[var(--ink-muted)] line-through">
            {formatINR(compareAtPricePaise)}
          </span>
          {percentOff > 0 && (
            <span className="text-xs font-medium text-[var(--danger)]">
              ({percentOff}% off)
            </span>
          )}
        </>
      )}
    </div>
  );
};
