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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Color ${name}${selected ? ', selected' : ''}`}
      aria-pressed={selected}
      className={clsx(
        'group flex items-center gap-2 p-1 text-xs cursor-pointer border-0 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
    >
      <span
        style={{ backgroundColor: bg, borderRadius: '9999px' }}
        className={clsx(
          'w-6 h-6 border border-[var(--line)] transition-all block',
          selected && 'outline outline-2 outline-[var(--ink)] outline-offset-2'
        )}
      />
      <span
        className={clsx(
          'text-xs select-none',
          selected ? 'font-medium text-[var(--ink)]' : 'text-[var(--ink-muted)]'
        )}
      >
        {name}
      </span>
    </button>
  );
};
