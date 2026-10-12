import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
}) => {
  return (
    <div
      style={{ width, height }}
      aria-hidden="true"
      className={clsx(
        'bg-[var(--line)] rounded-[2px] opacity-60',
        className
      )}
    />
  );
};
