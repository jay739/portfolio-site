'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  pulsePhase: number;
}

interface ConstellationBackgroundProps {
  opacity?: number;
  density?: number;
  maxDistance?: number;
  lineColor?: string;
  nodeColor?: string;
}

export default function ConstellationBackground({
  opacity = 0.5,
  density = 1,
  maxDistance = 140,
  lineColor = 'rgba(245, 158, 11, 0.18)',
  nodeColor = 'rgba(251, 191, 36, 0.42)',
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const initStars = (w: number, h: number) => {
      const count = Math.max(12, Math.floor(((w * h) / 42000) * density));
      starsRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        baseRadius: 1 + Math.random() * 1.6,
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

    const draw = () => {
      const { w, h, dpr } = dimRef.current;
      timeRef.current += 0.01;
      const t = timeRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const stars = starsRef.current;
      // Draw edges
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i];
          const b = stars[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.75;
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)\s*$/, `${alpha})`);
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
  }, [density, lineColor, maxDistance, nodeColor]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 24% 30%, rgba(251,191,36,0.06), transparent 24%), radial-gradient(circle at 76% 68%, rgba(245,158,11,0.05), transparent 24%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity }}
        aria-hidden="true"
      />
    </div>
  );
}
