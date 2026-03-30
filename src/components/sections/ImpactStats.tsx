'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface Stat {
  title: string;
  value: string;
  icon: string;
  summary: string;
  signal: string;
  track: 'delivery' | 'engineering' | 'ops' | 'learning';
}

const stats: Stat[] = [
  {
    title: 'Delivered Projects',
    value: '20+',
    icon: '🚀',
    summary: 'Production launches across AI, web platforms, and automation systems.',
    signal: 'Delivery Throughput',
    track: 'delivery',
  },
  {
    title: 'Engineering Experience',
    value: '4+',
    icon: '⏳',
    summary: 'Hands-on practice in software, data, and applied AI/ML engineering.',
    signal: 'Execution Maturity',
    track: 'engineering',
  },
  {
    title: 'Code Contributions',
    value: '120K+',
    icon: '💻',
    summary: 'Sustained commits across open-source work and personal production builds.',
    signal: 'Build Velocity',
    track: 'engineering',
  },
  {
    title: 'Focus Sessions',
    value: '2.4K+',
    icon: '☕',
    summary: 'Late-night debugging and deep-work sessions fueling project delivery.',
    signal: 'Consistency',
    track: 'delivery',
  },
  {
    title: 'Containerized Services',
    value: '50+',
    icon: '🐳',
    summary: 'Self-hosted apps and automation pipelines monitored in real time.',
    signal: 'Ops Reliability',
    track: 'ops',
  },
  {
    title: 'Certifications',
    value: '5+',
    icon: '🏆',
    summary: 'Validated skills across cloud, AI/ML, and software engineering domains.',
    signal: 'Validated Skills',
    track: 'learning',
  },
  {
    title: 'Technologies Used',
    value: '30+',
    icon: '⚡',
    summary: 'Frameworks, tools, and platforms used in production-grade implementations.',
    signal: 'Stack Breadth',
    track: 'engineering',
  },
  {
    title: 'Data Science Projects',
    value: '12+',
    icon: '📊',
    summary: 'End-to-end ML, NLP, and analytics workflows shipped to production.',
    signal: 'Model Impact',
    track: 'delivery',
  },
  {
    title: 'Issues Resolved',
    value: '500+',
    icon: '🐛',
    summary: 'Bugs traced and fixed across personal projects and professional systems.',
    signal: 'Debug Depth',
    track: 'ops',
  }
];

const trackLabels: Record<'all' | Stat['track'], string> = {
  all: 'All Signals',
  delivery: 'Delivery',
  engineering: 'Engineering',
  ops: 'Operations',
  learning: 'Learning',
};

function parseStatValue(value: string): number {
  const normalized = value.toLowerCase().replace(/,/g, '').trim();
  const base = Number(normalized.replace(/[^0-9.]/g, '')) || 0;
  if (normalized.includes('k')) return base * 1000;
  return base;
}

const morphPaths = [
  "M0,200 Q175,140 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,140 350,200 T700,200 V300 H0 Z"
];

