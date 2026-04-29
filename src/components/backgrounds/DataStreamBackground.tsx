'use client';

import { useEffect, useRef } from 'react';

interface StreamLine {
  y: number;
  speed: number;
  phase: number;
  amplitude: number;
}

interface DataStreamBackgroundProps {
  opacity?: number;
  lineCount?: number;
  speedMultiplier?: number;
  amplitudeMultiplier?: number;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function DataStreamBackground({
  opacity = 0.52,
  lineCount = 8,
  speedMultiplier = 1,
  amplitudeMultiplier = 1,
  primaryColor = 'rgba(245, 158, 11, 0.28)',
  secondaryColor = 'rgba(251, 191, 36, 0.18)',
}: DataStreamBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const streamsRef = useRef<StreamLine[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const initStreams = (w: number, h: number) => {
      const count = Math.max(4, Math.min(lineCount, Math.floor(h / 110) || lineCount));
      streamsRef.current = Array.from({ length: count }).map((_, i) => ({
        y: (i / count) * h,
        speed: (0.16 + Math.random() * 0.24) * speedMultiplier,
        phase: Math.random() * Math.PI * 2,
        amplitude: (8 + Math.random() * 16) * amplitudeMultiplier,
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

    const draw = () => {
      const { w, h, dpr } = dimRef.current;
      timeRef.current += 0.012;
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
        ctx.strokeStyle = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [amplitudeMultiplier, lineCount, primaryColor, secondaryColor, speedMultiplier]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 18%, rgba(245,158,11,0.05), transparent 20%), radial-gradient(circle at 84% 78%, rgba(251,191,36,0.04), transparent 20%)',
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
