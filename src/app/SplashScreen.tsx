'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  // Status awal 'checking' membuat layar putih polos langsung muncul dari server
  // sehingga halaman di belakangnya tertutup rapat dan bebas error hydration
  const [status, setStatus] = useState<'checking' | 'playing' | 'fading' | 'hidden'>('checking');

  useEffect(() => {
    const hasSeenSplash = window.sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      // Jika sudah pernah dilihat di sesi ini, langsung hilangkan tanpa animasi
      setStatus('hidden');
    } else {
      // Jika belum pernah, tandai sudah dilihat dan mulai putar video
      window.sessionStorage.setItem('hasSeenSplash', 'true');
      setStatus('playing');

      // Fallback jika video gagal diputar dalam 7 detik
      const fallback = window.setTimeout(() => {
        setStatus('fading');
      }, 7000);

      return () => window.clearTimeout(fallback);
    }
  }, []);

  const handleVideoEnd = () => {
    setStatus('fading');
  };

  const handleFadeEnd = () => {
    if (status === 'fading') {
      setStatus('hidden');
    }
  };

  if (status === 'hidden') return null;

  return (
    <div
      onTransitionEnd={handleFadeEnd}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-700 ${
        status === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {status !== 'checking' && (
        <video
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          onError={handleVideoEnd}
          className="w-full max-w-3xl h-auto object-contain"
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}