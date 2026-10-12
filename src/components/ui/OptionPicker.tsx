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
                'min-w-[48px] h-10 px-3 text-xs font-medium border rounded-[2px] transition-colors cursor-pointer select-none',
                isSelected
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-semibold'
                  : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]',
                isDisabled &&
                  'opacity-40 cursor-not-allowed bg-[var(--bg)] border-[var(--line)] text-[var(--ink-muted)] line-through'
              )}
            >
              {opt.label || opt.value}
              {opt.soldOut && <span className="sr-only"> (Sold out)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
