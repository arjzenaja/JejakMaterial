import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat data...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-700 mb-3" />
      <p className="text-sm font-medium text-text-secondary">{message}</p>
    </div>
  );
}
