'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangeFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="flex items-center gap-1.5 bg-surface border border-border rounded-input px-2.5 py-1 text-xs text-text-secondary">
        <Calendar className="h-3.5 w-3.5 text-brand-700 shrink-0" />
        <span>Periode:</span>
      </div>
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="h-9 w-36 text-xs"
      />
      <span className="text-xs text-text-secondary font-medium">s/d</span>
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="h-9 w-36 text-xs"
      />
    </div>
  );
}
