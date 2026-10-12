import React from 'react';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
  className,
}) => {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div
      className={clsx(
        'inline-flex items-center border border-[var(--line)] bg-[var(--surface)] rounded-[2px] h-11',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="group"
      aria-label="Quantity selector"
    >
      <button
        type="button"
        disabled={!canDecrease}
        onClick={() => canDecrease && onChange(value - 1)}
        aria-label="Decrease quantity"
        className="w-11 h-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>

      <span
        aria-live="polite"
        className="min-w-[36px] text-center text-sm font-medium tabular-nums text-[var(--ink)] select-none px-2"
      >
        {value}
      </span>

      <button
        type="button"
        disabled={!canIncrease}
        onClick={() => canIncrease && onChange(value + 1)}
        aria-label="Increase quantity"
        className="w-11 h-full flex items-center justify-center text-[var(--ink)] hover:bg-[var(--line)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
};
