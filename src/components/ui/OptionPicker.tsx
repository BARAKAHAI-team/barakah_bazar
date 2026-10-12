import React from 'react';
import clsx from 'clsx';

export interface OptionItem {
  value: string;
  label?: string;
  disabled?: boolean;
  soldOut?: boolean;
}

export interface OptionPickerProps {
  label: string;
  options: OptionItem[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const OptionPicker: React.FC<OptionPickerProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--ink-muted)]">
          {label}: <span className="text-[var(--ink)] font-semibold">{selectedValue}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const isSelected = opt.value === selectedValue;
          const isDisabled = opt.disabled || opt.soldOut;

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isDisabled}
              onClick={() => onChange(opt.value)}
              className={clsx(
                'relative min-w-[44px] h-10 px-3 text-xs font-semibold border rounded-[2px] transition-colors cursor-pointer select-none overflow-hidden flex items-center justify-center',
                isSelected
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-white'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]',
                isDisabled &&
                  'opacity-40 cursor-not-allowed bg-[var(--bg)] border-[var(--line)] text-[var(--ink-muted)]'
              )}
            >
              <span className={clsx(isDisabled && 'line-through')}>{opt.label || opt.value}</span>
              {isDisabled && (
                <svg
                  className="absolute inset-0 w-full h-full text-[var(--line-strong)] stroke-current pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <line x1="0" y1="100" x2="100" y2="0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
              )}
              {opt.soldOut && <span className="sr-only"> (Sold out)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
