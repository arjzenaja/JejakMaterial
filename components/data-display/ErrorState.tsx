import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kendala saat menghubungi server. Silakan coba kembali.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-card border border-rose-200 bg-rose-50/50">
      <div className="p-3 rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <p className="text-sm text-rose-700 max-w-sm mt-1">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
