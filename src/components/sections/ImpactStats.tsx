'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface Stat {
  title: string;
  value: string;
  icon: string;
  description: string;
}

const stats: Stat[] = [
  {
    title: "Projects Completed",
    value: "20+",
    icon: "🚀",
    description: "Successful project deliveries across AI, web, and automation domains"
  },
  {
    title: "Years Experience",
    value: "4+",
    icon: "⏳",
    description: "Professional experience in software, data, and AI/ML engineering"
  },
  {
    title: "Code Contributions",
    value: "120K+",
    icon: "💻",
    description: "Lines of code contributed to open-source and personal projects"
  },
  {
    title: "Docker Services",
    value: "10+",
    icon: "🐳",
    description: "Self-hosted services and automation (stats via Netdata, no sensitive info shown)"
  }
];

const morphPaths = [
  "M0,200 Q175,140 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,140 350,200 T700,200 V300 H0 Z"
];

export default function ImpactStats() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<number>();
  const morphIdx = useRef(0);
  const morphProgress = useRef(0);
  const lastMorphTime = useRef(performance.now());
  const morphDuration = 4000;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    function lerpPath(a: string, b: string, t: number) {
      const numsA = a.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const numsB = b.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const nums = numsA.map((v, i) => v + (numsB[i] - v) * t);
      return `M${nums[0]},${nums[1]} Q${nums[2]},${nums[3]} ${nums[4]},${nums[5]} T${nums[6]},${nums[7]} V${nums[8]} H${nums[9]} Z`;
    }

    function animateMorph() {
      const now = performance.now();
      const dt = now - lastMorphTime.current;
      morphProgress.current += dt / morphDuration;

      if (morphProgress.current > 1) {
        morphProgress.current = 0;
        morphIdx.current = (morphIdx.current + 1) % (morphPaths.length - 1);
      }

      if (pathRef.current) {
        const d = lerpPath(
          morphPaths[morphIdx.current],
          morphPaths[morphIdx.current + 1],
          morphProgress.current
        );
        pathRef.current.setAttribute('d', d);
      }

      lastMorphTime.current = now;
      animationRef.current = requestAnimationFrame(animateMorph);
    }

    animationRef.current = requestAnimationFrame(animateMorph);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-15 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="impact-gradient-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a21caf" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="impact-gradient-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={morphPaths[0]}
          fill={`url(#impact-gradient-${theme === 'dark' ? 'dark' : 'light'})`}
        />
      </svg>

      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🚀 Impact Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="transform transition-all duration-300 bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6 flex flex-col items-center fade-in tilt glow-hover"
              aria-label={stat.title}
            >
              <span className="text-4xl mb-2">{stat.icon}</span>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {stat.value}
              </h3>
              <span className="text-gray-700 dark:text-gray-300 text-center">
                {stat.title}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 