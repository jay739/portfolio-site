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
      whileHover={prefersReducedMotion ? undefined : { y: -5, scale: 1.008 }}
      transition={{ duration: 0.2 }}
      style={
        {
          '--surface-glow-x': `${glow.x}%`,
          '--surface-glow-y': `${glow.y}%`,
          boxShadow: prefersReducedMotion ? undefined : '0 20px 48px rgba(2,6,23,0.38)',
        } as CSSProperties
      }
    >
      {children}
    </motion.div>
  );
}
