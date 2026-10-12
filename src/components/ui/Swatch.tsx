import React from 'react';
import clsx from 'clsx';

export interface SwatchProps {
  name: string;
  colorHex?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

// Map common color names to subtle authentic tones
const colorMap: Record<string, string> = {
  'Bridal Red': '#8B1E2B',
  'Deep Crimson': '#66111B',
  'Maroon': '#54151C',
  'Plum': '#4A1525',
  'Blush Pink': '#E3B9BC',
  'Soft Peach': '#E8C4B8',
  'Mustard Yellow': '#C28B1E',
  'Mint Green': '#A3BFA8',
  'Emerald Green': '#1F5B3A',
  'Midnight Navy': '#18243B',
};

export const Swatch: React.FC<SwatchProps> = ({
  name,
  colorHex,
  selected,
  disabled,
  onClick,
  className,
}) => {
  const bg = colorHex || colorMap[name] || '#888888';

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={name}
        aria-label={`Colour ${name}${selected ? ', selected' : ''}`}
        aria-pressed={selected}
        className={clsx(
          'w-7 h-7 rounded-[2px] border transition-all cursor-pointer block relative p-0',
          selected
            ? 'border-[var(--ink)] ring-1 ring-[var(--ink)] ring-offset-1'
            : 'border-[var(--line)] hover:border-[var(--ink)]',
          disabled && 'opacity-30 cursor-not-allowed',
          className
        )}
        style={{ backgroundColor: bg }}
      />
      {/* Colour name tooltip on hover */}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block px-1.5 py-0.5 text-[10px] bg-[var(--ink)] text-white rounded-[2px] whitespace-nowrap z-20">
        {name}
      </span>
    </div>
  );
};

