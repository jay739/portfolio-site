'use client';

import { useEffect, useRef, useState } from 'react';
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

const timelineItems: TimelineItem[] = [
  {
    title: 'Graduate Student',
    subtitle: 'University of Maryland, Baltimore County',
    date: 'Aug 2023 - May 2025',
    icon: '🎓',
    description: 'Working on AI/ML research projects focusing on natural language processing and computer vision.',
    details: [
      'Developing and implementing state-of-the-art NLP models',
      'Collaborating with faculty on research papers',
      'Mentoring undergraduate students in AI/ML projects',
      'Contributing to open-source AI projects'
    ]
  },
  {
    title: 'AI/ML Programming Intern',
    subtitle: 'R/SEEK',
    date: 'Jan 2025 - May 2025',
    icon: '💻',
    description: 'Built machine learning models for RC car navigation and automation.',
    details: [
      'Developed computer vision models for autonomous navigation',
      'Integrated ML models with hardware for real-time inference',
      'Optimized model performance for embedded systems',
      'Documented and presented results to stakeholders'
    ]
  },
  {
    title: 'Data Analyst',
    subtitle: 'Tata Consultancy Services (TCS)',
    date: '2021 - 2022',
    icon: '📊',
    description: 'Worked on data analysis, reporting, and automation for enterprise clients.',
    details: [
      'Automated data pipelines and reporting workflows',
      'Built dashboards and visualizations for business insights',
      'Collaborated with cross-functional teams on analytics projects',
      'Maintained data quality and integrity'
    ]
  },
  {
    title: 'Lead Data Scientist',
    subtitle: 'Freelance / Open Source',
    date: '2023 - Present',
    icon: '📈',
    description: 'Designed and deployed NLP and computer vision models for real-world applications. Led data science teams and contributed to open-source ML projects.',
    details: [
      'Built and deployed deep learning models for text and image data',
      'Mentored junior data scientists and engineers',
      'Published research and presented at AI/ML conferences',
      'Contributed to open-source data science libraries'
    ]
  },
];

export default function Timeline({ items }: TimelineProps) {
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

  const morphPaths = [
    "M0,200 Q175,120 350,200 T700,200 V300 H0 Z",
    "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
    "M0,200 Q175,120 350,200 T700,200 V300 H0 Z"
  ];

  if (!mounted) return null;

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        <svg
          ref={svgRef}
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
        <div className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🕒 Timeline
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800" />
            
            <div className="space-y-12">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.date}-${item.title}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.15, delay: 0 } }}
                  className="relative pl-16"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400 border-4 border-white dark:border-slate-800" />
                  
                  <div className="transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-slate-700 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{item.icon || defaultIcon}</span>
                      <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {item.title}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.date}
                      {item.subtitle && (
                        <span className="ml-2 text-gray-500 dark:text-gray-500">
                          — {item.subtitle}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {item.description}
                    </p>
                    {item.details && (
                      <ul className="space-y-2">
                        {item.details.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-start text-gray-600 dark:text-gray-400 text-sm"
                          >
                            <span className="mr-2 mt-1">•</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
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