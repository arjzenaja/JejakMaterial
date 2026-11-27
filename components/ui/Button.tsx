import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary: 'bg-brand-700 text-white hover:bg-brand-900 shadow-sm',
      secondary: 'bg-brand-100 text-brand-950 hover:bg-emerald-100',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
      ghost: 'bg-transparent text-text-primary hover:bg-neutral-100',
      outline: 'border border-border bg-surface text-text-primary hover:bg-neutral-50',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-input gap-1.5',
      md: 'h-10 px-4 text-sm rounded-input gap-2',
      lg: 'h-11 px-6 text-base rounded-card gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
