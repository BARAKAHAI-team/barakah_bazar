'use client';

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  side = 'left',
  children,
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previouslyFocusedElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Navigation Drawer'}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={clsx(
          'relative w-full max-w-sm h-full bg-[var(--surface)] z-10 flex flex-col border-[var(--line)] transition-transform duration-150 ease-out',
          side === 'left' ? 'border-r mr-auto' : 'border-l ml-auto',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
          <h2 className="font-serif text-lg text-[var(--ink)] m-0">
            {title || ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 -mr-2 text-[var(--ink-muted)] hover:text-[var(--ink)] rounded-[2px] cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};
