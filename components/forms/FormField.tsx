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
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
      {error && <span className="text-xs font-medium text-danger">{error}</span>}
      {hint && !error && <span className="text-xs text-text-secondary">{hint}</span>}
    </div>
  );
}
