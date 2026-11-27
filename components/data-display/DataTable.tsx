import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total?: number;
    onPageChange: (page: number) => void;
  };
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  pagination,
  keyExtractor,
  className,
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm text-text-primary border-collapse">
          <thead>
            <tr className="border-b border-border bg-canvas/80 text-xs font-semibold text-text-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item, index) => {
              const key = keyExtractor
                ? keyExtractor(item, index)
                : (item as any)?.id || index;

              return (
                <tr
                  key={key}
                  className="hover:bg-neutral-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 whitespace-nowrap',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as any)[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
