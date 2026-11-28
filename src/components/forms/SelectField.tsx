'use client';

import React, {
  SelectHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'default';
  icon?: React.ReactNode;
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue'> {
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  value?: string | number;
  defaultValue?: string | number;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      className,
      options,
      placeholder = 'Pilih salah satu...',
      error,
      value,
      defaultValue,
      onChange,
      disabled,
      required,
      name,
      id,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return '';
    });
    const [openUpward, setOpenUpward] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Forward ref to hidden native select
    useImperativeHandle(ref, () => selectRef.current as HTMLSelectElement);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Synchronize internal state when prop changes externally
    useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(String(value));
      }
    }, [value]);

    // Compute fixed position for the dropdown popover
    const computePopoverStyle = useCallback((): React.CSSProperties => {
      if (!triggerRef.current) return {};
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      const popoverEstimatedHeight = 280;
      const shouldOpenUpward = spaceBelow < popoverEstimatedHeight && spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUpward);

      const popoverWidth = Math.max(rect.width, 220);
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 8) {
        left = Math.max(8, window.innerWidth - popoverWidth - 8);
      }
      left = Math.max(8, left);

      const style: React.CSSProperties = {
        position: 'fixed',
        left: `${left}px`,
        width: `${popoverWidth}px`,
        backgroundColor: '#ffffff',
        zIndex: 99999,
        boxShadow: '0 12px 36px -4px rgba(0,0,0,0.16), 0 4px 12px -2px rgba(0,0,0,0.06)',
        border: '1px solid #E2E8E3',
        borderRadius: '12px',
      };

      if (shouldOpenUpward) {
        style.bottom = `${window.innerHeight - rect.top + 6}px`;
      } else {
        style.top = `${rect.bottom + 6}px`;
      }

      return style;
    }, []);

    // Handle outside click, scroll, resize to keep popover aligned or closed
    useEffect(() => {
      if (!isOpen) return;

      setPopoverStyle(computePopoverStyle());

      const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          popoverRef.current &&
          !popoverRef.current.contains(target)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      const handleScrollOrResize = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsOpen(false);
          return;
        }
        setPopoverStyle(computePopoverStyle());
      };

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }, [isOpen, computePopoverStyle]);

    // Focus search input when dropdown opens (if search is visible)
    useEffect(() => {
      if (isOpen && options.length >= 6) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [isOpen, options.length]);

    // Toggle dropdown and dynamically compute positioning
    const handleToggle = () => {
      if (disabled) return;

      if (!isOpen) {
        setPopoverStyle(computePopoverStyle());
      }

      setIsOpen((prev) => {
        if (prev) setSearchQuery('');
        return !prev;
      });
    };

    const handleSelectOption = (optValue: string | number) => {
      const stringVal = String(optValue);
      setCurrentValue(stringVal);
      setIsOpen(false);
      setSearchQuery('');

      if (selectRef.current) {
        selectRef.current.value = stringVal;
        const nativeEvent = new Event('change', { bubbles: true });
        selectRef.current.dispatchEvent(nativeEvent);
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: stringVal, name: name || '', id: id || '' },
          currentTarget: { value: stringVal, name: name || '', id: id || '' },
          bubbles: true,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }

      triggerRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!isOpen) {
          e.preventDefault();
          handleToggle();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!isOpen && e.target === triggerRef.current) {
          e.preventDefault();
          handleToggle();
        }
      }
    };

    // Filter options if search query is typed
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options;
      const q = searchQuery.toLowerCase();
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(q) || (opt.description && opt.description.toLowerCase().includes(q))
      );
    }, [options, searchQuery]);

    // Find currently selected option
    const selectedOption = options.find(
      (opt) => String(opt.value) === String(currentValue)
    );

    const getBadgeStyle = (variant?: 'success' | 'warning' | 'info' | 'default') => {
      switch (variant) {
        case 'success':
          return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
        case 'warning':
          return 'bg-amber-50 text-amber-800 border-amber-200/80';
        case 'info':
          return 'bg-blue-50 text-blue-800 border-blue-200/80';
        default:
          return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      }
    };

    return (
      <div
        ref={containerRef}
        className="relative w-full text-left"
        onKeyDown={handleKeyDown}
      >
        {/* Hidden native select for form accessibility and data collection */}
        <select
          ref={selectRef}
          name={name}
          id={id}
          value={currentValue}
          onChange={onChange}
          disabled={disabled}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt, idx) => (
            <option key={`${opt.value}-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Modern Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            'group relative flex h-10 w-full items-center justify-between rounded-input border bg-surface px-3.5 py-2 text-sm text-left shadow-2xs transition-all duration-200 ease-out cursor-pointer',
            'border-border hover:border-brand-700/60 hover:bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700',
            isOpen && 'border-brand-700 ring-2 ring-brand-700/20 bg-brand-100/15 shadow-xs',
            error && 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500',
            disabled &&
              'cursor-not-allowed opacity-50 bg-neutral-100/60 hover:border-border hover:bg-neutral-100/60',
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate pr-2">
            {selectedOption?.icon && (
              <span className="shrink-0 text-brand-700 flex items-center justify-center">
                {selectedOption.icon}
              </span>
            )}
            <span
              className={cn(
                'truncate block text-xs sm:text-sm',
                selectedOption && selectedOption.value !== ''
                  ? 'text-text-primary font-medium tracking-tight'
                  : 'text-text-secondary/70 font-normal'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.badge && (
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0',
                  getBadgeStyle(selectedOption.badgeVariant)
                )}
              >
                {selectedOption.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 ease-out',
              isOpen && 'rotate-180 text-brand-700',
              disabled && 'opacity-40'
            )}
          />
        </button>

        {/* Dropdown Menu Popover — rendered with createPortal to document.body to fully escape parent overflow/transform */}
        {isOpen &&
          mounted &&
          createPortal(
            <div
              ref={popoverRef}
              data-selectfield-popover
              role="listbox"
              className="rounded-card p-1.5 animate-pop-in"
              style={popoverStyle}
            >
              {/* Optional search input for option lists */}
              {options.length >= 6 && (
                <div className="px-2.5 pt-1 pb-2 mb-1 border-b border-border/80 flex items-center gap-2 text-xs text-text-secondary">
                  <Search className="h-3.5 w-3.5 text-text-secondary/70 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari opsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-text-primary placeholder:text-text-secondary/60"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1 text-text-primary">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-text-secondary text-center italic">
                    Tidak ada pilihan yang cocok
                  </div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const isSelected = String(opt.value) === String(currentValue);
                    return (
                      <button
                        key={`${opt.value}-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectOption(opt.value)}
                        className={cn(
                          'group flex w-full items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 text-left cursor-pointer select-none active:scale-[0.99] border',
                          isSelected
                            ? 'bg-brand-50/90 border-brand-200/80 text-brand-950 font-medium shadow-2xs'
                            : 'border-transparent text-text-primary hover:bg-neutral-50 hover:border-border/60 hover:text-brand-950'
                        )}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {opt.icon && (
                              <span
                                className={cn(
                                  'shrink-0 text-text-secondary group-hover:text-brand-800 transition-colors flex items-center',
                                  isSelected && 'text-brand-700'
                                )}
                              >
                                {opt.icon}
                              </span>
                            )}
                            <span
                              className={cn(
                                'text-xs sm:text-sm truncate block',
                                isSelected ? 'font-semibold text-brand-950' : 'text-text-primary'
                              )}
                            >
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0',
                                  getBadgeStyle(opt.badgeVariant)
                                )}
                              >
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          {opt.description && (
                            <p
                              className={cn(
                                'text-[11px] leading-relaxed mt-0.5 transition-colors line-clamp-2',
                                isSelected ? 'text-brand-800/80 font-normal' : 'text-text-secondary'
                              )}
                            >
                              {opt.description}
                            </p>
                          )}
                        </div>

                        {/* Right Indicator */}
                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <div className="h-5 w-5 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-xs">
                              <Check className="h-3 w-3 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full border border-border/80 group-hover:border-brand-700/40 group-hover:bg-brand-50/30 transition-all opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
