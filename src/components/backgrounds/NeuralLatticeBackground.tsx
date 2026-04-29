'use client';

import { useEffect, useRef } from 'react';

interface LatticeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
}

interface NeuralLatticeBackgroundProps {
  opacity?: number;
  density?: number;
  lineColor?: string;
  nodeCoreColor?: string;
  glowColor?: string;
}

export default function NeuralLatticeBackground({
  opacity = 0.55,
  density = 1,
  lineColor = 'rgba(245,158,11,0.22)',
  nodeCoreColor = 'rgba(251,191,36,0.48)',
  glowColor = 'rgba(251,191,36,0.28)',
}: NeuralLatticeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const nodesRef = useRef<LatticeNode[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const initNodes = (w: number, h: number) => {
      const count = Math.max(12, Math.floor(((w * h) / 42000) * density));
      nodesRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        radius: 1.2 + Math.random() * 1.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.008,
      }));
    };

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimRef.current = { w, h, dpr };
      initNodes(w, h);
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const maxDist = 150;

      nodesRef.current.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;
        if (node.x < -10) node.x = w + 10;
        else if (node.x > w + 10) node.x = -10;
        if (node.y < -10) node.y = h + 10;
        else if (node.y > h + 10) node.y = -10;
      });

      // Edges
      for (let i = 0; i < nodesRef.current.length; i++) {
        const a = nodesRef.current[i];
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const b = nodesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.7;
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)\s*$/, `${alpha})`);
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes with soft pulse glow
      nodesRef.current.forEach((node) => {
        const pulseFactor = 0.5 + 0.5 * Math.sin(node.pulse);
        const r = node.radius + pulseFactor * 1.2;
        const nodeAlpha = 0.3 + pulseFactor * 0.35;

        // Outer glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3.5);
        grd.addColorStop(0, glowColor.replace(/[\d.]+\)\s*$/, `${nodeAlpha * 0.6})`));
        grd.addColorStop(1, 'rgba(245,158,11,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeCoreColor.replace(/[\d.]+\)\s*$/, `${nodeAlpha})`);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [density, glowColor, lineColor, nodeCoreColor]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, rgba(245,158,11,0.08), transparent 28%), radial-gradient(circle at 82% 70%, rgba(251,191,36,0.06), transparent 26%)',
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
