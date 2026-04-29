'use client';

import { CSSProperties, ReactNode, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface InteractiveSurfaceProps {
  children: ReactNode;
  className?: string;
}

export default function InteractiveSurface({ children, className = '' }: InteractiveSurfaceProps) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const prefersReducedMotion = useReducedMotion();
  const hoverMotion = prefersReducedMotion
    ? undefined
    : {
        y: -4,
        scale: 1.006,
        transition: {
          duration: 0.16,
          ease: [0.22, 1, 0.36, 1],
        },
      };

  return (
    <motion.div
      className={`interactive-surface ${className}`}
      onMouseMove={(event) => {
        if (prefersReducedMotion) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        setGlow({ x, y });
      }}
      whileHover={hoverMotion}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={
        {
          '--surface-glow-x': `${glow.x}%`,
          '--surface-glow-y': `${glow.y}%`,
          boxShadow: prefersReducedMotion ? undefined : '0 18px 42px rgba(0,0,0,0.34)',
        } as CSSProperties
      }
    >
      {children}
    </motion.div>
  );
}
