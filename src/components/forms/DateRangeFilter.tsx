'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  CalendarRange,
} from 'lucide-react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

const PRESETS = [
  {
    label: 'Hari Ini',
    getValue: () => {
      const today = new Date();
      const dateStr = format(today, 'yyyy-MM-dd');
      return { start: dateStr, end: dateStr };
    },
  },
  {
    label: '7 Hari',
    getValue: () => {
      const today = new Date();
      return {
        start: format(subDays(today, 6), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: '30 Hari',
    getValue: () => {
      const today = new Date();
      return {
        start: format(subDays(today, 29), 'yyyy-MM-dd'),
        end: format(today, 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'Bulan Ini',
    getValue: () => {
      const today = new Date();
      return {
        start: format(startOfMonth(today), 'yyyy-MM-dd'),
        end: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    },
  },
  {
    label: 'Bulan Lalu',
    getValue: () => {
      const prev = subMonths(new Date(), 1);
      return {
        start: format(startOfMonth(prev), 'yyyy-MM-dd'),
        end: format(endOfMonth(prev), 'yyyy-MM-dd'),
      };
    },
  },
];

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Temporary selection state while interacting with the popover
  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // Calendar month navigation state
  const initialMonth = useMemo(() => {
    if (startDate) {
      const parsed = parseISO(startDate);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [startDate]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialMonth);

  // Synchronize internal state when props change externally
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset temp state back to committed props
        setTempStart(startDate);
        setTempEnd(endDate);
        setIsSelectingEnd(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setTempStart(startDate);
        setTempEnd(endDate);
        setIsSelectingEnd(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, startDate, endDate]);

  // Date parsing helpers
  const parsedStart = useMemo(() => {
    if (!tempStart) return null;
    const d = parseISO(tempStart);
    return isValid(d) ? d : null;
  }, [tempStart]);

  const parsedEnd = useMemo(() => {
    if (!tempEnd) return null;
    const d = parseISO(tempEnd);
    return isValid(d) ? d : null;
  }, [tempEnd]);

  // Days for the current month grid (including leading/trailing padding days from adjacent weeks)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Sunday end

    return eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
  }, [currentMonth]);

  // Handlers for month pagination
  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => subMonths(prev, -1));

  // Handle day click
  const handleDateClick = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');

    if (!isSelectingEnd) {
      // First click: select start date
      setTempStart(dayStr);
      setTempEnd('');
      setIsSelectingEnd(true);
    } else {
      // Second click: select end date
      if (parsedStart && isBefore(day, parsedStart)) {
        // If clicked date is before start date, swap them
        setTempStart(dayStr);
        setTempEnd(tempStart);
      } else {
        setTempEnd(dayStr);
      }
      setIsSelectingEnd(false);
    }
  };

  // Quick preset selection
  const handleApplyPreset = (preset: (typeof PRESETS)[number]) => {
    const { start, end } = preset.getValue();
    setTempStart(start);
    setTempEnd(end);
    setIsSelectingEnd(false);

    const parsed = parseISO(start);
    if (isValid(parsed)) {
      setCurrentMonth(parsed);
    }

    onStartDateChange(start);
    onEndDateChange(end);
    setIsOpen(false);
  };

  // Commit changes
  const handleApply = () => {
    if (tempStart) {
      const finalEnd = tempEnd || tempStart;
      onStartDateChange(tempStart);
      onEndDateChange(finalEnd);
    }
    setIsOpen(false);
    setIsSelectingEnd(false);
  };

  // Reset to original props
  const handleReset = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setIsSelectingEnd(false);
    if (startDate) {
      const parsed = parseISO(startDate);
      if (isValid(parsed)) setCurrentMonth(parsed);
    }
  };

  // Formatted trigger label
  const formattedRange = useMemo(() => {
    const s = startDate ? parseISO(startDate) : null;
    const e = endDate ? parseISO(endDate) : null;

    if (s && isValid(s) && e && isValid(e)) {
      return `${format(s, 'dd MMM yyyy')} — ${format(e, 'dd MMM yyyy')}`;
    }
    if (s && isValid(s)) {
      return format(s, 'dd MMM yyyy');
    }
    return 'Pilih Periode';
  }, [startDate, endDate]);

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && startDate) {
            const parsed = parseISO(startDate);
            if (isValid(parsed)) setCurrentMonth(parsed);
          }
        }}
        className={cn(
          'group inline-flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-input border transition-all duration-150 select-none shadow-xs',
          'bg-surface text-text-primary hover:bg-neutral-50/80 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-700/20',
          isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/15 bg-neutral-50/50'
            : 'border-border'
        )}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="flex items-center gap-1.5 text-text-secondary">
          <CalendarIcon className="h-4 w-4 text-brand-700 shrink-0 transition-transform group-hover:scale-105" />
          <span className="font-semibold text-text-secondary text-[11px] uppercase tracking-wider">
            Periode
          </span>
        </span>
        <span className="h-3.5 w-px bg-border mx-0.5" />
        <span className="font-semibold text-text-primary tabular-nums">
          {formattedRange}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-text-secondary transition-transform duration-200 shrink-0 ml-0.5',
            isOpen && 'rotate-180 text-brand-700'
          )}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-[calc(100vw-2rem)] sm:w-[350px] max-w-[360px]',
            'bg-surface rounded-card border border-border shadow-xl ring-1 ring-black/5',
            'p-4 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {/* Header & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5 text-brand-700" />
                Pilih Rentang Waktu
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-text-secondary hover:text-brand-700 flex items-center gap-1 font-medium transition-colors"
                title="Kembalikan periode semula"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Quick Presets Pills */}
            <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border">
              {PRESETS.map((preset) => {
                const { start, end } = preset.getValue();
                const isActive = tempStart === start && tempEnd === end;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={cn(
                      'px-2 py-1 text-[11px] font-medium rounded-md border transition-all duration-150',
                      isActive
                        ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                        : 'bg-canvas text-text-secondary border-border hover:bg-neutral-100 hover:text-text-primary'
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-primary">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-neutral-100 transition-colors border border-border"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-neutral-100 transition-colors border border-border"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Days Table */}
          <div className="space-y-1">
            {/* Weekdays header: Senin - Minggu */}
            <div className="grid grid-cols-7 text-center">
              {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mn'].map((wd, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold text-text-secondary py-1 uppercase tracking-wider"
                >
                  {wd}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {calendarDays.map((day, idx) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());

                const isStart = tempStart ? isSameDay(day, parseISO(tempStart)) : false;
                const isEnd = tempEnd ? isSameDay(day, parseISO(tempEnd)) : false;
                const isInRange =
                  parsedStart && parsedEnd
                    ? isWithinInterval(day, { start: parsedStart, end: parsedEnd })
                    : false;

                const isSingleSelected = isStart && (isEnd || !tempEnd);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      'relative h-8 text-xs font-medium transition-all duration-150 flex items-center justify-center',
                      !isCurrentMonth && 'text-neutral-300 opacity-60',
                      isCurrentMonth && !isInRange && !isStart && !isEnd && 'text-text-primary hover:bg-neutral-100 rounded-md',
                      // Range middle styling
                      isInRange && !isStart && !isEnd && 'bg-brand-100/80 text-brand-950 font-semibold',
                      // Start date styling
                      isStart &&
                        (isEnd && !isSingleSelected
                          ? 'bg-brand-700 text-white font-bold rounded-l-md shadow-xs'
                          : 'bg-brand-700 text-white font-bold rounded-md shadow-xs'),
                      // End date styling
                      isEnd &&
                        (!isSingleSelected
                          ? 'bg-brand-700 text-white font-bold rounded-r-md shadow-xs'
                          : 'bg-brand-700 text-white font-bold rounded-md shadow-xs'),
                      // Today border indicator if not selected
                      isToday && !isStart && !isEnd && !isInRange && 'border border-brand-700/40 rounded-md font-bold'
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Input Inputs (Collapsible or compact) */}
          <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Dari
              </label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => {
                  setTempStart(e.target.value);
                  const p = parseISO(e.target.value);
                  if (isValid(p)) setCurrentMonth(p);
                }}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-canvas text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Sampai
              </label>
              <input
                type="date"
                value={tempEnd}
                min={tempStart}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-md border border-border bg-canvas text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <span className="text-[11px] text-text-secondary font-medium truncate">
              {isSelectingEnd ? (
                <span className="text-brand-700 font-semibold animate-pulse">
                  Pilih tanggal akhir...
                </span>
              ) : tempStart && tempEnd ? (
                <span>Siap diterapkan</span>
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setTempStart(startDate);
                  setTempEnd(endDate);
                  setIsSelectingEnd(false);
                }}
                className="h-7 text-xs px-2.5"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApply}
                className="h-7 text-xs px-3 gap-1 shadow-xs"
              >
                <Check className="h-3 w-3" />
                Terapkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
