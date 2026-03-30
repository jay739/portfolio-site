'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface StreamLine {
  y: number;
  speed: number;
  phase: number;
  amplitude: number;
}

export default function DataStreamBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const streamsRef = useRef<StreamLine[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const timeRef = useRef(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const initStreams = (w: number, h: number) => {
      const count = Math.min(12, Math.floor(h / 80));
      streamsRef.current = Array.from({ length: count }).map((_, i) => ({
        y: (i / count) * h,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        amplitude: 15 + Math.random() * 25,
      }));
    };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimRef.current = { w, h, dpr };
      initStreams(w, h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = resolvedTheme === 'dark';
    const primary = isDark ? 'rgba(56, 189, 248, 0.34)' : 'rgba(14, 116, 144, 0.24)';
    const secondary = isDark ? 'rgba(232, 121, 249, 0.26)' : 'rgba(147, 51, 234, 0.2)';

    const draw = () => {
      const { w, h, dpr } = dimRef.current;
      timeRef.current += 0.02;
      const t = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      streamsRef.current.forEach((stream, i) => {
        const phase = stream.phase + t * stream.speed;
        ctx.beginPath();
        ctx.moveTo(0, stream.y);

        for (let x = 0; x <= w + 20; x += 20) {
          const wave = Math.sin((x / 80) + phase) * stream.amplitude;
          ctx.lineTo(x, stream.y + wave);
        }
        ctx.strokeStyle = i % 2 === 0 ? primary : secondary;
        ctx.lineWidth = 1.7;
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [resolvedTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -4 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.96 }}
        aria-hidden="true"
      />
    </div>
  );
}
