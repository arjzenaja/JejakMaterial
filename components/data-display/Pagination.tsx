import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-border mt-4">
      {total !== undefined ? (
        <span className="text-xs text-text-secondary">
          Total: <strong className="text-text-primary">{total}</strong> data
        </span>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <span className="text-xs font-medium text-text-secondary px-2">
          Halaman {currentPage} dari {lastPage}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
