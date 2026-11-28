'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen() {
  const [status, setStatus] = useState<'checking' | 'playing' | 'fading' | 'hidden'>('checking');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const hasSeenSplash = window.sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      setStatus('hidden');
    } else {
      window.sessionStorage.setItem('hasSeenSplash', 'true');
      setStatus('playing');

      // Fallback jika video gagal diputar dalam 7 detik
      const fallback = window.setTimeout(() => {
        setStatus('fading');
      }, 7000);

      return () => window.clearTimeout(fallback);
    }
  }, []);

  // Pengaman tambahan khusus Safari untuk memaksa play() via useRef
  useEffect(() => {
    if (status === 'playing' && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Jika browser memblokir total, langsung fade out ke halaman utama
          setStatus('fading');
        });
      }
    }
  }, [status]);

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
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
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