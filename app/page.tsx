'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { resolveAuthenticatedPath } from '@/lib/auth/schemas';
import { LoadingState } from '@/components/data-display/LoadingState';

export default function Home() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    router.replace(resolveAuthenticatedPath(user));
  }, [isLoading, router, user]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-canvas">
      <LoadingState message="Mengarahkan ke ruang kerja JejakMaterial..." />
    </div>
  );
}
