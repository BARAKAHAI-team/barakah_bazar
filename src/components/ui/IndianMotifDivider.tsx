import React from 'react';
import clsx from 'clsx';

export interface IndianMotifDividerProps {
  className?: string;
  color?: string;
}

/**
 * 12px-tall flat geometric repeating border motif (temple/lattice pattern).
 * 1px strokes, single flat colour.
 * Used exclusively above the footer and directly beneath the home tiles.
 */
export const IndianMotifDivider: React.FC<IndianMotifDividerProps> = ({
  className,
  color = 'var(--line)',
}) => {
  return (
    <div
      aria-hidden="true"
      className={clsx('w-full h-3 overflow-hidden select-none pointer-events-none my-4', className)}
    >
      <svg
        className="w-full h-3 block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        viewBox="0 0 24 12"
        height="12"
      >
        <defs>
          <pattern
            id="barakah-temple-lattice"
            x="0"
            y="0"
            width="24"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            {/* Flat geometric Indian temple / jali chevron motif */}
            <path
              d="M0 6 L6 0 L12 6 L18 0 L24 6 L18 12 L12 6 L6 12 Z M6 6 L12 12 M12 0 L18 6"
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#barakah-temple-lattice)" />
      </svg>
    </div>
  );
};
