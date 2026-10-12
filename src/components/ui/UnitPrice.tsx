import React from 'react';
import clsx from 'clsx';
import { formatUnitPrice } from '@/lib/pricing/money';

export interface UnitPriceProps {
  pricePaise: number;
  netQuantity: number | null;
  netUnit: 'g' | 'ml' | 'piece' | null;
  className?: string;
}

export const UnitPrice: React.FC<UnitPriceProps> = ({
  pricePaise,
  netQuantity,
  netUnit,
  className,
}) => {
  if (!netQuantity || !netUnit) return null;

  const unitString = formatUnitPrice(pricePaise, netQuantity, netUnit);
  if (!unitString) return null;

  return (
    <span className={clsx('text-xs text-[var(--ink-muted)] tabular-nums', className)}>
      ({unitString})
    </span>
  );
};
