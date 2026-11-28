import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  description,
  icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface p-5 shadow-sm hover:shadow transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <div className="p-2.5 rounded-input bg-brand-100 text-brand-700 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-text-secondary">{unit}</span>}
      </div>

      {(description || trend) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'font-medium inline-flex items-center gap-0.5',
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {description && <span className="text-text-secondary">{description}</span>}
        </div>
      )}
    </div>
  );
}
