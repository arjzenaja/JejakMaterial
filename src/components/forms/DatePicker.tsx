'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  subDays,
  addDays,
  setMonth,
  setYear,
  getYear,
  getMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
} from 'date-fns';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface DatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  align?: 'left' | 'right' | 'auto';
  minDate?: string;
  maxDate?: string;
  rangePartnerDate?: string;
  rangeMode?: 'start' | 'end';
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  error,
  disabled,
  required,
  className,
  name,
  id,
  align = 'left',
  minDate,
  maxDate,
  rangePartnerDate,
  rangeMode,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [popoverLeft, setPopoverLeft] = useState(0);
  const [popoverTop, setPopoverTop] = useState(0);
  const [popoverWidth, setPopoverWidth] = useState(320);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Month currently viewed in the calendar
  const initialViewDate = useMemo(() => {
    if (value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) return parsed;
    }
    return new Date();
  }, [value]);

  const [viewDate, setViewDate] = useState<Date>(initialViewDate);

  // Keep viewDate updated if value changes from outside
  useEffect(() => {
    if (value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) {
        setViewDate(parsed);
      }
    }
  }, [value]);

  // Dynamically compute popover position relative to trigger button and viewport
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const calendarWidth = 320;

    // Trigger is unmounted or completely hidden
    if (rect.width === 0 && rect.height === 0) return;

    const popoverHeight = popoverRef.current?.offsetHeight || 370;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const gap = 6;

    // Flip to top if insufficient space below and more space above
    const shouldOpenUpward = spaceBelow < popoverHeight + gap && spaceAbove > spaceBelow;
    setOpenUpward(shouldOpenUpward);

    // Calculate left position based on alignment setting
    let left: number;
    if (align === 'right') {
      left = rect.right - calendarWidth;
    } else if (align === 'auto') {
      if (rect.left + calendarWidth > window.innerWidth - 8) {
        left = rect.right - calendarWidth;
      } else {
        left = rect.left;
      }
    } else {
      // align === 'left' (default)
      left = rect.left;
      if (left + calendarWidth > window.innerWidth - 8) {
        left = rect.right - calendarWidth;
      }
    }

    // Clamp horizontal position strictly within viewport padding
    left = Math.max(8, Math.min(left, window.innerWidth - calendarWidth - 8));

    // Calculate vertical position
    let top: number;
    if (shouldOpenUpward) {
      top = Math.max(8, rect.top - popoverHeight - gap);
    } else {
      top = rect.bottom + gap;
      if (top + popoverHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - popoverHeight - 8);
      }
    }

    setPopoverLeft(left);
    setPopoverTop(top);
    setPopoverWidth(calendarWidth);
  }, [align]);

  // Click outside, keydown, scroll and resize listeners when popover is open
  useEffect(() => {
    if (!isOpen) return;

    computePosition();
    const frameId = requestAnimationFrame(() => {
      computePosition();
    });

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleScrollOrResize() {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsOpen(false);
          return;
        }
        computePosition();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, computePosition]);

  // Observe element resizing to maintain accurate position
  useEffect(() => {
    if (!isOpen || !triggerRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      computePosition();
    });
    observer.observe(triggerRef.current);
    if (popoverRef.current) {
      observer.observe(popoverRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [isOpen, computePosition]);

  // Handle open / toggle
  const handleToggle = () => {
    if (disabled) return;

    if (!isOpen) {
      computePosition();
      if (value) {
        const parsed = parseISO(value);
        if (isValid(parsed)) setViewDate(parsed);
      }
    }

    setIsOpen((prev) => !prev);
  };

  // Month navigation
  const handlePrevMonth = () => setViewDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate((prev) => addMonths(prev, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = parseInt(e.target.value, 10);
    setViewDate((prev) => setMonth(prev, m));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const y = parseInt(e.target.value, 10);
    setViewDate((prev) => setYear(prev, y));
  };

  // Year choices
  const currentNavYear = getYear(viewDate);
  const currentNavMonth = getMonth(viewDate);
  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = thisYear - 6; y <= thisYear + 5; y++) {
      years.push(y);
    }
    if (!years.includes(currentNavYear)) {
      years.push(currentNavYear);
      years.sort((a, b) => a - b);
    }
    return years;
  }, [currentNavYear]);

  // Calendar days grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Sunday end

    return eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
  }, [viewDate]);

  // Date selection
  const handleSelectDate = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    onChange?.(formatted);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Quick preset shortcuts
  const selectToday = () => handleSelectDate(new Date());
  const selectYesterday = () => handleSelectDate(subDays(new Date(), 1));
  const selectStartOfMonth = () => handleSelectDate(startOfMonth(viewDate));
  const selectEndOfMonth = () => handleSelectDate(endOfMonth(viewDate));

  // Parsed active values for ranges and constraints
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const d = parseISO(value);
    return isValid(d) ? d : null;
  }, [value]);

  const parsedMinDate = useMemo(() => {
    if (!minDate) return null;
    const d = parseISO(minDate);
    return isValid(d) ? d : null;
  }, [minDate]);

  const parsedMaxDate = useMemo(() => {
    if (!maxDate) return null;
    const d = parseISO(maxDate);
    return isValid(d) ? d : null;
  }, [maxDate]);

  const parsedPartnerDate = useMemo(() => {
    if (!rangePartnerDate) return null;
    const d = parseISO(rangePartnerDate);
    return isValid(d) ? d : null;
  }, [rangePartnerDate]);

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* Hidden native input for form accessibility */}
      <input
        type="date"
        name={name}
        id={id}
        value={value || ''}
        required={required}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        readOnly
      />

      {/* Modern Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          'group relative flex h-10 w-full items-center justify-between rounded-input border bg-surface px-3 py-2 text-sm text-left shadow-2xs transition-all duration-200 ease-out cursor-pointer',
          'border-border hover:border-brand-700/60 hover:bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700',
          isOpen && 'border-brand-700 ring-2 ring-brand-700/20 bg-brand-100/15 shadow-xs',
          error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
          disabled &&
            'cursor-not-allowed opacity-50 bg-neutral-100/60 hover:border-border hover:bg-neutral-100/60',
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <div
            className={cn(
              'p-1 rounded-md transition-colors',
              isOpen ? 'bg-brand-100 text-brand-900' : 'bg-canvas text-brand-700 group-hover:bg-brand-50'
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          </div>
          <span
            className={cn(
              'truncate block text-xs sm:text-sm',
              parsedValue
                ? 'text-text-primary font-medium tracking-tight'
                : 'text-text-secondary/70 font-normal'
            )}
          >
            {parsedValue ? formatDate(value, 'dd MMMM yyyy') : placeholder}
          </span>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 ease-out ml-2',
            isOpen && 'rotate-180 text-brand-700',
            disabled && 'opacity-40'
          )}
        />
      </button>

      {/* Popover Calendar — rendered via Portal to document.body to fully escape parent transforms & overflow */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            data-datepicker-popover
            className="rounded-card border border-border p-3.5 animate-pop-in"
            style={{
              position: 'fixed',
              top: `${popoverTop}px`,
              left: `${popoverLeft}px`,
              width: `${popoverWidth}px`,
              maxHeight: 'min(440px, calc(100vh - 16px))',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              zIndex: 99999,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8E3',
              borderRadius: '12px',
            }}
          >
          {/* Quick Preset Chips */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Pintasan:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={selectYesterday}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md border border-border bg-neutral-50 text-text-secondary hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 transition-all duration-150 cursor-pointer active:scale-95"
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={selectToday}
                className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-brand-700/30 bg-brand-100/60 text-brand-900 hover:bg-brand-100 hover:border-brand-700/60 transition-all duration-150 cursor-pointer active:scale-95"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={rangeMode === 'end' ? selectEndOfMonth : selectStartOfMonth}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md border border-border bg-neutral-50 text-text-secondary hover:bg-brand-50 hover:text-brand-900 hover:border-brand-300 transition-all duration-150 cursor-pointer active:scale-95"
              >
                {rangeMode === 'end' ? 'Akhir Bulan' : 'Awal Bulan'}
              </button>
            </div>
          </div>

          {/* Month & Year Navigation */}
          <div className="flex items-center justify-between gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-border mb-2.5 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-text-secondary hover:text-brand-950 hover:bg-white transition-all border border-transparent hover:border-border cursor-pointer active:scale-90 shadow-2xs"
              title="Bulan sebelumnya"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <div className="relative">
                <select
                  value={currentNavMonth}
                  onChange={handleMonthChange}
                  className="appearance-none bg-white text-xs font-semibold text-text-primary py-1 pl-2.5 pr-6 rounded-md border border-border hover:border-brand-700/50 focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 outline-none cursor-pointer transition-colors shadow-2xs"
                  aria-label="Pilih Bulan"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-text-secondary pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="relative">
                <select
                  value={currentNavYear}
                  onChange={handleYearChange}
                  className="appearance-none bg-white text-xs font-semibold text-text-primary py-1 pl-2 pr-5.5 rounded-md border border-border hover:border-brand-700/50 focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 outline-none cursor-pointer transition-colors shadow-2xs"
                  aria-label="Pilih Tahun"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-text-secondary pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-text-secondary hover:text-brand-950 hover:bg-white transition-all border border-transparent hover:border-border cursor-pointer active:scale-90 shadow-2xs"
              title="Bulan berikutnya"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="space-y-1">
            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center mb-1">
              {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mn'].map((wd, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold text-text-secondary/80 py-0.5 uppercase tracking-wider"
                >
                  {wd}
                </span>
              ))}
            </div>

            {/* Days Numbers */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isToday = isSameDay(day, new Date());
                const isSelected = parsedValue ? isSameDay(day, parsedValue) : false;

                // Check disabled limits
                const isBeforeMin = parsedMinDate ? isBefore(day, parsedMinDate) && !isSameDay(day, parsedMinDate) : false;
                const isAfterMax = parsedMaxDate ? isAfter(day, parsedMaxDate) && !isSameDay(day, parsedMaxDate) : false;
                const isDateDisabled = isBeforeMin || isAfterMax;

                // Check range highlight if rangePartnerDate is present
                let isInRange = false;
                if (parsedValue && parsedPartnerDate && !isSelected) {
                  const startRange = isBefore(parsedValue, parsedPartnerDate) ? parsedValue : parsedPartnerDate;
                  const endRange = isAfter(parsedValue, parsedPartnerDate) ? parsedValue : parsedPartnerDate;
                  isInRange =
                    (isAfter(day, startRange) || isSameDay(day, startRange)) &&
                    (isBefore(day, endRange) || isSameDay(day, endRange));
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDateDisabled}
                    onClick={() => !isDateDisabled && handleSelectDate(day)}
                    className={cn(
                      'h-8 w-8 mx-auto text-xs transition-all duration-150 flex items-center justify-center rounded-lg select-none',
                      isDateDisabled && 'opacity-20 cursor-not-allowed text-neutral-400 hover:bg-transparent',
                      !isDateDisabled && 'cursor-pointer active:scale-90',
                      !isDateDisabled && !isCurrentMonth && !isSelected && !isInRange && 'text-neutral-400 opacity-60 hover:bg-neutral-100 hover:text-text-secondary',
                      !isDateDisabled && isCurrentMonth && !isSelected && !isToday && !isInRange && 'text-text-primary font-medium hover:bg-brand-50 hover:text-brand-950',
                      !isDateDisabled && isInRange && !isSelected && 'bg-brand-50 text-brand-900 font-semibold rounded-md',
                      !isDateDisabled && isToday && !isSelected && 'border border-brand-700/50 font-bold text-brand-900 bg-brand-100/40 hover:bg-brand-100',
                      isSelected && 'bg-brand-700 text-white font-bold shadow-xs hover:bg-brand-800 ring-2 ring-brand-700/30 scale-100'
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2.5 mt-2.5 border-t border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary truncate pr-2">
              <span className="font-semibold text-text-primary">Terpilih:</span>
              <span className="truncate text-brand-900 font-medium">
                {parsedValue ? formatDate(value, 'dd MMM yyyy') : 'Belum dipilih'}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6.5 text-xs px-2.5 text-text-secondary hover:text-text-primary hover:bg-neutral-100 shrink-0 cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
