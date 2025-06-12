'use client';
import { useEffect, useRef, useState } from 'react';

// Simple trailing dot effect
const TRAIL_LENGTH = 12;
const TRAIL_COLOR = 'bg-blue-400 dark:bg-cyan-400';

export default function CursorTrail() {
  const [trails, setTrails] = useState<{ x: number; y: number; opacity: number; key: number }[]>([]);
  const keyRef = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      keyRef.current += 1;
      setTrails((prev) => {
        const next = [
          {
            x: clientX,
            y: clientY,
            opacity: 1,
            key: keyRef.current,
          },
          ...prev,
        ].slice(0, TRAIL_LENGTH);
        return next.map((t, i) => ({ ...t, opacity: 1 - i / TRAIL_LENGTH }));
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      {trails.map((t) => (
        <div
          key={t.key}
          className={`pointer-events-none fixed z-50 rounded-full ${TRAIL_COLOR}`}
          style={{
            left: t.x - 6,
            top: t.y - 6,
            width: 12,
            height: 12,
            opacity: t.opacity,
            boxShadow: `0 0 12px 2px #38bdf8` // cyan glow
          }}
        />
      ))}
    </>
  );
} 