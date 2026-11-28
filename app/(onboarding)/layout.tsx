'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { LoadingState } from '@/components/data-display/LoadingState';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.organization_id != null) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !isAuthenticated || user?.organization_id != null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <LoadingState message="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  return <>{children}</>;
}
