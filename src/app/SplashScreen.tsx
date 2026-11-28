'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen() {
  const [status, setStatus] = useState<'checking' | 'playing' | 'fading' | 'hidden'>('checking');
  const [videoSource, setVideoSource] = useState('/videos/intro.mp4');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const hasSeenSplash = window.sessionStorage.getItem('hasSeenSplash');

    if (hasSeenSplash) {
      setStatus('hidden');
    } else {
      window.sessionStorage.setItem('hasSeenSplash', 'true');
      
      // Deteksi otomatis perangkat: Jika Safari / Mac, gunakan file .mov, selain itu .mp4
      const ua = navigator.userAgent;
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua);
      
      if (isSafari) {
        setVideoSource('/videos/intro.mov');
      } else {
        setVideoSource('/videos/intro.mp4');
      }

      setStatus('playing');

      const fallback = window.setTimeout(() => {
        setStatus('fading');
      }, 6000);

      return () => window.clearTimeout(fallback);
    }
  }, []);

  useEffect(() => {
    if (status === 'playing' && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
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
          src={videoSource}
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onEnded={handleVideoEnd}
          onError={handleVideoEnd}
          className="w-full max-w-3xl h-auto object-contain"
        />
      )}
    </div>
  );
}