export default function ImpactStats() {
  const [mounted, setMounted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'all' | Stat['track']>('all');
  const [selectedSignal, setSelectedSignal] = useState<string>(stats[0].title);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'value_desc' | 'value_asc' | 'title_asc'>('default');
  const [compareSignals, setCompareSignals] = useState<string[]>([]);
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

  const baseFiltered =
    activeTrack === 'all' ? stats : stats.filter((stat) => stat.track === activeTrack);
  const query = searchQuery.trim().toLowerCase();
  const searchedStats = query
    ? baseFiltered.filter((stat) => {
        const haystack = `${stat.title} ${stat.signal} ${stat.summary}`.toLowerCase();
        return haystack.includes(query);
      })
    : baseFiltered;

  const filteredStats = [...searchedStats].sort((a, b) => {
    if (sortMode === 'value_desc') return parseStatValue(b.value) - parseStatValue(a.value);
    if (sortMode === 'value_asc') return parseStatValue(a.value) - parseStatValue(b.value);
    if (sortMode === 'title_asc') return a.title.localeCompare(b.title);
    return stats.findIndex((s) => s.title === a.title) - stats.findIndex((s) => s.title === b.title);
  });

  const focusedStat =
    filteredStats.find((stat) => stat.title === selectedSignal) ||
    filteredStats[0] ||
    stats[0];
  const compareCards = compareSignals
    .map((title) => stats.find((stat) => stat.title === title))
    .filter((stat): stat is Stat => Boolean(stat));

  const toggleCompare = (title: string) => {
    setCompareSignals((prev) => {
      if (prev.includes(title)) return prev.filter((item) => item !== title);
      if (prev.length >= 3) return [...prev.slice(1), title];
      return [...prev, title];
    });
  };

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        <svg
          ref={svgRef}
          className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-15 pointer-events-none rounded-2xl"
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
        <div className="relative w-full neural-card neural-glow-border p-4 sm:p-8">
          <div className="mb-6">
            <p className="neural-kicker">Performance Snapshot</p>
            <h2 className="neural-section-title mt-2">Impact Signals</h2>
            <p className="neural-section-copy mt-2 max-w-3xl">
              A condensed telemetry view of delivery, reliability, and engineering output across real projects.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(trackLabels) as Array<'all' | Stat['track']>).map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => setActiveTrack(track)}
                  className={`neural-pill-intro ${activeTrack === track ? 'is-active' : ''}`}
                  aria-pressed={activeTrack === track}
                >
                  {trackLabels[track]}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search signal, metric, or summary"
                className="neural-input text-xs sm:text-sm"
                aria-label="Search impact signals"
              />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as 'default' | 'value_desc' | 'value_asc' | 'title_asc')}
                className="neural-input text-xs sm:text-sm"
                aria-label="Sort impact signals"
              >
                <option value="default">Sort: Default</option>
                <option value="value_desc">Sort: Value High to Low</option>
                <option value="value_asc">Sort: Value Low to High</option>
                <option value="title_asc">Sort: Title A-Z</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.16, delay: 0 } }}
                className={`neural-card-soft rounded-2xl p-5 sm:p-6 border focus-visible:border-violet-400 focus-visible:shadow-lg cursor-pointer transition-all ${
                  focusedStat.title === stat.title
                    ? 'border-violet-300/70 shadow-[0_0_0_1px_rgba(167,139,250,0.4)]'
                    : 'border-slate-600/55'
                }`}
                aria-label={stat.title}
                tabIndex={0}
                onClick={() => setSelectedSignal(stat.title)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedSignal(stat.title);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">{stat.signal}</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-100">{stat.title}</h3>
                  </div>
                  <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCompare(stat.title);
                    }}
                    className={`neural-pill-intro text-[10px] px-2 py-1 ${compareSignals.includes(stat.title) ? 'is-active' : ''}`}
                    aria-pressed={compareSignals.includes(stat.title)}
                  >
                    {compareSignals.includes(stat.title) ? 'Added' : 'Compare'}
                  </button>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-3xl font-bold text-violet-200 leading-none">{stat.value}</p>
                  <span className="neural-pill-intro text-[10px] mb-1">current marker</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-700/70 overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-violet-500/80 via-blue-400/80 to-cyan-400/80" />
                </div>
                <div className="mt-3">
                  <span className="neural-statement-chip">{stat.summary}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={focusedStat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-5 neural-card-soft rounded-xl border border-violet-400/35 p-4 sm:p-5"
          >
            <p className="text-xs uppercase tracking-wider text-violet-300">Focused Signal</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{focusedStat.icon} {focusedStat.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{focusedStat.summary}</p>
              </div>
              <p className="text-2xl font-bold text-violet-200 shrink-0">{focusedStat.value}</p>
            </div>
          </motion.div>
          {compareCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 neural-card-soft rounded-xl border border-cyan-400/35 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wider text-cyan-300">Compare Signals (up to 3)</p>
                <button
                  type="button"
                  onClick={() => setCompareSignals([])}
                  className="text-xs text-slate-300 underline underline-offset-2"
                >
                  Clear
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {compareCards.map((stat) => (
                  <div key={stat.title} className="rounded-lg border border-slate-600/60 bg-slate-900/45 p-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.signal}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{stat.icon} {stat.title}</p>
                    <p className="mt-1 text-xl font-bold text-cyan-200">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-300">{stat.summary}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
} 