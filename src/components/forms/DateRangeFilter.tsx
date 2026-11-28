'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  addMonths,
  setMonth,
  setYear,
  getYear,
  getMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  isBefore,
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
  const [popoverTop, setPopoverTop] = useState(0);
  const [popoverLeft, setPopoverLeft] = useState(0);
  const [popoverWidth, setPopoverWidth] = useState(360);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Compute position relative to viewport & trigger
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const panelWidth = Math.min(360, window.innerWidth - 16);
    let left = rect.right - panelWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));

    const panelHeight = popoverRef.current?.offsetHeight || 440;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const gap = 6;

    const shouldOpenUpward = spaceBelow < panelHeight + gap && spaceAbove > spaceBelow;
    let top: number;
    if (shouldOpenUpward) {
      top = Math.max(8, rect.top - panelHeight - gap);
    } else {
      top = rect.bottom + gap;
      if (top + panelHeight > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - panelHeight - 8);
      }
    }

    setPopoverLeft(left);
    setPopoverTop(top);
    setPopoverWidth(panelWidth);
  }, []);

  // Handle click outside, escape key, scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    computePosition();
    const frameId = requestAnimationFrame(() => computePosition());

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, startDate, endDate, computePosition]);

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

  // Days for the current month grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Sunday end

    return eachDayOfInterval({ start: startDateGrid, end: endDateGrid });
  }, [currentMonth]);

  // Month & Year pagination handlers
  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(e.target.value, 10);
    setCurrentMonth((prev) => setMonth(prev, monthIndex));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth((prev) => setYear(prev, newYear));
  };

  const currentNavYear = getYear(currentMonth);
  const currentNavMonth = getMonth(currentMonth);
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
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen && startDate) {
            const parsed = parseISO(startDate);
            if (isValid(parsed)) setCurrentMonth(parsed);
          }
          setIsOpen(!isOpen);
        }}
        className={cn(
          'group inline-flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium rounded-input border transition-all duration-150 select-none shadow-2xs cursor-pointer h-10',
          'bg-surface text-text-primary hover:bg-neutral-50/80 hover:border-brand-700/60 focus:outline-none focus:ring-2 focus:ring-brand-700/20',
          isOpen
            ? 'border-brand-700 ring-2 ring-brand-700/20 bg-brand-100/10'
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

      {/* Popover Dropdown Panel — rendered via Portal to document.body */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            data-daterange-popover
            className="rounded-card border border-border p-3.5 animate-pop-in space-y-3"
            style={{
              position: 'fixed',
              top: `${popoverTop}px`,
              left: `${popoverLeft}px`,
              width: `${popoverWidth}px`,
              maxHeight: 'min(500px, calc(100vh - 16px))',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              zIndex: 99999,
              boxShadow: '0 12px 40px -4px rgba(0,0,0,0.18), 0 4px 12px -2px rgba(0,0,0,0.08)',
              border: '1px solid #E2E8E3',
              borderRadius: '12px',
            }}
          >
            {/* Header & Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <CalendarRange className="h-3.5 w-3.5 text-brand-700" />
                  Filter Rentang Tanggal
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-text-secondary hover:text-brand-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  title="Kembalikan periode semula"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Quick Presets Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-border">
                {PRESETS.map((preset) => {
                  const { start, end } = preset.getValue();
                  const isActive = tempStart === start && tempEnd === end;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={cn(
                        'px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all duration-150 cursor-pointer',
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

            {/* Month & Year Navigation Bar */}
            <div className="flex items-center justify-between gap-1.5 bg-neutral-50 px-2 py-1.5 rounded-lg border border-border">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <select
                    value={currentNavMonth}
                    onChange={handleMonthChange}
                    className="appearance-none bg-white text-xs font-semibold text-text-primary py-1 pl-2.5 pr-6 rounded-md border border-border hover:border-brand-700/50 focus:border-brand-700 focus:ring-1 focus:ring-brand-700/20 outline-none cursor-pointer transition-colors shadow-2xs"
                    aria-label="Pilih Bulan"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx} value={idx}>
                        {name}
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
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-3 w-3 text-text-secondary pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md text-text-secondary hover:text-brand-950 hover:bg-white transition-all border border-transparent hover:border-border cursor-pointer active:scale-90 shadow-2xs"
                  aria-label="Bulan sebelumnya"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md text-text-secondary hover:text-brand-950 hover:bg-white transition-all border border-transparent hover:border-border cursor-pointer active:scale-90 shadow-2xs"
                  aria-label="Bulan berikutnya"
                  title="Bulan berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Calendar Days Table */}
            <div className="space-y-1">
              {/* Weekdays header: Senin - Minggu */}
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

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {calendarDays.map((day, idx) => {
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
                        'relative h-8 text-xs font-medium transition-all duration-150 flex items-center justify-center cursor-pointer select-none',
                        !isCurrentMonth && 'text-neutral-300 opacity-50',
                        isCurrentMonth && !isInRange && !isStart && !isEnd && 'text-text-primary hover:bg-brand-50 hover:text-brand-900 rounded-md',
                        // Range middle styling
                        isInRange && !isStart && !isEnd && 'bg-brand-50 text-brand-950 font-semibold',
                        // Start date styling
                        isStart &&
                          (isEnd && !isSingleSelected
                            ? 'bg-brand-700 text-white font-bold rounded-l-md shadow-xs ring-2 ring-brand-700/20'
                            : 'bg-brand-700 text-white font-bold rounded-md shadow-xs ring-2 ring-brand-700/20'),
                        // End date styling
                        isEnd &&
                          (!isSingleSelected
                            ? 'bg-brand-700 text-white font-bold rounded-r-md shadow-xs ring-2 ring-brand-700/20'
                            : 'bg-brand-700 text-white font-bold rounded-md shadow-xs ring-2 ring-brand-700/20'),
                        // Today border indicator if not selected
                        isToday && !isStart && !isEnd && !isInRange && 'border border-brand-700/50 font-bold text-brand-900 bg-brand-100/40 rounded-md'
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Date Inputs */}
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
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/80">
              <span className="text-[11px] text-text-secondary font-medium truncate">
                {isSelectingEnd ? (
                  <span className="text-brand-700 font-semibold animate-pulse">
                    Pilih tanggal akhir...
                  </span>
                ) : tempStart && tempEnd ? (
                  <span>Rentang dipilih</span>
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
          </div>,
          document.body
        )}
    </div>
  );
}
