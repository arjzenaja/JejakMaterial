'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-700 border-t-transparent" />
        <span className="text-sm font-medium text-text-secondary">
          Mengarahkan ke Dashboard JejakMaterial...
        </span>
      </div>
    </div>
  );
}
