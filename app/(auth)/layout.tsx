'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { resolveAuthenticatedPath } from '@/lib/auth/schemas';
import { LoadingState } from '@/components/data-display/LoadingState';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace(resolveAuthenticatedPath(user));
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <LoadingState message="Memeriksa sesi pengguna..." />
      </div>
    );
  }

  return <>{children}</>;
}
