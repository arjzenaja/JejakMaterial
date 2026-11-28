'use client';

import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (val: string) => void;
}

export function SearchInput({
  className,
  placeholder = 'Cari data...',
  value,
  onChange,
  onSearchChange,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center w-full max-w-sm', className)}>
      <Search className="absolute left-3 h-4 w-4 text-text-secondary pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange?.(e);
          onSearchChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="h-10 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 transition-colors"
        {...props}
      />
    </div>
  );
}
