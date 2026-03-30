'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface TimelineItem {
  title: string;
  subtitle?: string;
  date: string;
  icon?: string;
  description: string;
  details?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

const defaultIcon = '📅';

const orgLinks: Record<string, string> = {
  'enigma technologies': 'https://www.enigmatechnologies.com/',
  'r/seek — umbc': 'https://umbc.edu/',
  'r/seek - umbc': 'https://umbc.edu/',
  'university of maryland, baltimore county': 'https://umbc.edu/',
  'cognizant': 'https://www.cognizant.com/',
  'infosys': 'https://www.infosys.com/',
};

function getOrgLink(subtitle?: string): string | null {
  if (!subtitle) return null;
  const normalized = subtitle.trim().toLowerCase();
  return orgLinks[normalized] || null;
}

export default function Timeline({ items }: TimelineProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<number[]>([0]);
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

  const morphPaths = [
    "M0,200 Q175,120 350,200 T700,200 V300 H0 Z",
    "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
    "M0,200 Q175,120 350,200 T700,200 V300 H0 Z"
  ];

  if (!mounted) return null;

  const toggleExpanded = (index: number) => {
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    );
  };

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-15 pointer-events-none rounded-2xl"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="timeline-gradient-dark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="timeline-gradient-light" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>
          <path
            ref={pathRef}
            d={morphPaths[0]}
            fill={`url(#timeline-gradient-${theme === 'dark' ? 'dark' : 'light'})`}
          />
        </svg>
        <div className="relative w-full neural-card neural-glow-border p-4 sm:p-8">
          <div className="mb-8">
            <p className="neural-kicker">Career Chronology</p>
            <h2 className="neural-section-title mt-2">🕒 Timeline</h2>
            <p className="neural-section-copy mt-2 max-w-3xl">
              My timeline of roles, milestones, and measurable outcomes across AI/ML, systems, and product delivery.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400/70 via-violet-400/55 to-fuchsia-400/70" />
            
            <div className="space-y-6 sm:space-y-8">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.date}-${item.title}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative pl-14 sm:pl-16"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(index)}
                    className="absolute left-2 sm:left-3 top-2 min-w-[2.2rem] h-8 px-2 rounded-full neural-control-btn-ghost text-cyan-200 text-xs"
                    aria-expanded={expanded.includes(index)}
                    aria-label={`Toggle timeline details for ${item.title}`}
                  >
                    {expanded.includes(index) ? 'Hide' : 'More'}
                  </button>
                  
                  <div className="neural-card-soft rounded-2xl p-4 sm:p-6 border border-slate-600/55 transition-all duration-200 hover:border-cyan-300/55">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-2xl">{item.icon || defaultIcon}</span>
                      <h3 className="text-lg sm:text-xl font-semibold text-cyan-200">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="neural-pill-intro text-[11px]">{item.date}</span>
                      {item.subtitle &&
                        (() => {
                          const orgLink = getOrgLink(item.subtitle);
                          if (!orgLink) {
                            return <span className="neural-pill-intro text-[11px]">{item.subtitle}</span>;
                          }
                          return (
                            <Link
                              href={orgLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="neural-pill-intro text-[11px] hover:underline underline-offset-2"
                              aria-label={`Open ${item.subtitle} website`}
                            >
                              {item.subtitle}
                            </Link>
                          );
                        })()}
                    </div>
                    <p className="mb-3 text-base sm:text-lg font-medium leading-relaxed text-cyan-100">
                      {item.description}
                    </p>
                    {item.details && expanded.includes(index) && (
                      <ul className="space-y-2">
                        {item.details.map((detail, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-300">
                            <span className="mr-2 mt-1 text-cyan-300">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.details && !expanded.includes(index) && (
                      <p className="text-xs text-slate-400">Use "More" to view {item.details.length} highlight points.</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 