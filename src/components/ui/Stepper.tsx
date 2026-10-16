import React from 'react';
import clsx from 'clsx';

export interface StepItem {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStepIndex,
  className,
}) => {
  return (
    <nav aria-label="Progress" className={clsx('w-full py-4', className)}>
      <ol className="flex items-center justify-between text-[11px] sm:text-xs md:text-sm list-none p-0 m-0 border-b border-[var(--line)] pb-3 gap-2 overflow-x-auto">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <li
              key={step.id}
              className={clsx(
                'flex items-center gap-1 font-medium tracking-wide shrink-0 sm:shrink',
                isCurrent && 'text-[var(--ink)] font-semibold',
                isCompleted && 'text-[var(--ink)] opacity-70',
                !isCurrent && !isCompleted && 'text-[var(--ink-muted)] opacity-50'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="tabular-nums font-bold">{idx + 1}.</span>
              <span className="whitespace-nowrap">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
