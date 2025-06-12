'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

const CustomCursor: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [mounted]);

  // Smooth trail animation with image trail effect
  useEffect(() => {
    if (!mounted) return;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime > 80) { // ~12fps for smoother image trail
        setTrail(prevTrail => {
          const newTrail = [...prevTrail];
          
          // Add new point at mouse position
          newTrail.unshift({ x: mousePos.x, y: mousePos.y, age: 0 });
          
          // Update ages and remove old points
          const updatedTrail = newTrail
            .map(point => ({ ...point, age: point.age + deltaTime }))
            .filter(point => point.age < 1200) // Trail duration in ms
            .slice(0, 15); // Max trail length for images
          
          return updatedTrail;
        });
        
        lastTimeRef.current = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted, mousePos.x, mousePos.y]);

  // Handle cursor hiding on mobile
  useEffect(() => {
    if (!mounted) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || isTouchDevice) {
      return;
    }

    // Hide default cursor
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [mounted]);

  // Don't render on mobile or before mounting
  if (!mounted || typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  )) {
    return null;
  }

  // Better theme detection with proper fallbacks
  const getCurrentTheme = () => {
    // First check resolved theme (most reliable)
    if (resolvedTheme) {
      return resolvedTheme === 'dark';
    }
    
    // Check set theme
    if (theme && theme !== 'system') {
      return theme === 'dark';
    }
    
    // Check system theme
    if (systemTheme) {
      return systemTheme === 'dark';
    }
    
    // Check media query as final fallback
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Default to light mode
    return false;
  };

  const isDark = getCurrentTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]">
      {/* Image Motion Trail - Multiple cursor icons with fading opacity */}
      {trail.map((point, index) => {
        const opacity = Math.max(0, 1 - (point.age / 1200)); // Fade over 1200ms
        const scale = 0.3 + (opacity * 0.7); // Scale from 0.3 to 1.0
        const rotation = (point.age / 10) % 360; // Gentle rotation
        
        return (
          <div
            key={`trail-${index}-${point.x}-${point.y}`}
            className="absolute pointer-events-none transition-all duration-100"
            style={{
              left: point.x - 12,
              top: point.y - 12,
              opacity: opacity * 0.8,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
              zIndex: 99999 - index, // Layer them properly
            }}
          >
            {/* Cursor Icon Trail */}
            <div
              className="w-6 h-6 rounded-full border-2 transition-all duration-200"
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                boxShadow: isDark 
                  ? '0 4px 6px -1px rgba(255, 255, 255, 0.2)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                filter: `blur(${index * 0.2}px)`, // Slight blur for depth
              }}
            >
              {/* Inner dot */}
              <div
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Main cursor dot */}
      <div
        className="absolute pointer-events-none transition-colors duration-200"
        style={{
          left: mousePos.x - 8,
          top: mousePos.y - 8,
          transform: 'translate(-50%, -50%)',
          zIndex: 100000,
        }}
      >
        <div
          className="w-4 h-4 rounded-full transition-all duration-200"
          style={{
            backgroundColor: isDark ? '#ffffff' : '#000000',
            border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'}`,
            boxShadow: isDark 
              ? '0 4px 6px -1px rgba(255, 255, 255, 0.3)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            mixBlendMode: 'difference',
          }}
        >
          {/* Central highlight */}
          <div
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: isDark ? '#000000' : '#ffffff',
            }}
          />
        </div>
      </div>

      {/* Optional: Smooth line trail connecting the images */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          mixBlendMode: 'soft-light',
          zIndex: 99990 
        }}
      >
        {trail.length > 1 && (
          <path
            d={`M ${trail.map((point) => `${point.x} ${point.y}`).join(' L ')}`}
            fill="none"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            style={{
              stroke: isDark ? '#ffffff' : '#000000',
              filter: `drop-shadow(0 0 2px ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'})`,
              transition: 'stroke 0.2s ease'
            }}
          />
        )}
      </svg>
    </div>
  );
};

export default CustomCursor; 