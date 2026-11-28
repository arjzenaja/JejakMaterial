'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animation?: 'scale-up' | 'slide-down' | 'slide-up';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  animation = 'scale-up',
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small frame delay to ensure DOM is ready for enter transition
      const frame = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsAnimating(false);
      // Wait for exit transition duration (260ms) before unmounting
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsRendered(false);
      }, 260);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isRendered) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const getAnimationClasses = () => {
    if (animation === 'slide-down') {
      return isAnimating
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 -translate-y-5 scale-[0.98] pointer-events-none';
    }
    if (animation === 'slide-up') {
      return isAnimating
        ? 'opacity-100 translate-y-0 scale-100'
        : 'opacity-0 translate-y-6 scale-[0.98] pointer-events-none';
    }
    // Default 'scale-up'
    return isAnimating
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-3 sm:translate-y-4 scale-[0.96] pointer-events-none';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with smooth fade transition */}
      <div
        className={cn(
          'fixed inset-0 bg-neutral-950/50 backdrop-blur-xs transition-opacity duration-260 ease-out',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box with smooth physics-based transition */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full overflow-visible rounded-card bg-surface p-6 shadow-2xl border border-border transition-all duration-260 ease-[cubic-bezier(0.16,1,0.3,1)]',
          getAnimationClasses(),
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-text-secondary mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-input p-1.5 text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-all duration-150 hover:rotate-90 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
