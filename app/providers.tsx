'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/feedback/Toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
