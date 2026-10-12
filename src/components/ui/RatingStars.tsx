import React from 'react';
import clsx from 'clsx';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number; // 1 to 5
  count?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  size = 14,
  showText = true,
  className,
}) => {
  if (rating <= 0 && (!count || count <= 0)) return null;

  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={clsx('inline-flex items-center gap-1.5 tabular-nums text-xs', className)}
      aria-label={`Rated ${rating.toFixed(1)} out of 5 stars${count ? ` by ${count} reviews` : ''}`}
    >
      <div className="flex items-center gap-0.5 text-[var(--accent-coconut)]">
        {stars.map((s) => {
          const filled = s <= Math.round(rating);
          return (
            <Star
              key={s}
              size={size}
              strokeWidth={1.5}
              className={clsx(
                filled ? 'fill-[var(--accent-coconut)] text-[var(--accent-coconut)]' : 'text-[var(--line)] fill-none'
              )}
            />
          );
        })}
      </div>

      {showText && (
        <span className="text-[var(--ink-muted)]">
          {rating.toFixed(1)}
          {count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
};
