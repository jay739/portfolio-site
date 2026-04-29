'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function ParticleFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const initParticles = (w: number, h: number) => {
      const count = Math.min(80, Math.floor((w * h) / 12000));
      particlesRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
      }));
    };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimRef.current = { w, h, dpr };
      initParticles(w, h);
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
    const color = isDark ? '255, 244, 230' : '140, 74, 29';
    const accent = isDark ? '245, 158, 11' : '194, 65, 12';

    const draw = () => {
      const { w, h, dpr } = dimRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      for (let i = 0; i < particlesRef.current.length; i += 1) {
        const a = particlesRef.current[i];
        for (let j = i + 1; j < particlesRef.current.length; j += 1) {
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * (isDark ? 0.12 : 0.08);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${accent}, ${alpha})`;
            ctx.lineWidth = dist < 60 ? 1.1 : 0.7;
            ctx.stroke();
          }
        }
      }

      particlesRef.current.forEach((p) => {

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.alpha * 0.75})`;
        ctx.fill();

        // Subtle node bloom for denser neural-field depth.
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accent}, ${p.alpha * 0.08})`;
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
        style={{ opacity: 0.96 }}
        aria-hidden="true"
      />
    </div>
  );
}
