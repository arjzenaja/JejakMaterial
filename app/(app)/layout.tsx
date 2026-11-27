'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LoadingState } from '@/components/data-display/LoadingState';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <LoadingState message="Memverifikasi sesi pengguna..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
