'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  pulsePhase: number;
}

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const timeRef = useRef(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const initStars = (w: number, h: number) => {
      const count = Math.min(35, Math.floor((w * h) / 25000));
      starsRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        baseRadius: 1.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimRef.current = { w, h, dpr };
      initStars(w, h);
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
    const nodeColor = isDark ? 'rgba(232, 121, 249, 0.7)' : 'rgba(99, 102, 241, 0.62)';

    const draw = () => {
      const { w, h, dpr } = dimRef.current;
      timeRef.current += 0.015;
      const t = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      const maxDist = 180;

      // Draw edges
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${alpha + 0.04})` : `rgba(37, 99, 235, ${(alpha * 0.85) + 0.03})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw stars with pulse
      stars.forEach((star) => {
        const pulse = 0.8 + 0.4 * Math.sin(t + star.pulsePhase);
        const r = star.baseRadius * pulse;
        ctx.beginPath();
        ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
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
        style={{ opacity: 0.97 }}
        aria-hidden="true"
      />
    </div>
  );
}
