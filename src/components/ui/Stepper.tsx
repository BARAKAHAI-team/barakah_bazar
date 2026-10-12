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
      <ol className="flex items-center justify-between text-xs sm:text-sm list-none p-0 m-0 border-b border-[var(--line)] pb-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <li
              key={step.id}
              className={clsx(
                'flex items-center gap-1.5 font-medium tracking-wide',
                isCurrent && 'text-[var(--ink)] font-semibold',
                isCompleted && 'text-[var(--ink)] opacity-70',
                !isCurrent && !isCompleted && 'text-[var(--ink-muted)] opacity-50'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="tabular-nums">{idx + 1}.</span>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
