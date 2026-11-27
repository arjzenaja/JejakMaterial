import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  required = false,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-xs font-semibold text-text-primary">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {hint && !error && <span className="text-xs text-text-secondary">{hint}</span>}
    </div>
  );
}
