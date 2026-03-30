'use client';

import { useEffect, useRef, useState } from 'react';

interface LatticeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function NeuralLatticeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const nodesRef = useRef<LatticeNode[]>([]);
  const targetRef = useRef(0.2);
  const [active, setActive] = useState(true); // Start visible so backgrounds show on page load

  useEffect(() => {
    const handleExpand = (event: Event) => {
      const detail = (event as CustomEvent<{ level: number }>).detail;
      targetRef.current = Math.min(1, Math.max(0.2, detail?.level ?? 0.2));
      setActive(true);
    };
    window.addEventListener('neural:expand', handleExpand);
    return () => window.removeEventListener('neural:expand', handleExpand);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const initNodes = (w: number, h: number) => {
      const count = Math.max(18, Math.floor(w / 70));
      nodesRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 2 + Math.random() * 2,
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

      const spread = targetRef.current;
      const maxDist = 120 + spread * 160;

      nodesRef.current.forEach((node) => {
        node.x += node.vx * (0.6 + spread);
        node.y += node.vy * (0.6 + spread);

        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });

      // Edges
      for (let i = 0; i < nodesRef.current.length; i += 1) {
        const a = nodesRef.current[i];
        for (let j = i + 1; j < nodesRef.current.length; j += 1) {
          const b = nodesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (0.12 + spread * 0.2);
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodesRef.current.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + spread * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${0.42 + spread * 0.34})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -4 }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: active ? 1 : 0.8, transition: 'opacity 600ms ease' }}
        aria-hidden="true"
      />
    </div>
  );
}
