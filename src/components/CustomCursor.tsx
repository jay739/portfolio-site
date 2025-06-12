'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import gsap from 'gsap';

const CURSOR_SIZE = 18;
const DOT_COUNT = 20;
const SINE_DOTS = Math.floor(DOT_COUNT * 0.4);
const IDLE_TIMEOUT = 150;
const SMOOTHING = 0.12; // More flowy

interface Dot {
  x: number;
  y: number;
  scale: number;
  range: number;
  limit: number;
  angleX: number;
  angleY: number;
  anglespeed: number;
  lockX?: number;
  lockY?: number;
  element: HTMLSpanElement;
  targetX: number;
  targetY: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const [idle, setIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { theme } = useTheme();
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number>();
  const [mounted, setMounted] = useState(false);
  const [isHoverDevice, setIsHoverDevice] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if device supports hover
    setIsHoverDevice(window.matchMedia('(hover: hover)').matches);
  }, []);

  useEffect(() => {
    if (!cursorRef.current || !mounted) return;

    // Create dots
    const newDots: Dot[] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('span');
      const scale = 1 - 0.05 * i;
      const range = CURSOR_SIZE / 2 - CURSOR_SIZE / 2 * scale + 2;
      
      dot.style.width = `${CURSOR_SIZE}px`;
      dot.style.height = `${CURSOR_SIZE}px`;
      dot.style.backgroundColor = (theme === 'dark' || document.documentElement.classList.contains('dark')) ? '#ffffff' : '#000000';
      dot.style.borderRadius = '50%';
      dot.style.position = 'absolute';
      dot.style.display = 'block';
      dot.style.transformOrigin = 'center center';
      dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
      dot.style.willChange = 'transform';
      dot.style.pointerEvents = 'none';
      dot.style.opacity = '1';
      dot.style.zIndex = '99999';
      
      cursorRef.current.appendChild(dot);
      
      console.log('Dot created', i);
      newDots.push({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        scale,
        range,
        limit: CURSOR_SIZE * 0.75 * scale,
        angleX: Math.PI * 2 * Math.random(),
        angleY: Math.PI * 2 * Math.random(),
        anglespeed: 0.05,
        element: dot
      });
    }
    dotsRef.current = newDots;

    // Mouse move handler with throttling
    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < 16) return;
      lastMoveTime = now;

      console.log('mousemove', e.clientX, e.clientY);
      mousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
      resetIdleTimer();
    };

    // Touch move handler with throttling
    const handleTouchMove = (e: TouchEvent) => {
      const now = performance.now();
      if (now - lastMoveTime < 16) return;
      lastMoveTime = now;

      mousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      resetIdleTimer();
    };

    // Animation frame with lerp smoothing
    const animate = (timestamp: number) => {
      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      let x = mousePositionRef.current.x;
      let y = mousePositionRef.current.y;

      dotsRef.current.forEach((dot, index) => {
        if (!idle || index <= SINE_DOTS) {
          // Update target position
          dot.targetX = x;
          dot.targetY = y;

          // More flowy trailing effect: increase trailing for later dots
          const trailing = SMOOTHING * (1 - index / DOT_COUNT * 0.7);
          dot.x += (dot.targetX - dot.x) * trailing;
          dot.y += (dot.targetY - dot.y) * trailing;

          // Apply transform using transform3d for better performance
          gsap.set(dot.element, {
            x: dot.x,
            y: dot.y,
            force3D: true
          });
          
          const nextDot = dotsRef.current[index + 1] || dotsRef.current[0];
          const dx = (nextDot.x - dot.x) * 0.32;
          const dy = (nextDot.y - dot.y) * 0.32;
          x += dx;
          y += dy;
        } else {
          dot.angleX += dot.anglespeed;
          dot.angleY += dot.anglespeed;
          
          // Smooth idle animation
          const idleX = (dot.lockX || 0) + Math.sin(dot.angleX) * dot.range;
          const idleY = (dot.lockY || 0) + Math.sin(dot.angleY) * dot.range;
          
          dot.x += (idleX - dot.x) * SMOOTHING;
          dot.y += (idleY - dot.y) * SMOOTHING;
          
          gsap.set(dot.element, {
            x: dot.x,
            y: dot.y,
            force3D: true
          });
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    rafRef.current = requestAnimationFrame(animate);

    // Event listeners (attach to document)
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      dotsRef.current.forEach(dot => dot.element.remove());
    };
  }, [theme, mounted]);

  const resetIdleTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIdle(false);
    timeoutRef.current = setTimeout(() => {
      setIdle(true);
      dotsRef.current.forEach(dot => {
        dot.lockX = dot.x;
        dot.lockY = dot.y;
      });
    }, IDLE_TIMEOUT);
  };

  if (!mounted) return null;

  // Debug: Log when the cursor is rendered
  console.log('CustomCursor rendered and mounted');

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none"
      style={{
        filter: 'url(#goo)',
        display: 'block',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 2147483647
      }}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
} 