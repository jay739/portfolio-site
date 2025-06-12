'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ANIMATION } from '@/lib/constants';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

declare global {
  interface Window {
    confetti?: (options: any) => void;
  }
}

export default function ConfettiButton() {
  const [isConfettiLoaded, setIsConfettiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.async = true;
      
      script.onload = () => {
        setIsConfettiLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load confetti script');
        setIsConfettiLoaded(false);
      };

      document.body.appendChild(script);
    } else {
      setIsConfettiLoaded(true);
    }
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isConfettiLoaded) {
        // Wait for confetti to load
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (window.confetti) {
        window.confetti({
          ...ANIMATION.CONFETTI,
          disableForReducedMotion: true,
        });
      }

      // Navigate after animation
      window.location.href = 'https://homarr.jay739.dev';
    } catch (error) {
      console.error('Error triggering confetti:', error);
      // Fallback to direct navigation
      window.location.href = 'https://homarr.jay739.dev';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      href="https://homarr.jay739.dev"
      onClick={handleClick}
      className={`
        px-6 py-3 bg-blue-600 rounded transition
        ${isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-blue-700 hover:scale-105'}
        shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
        ${prefersReducedMotion ? 'hover:scale-100' : ''}
      `}
      aria-label="Access Home Server"
      aria-busy={isLoading}
    >
      {isLoading ? 'Loading...' : '🏠 Access Home Server'}
    </Link>
  );
} 