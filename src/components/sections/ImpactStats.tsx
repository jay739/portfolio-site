'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FaRocket, FaHourglass, FaDocker, FaTrophy, FaBolt,
  FaBrain, FaCloud, FaCogs, FaDatabase, FaFire,
  FaCheckCircle, FaChartLine, FaServer,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Stat {
  title: string;
  value: string;
  icon: IconType;
  summary: string;
  signal: string;
  track: 'delivery' | 'engineering' | 'ops';
}

const stats: Stat[] = [
  {
    title: 'Analyst Review Time Saved',
    value: '30%+',
    icon: FaRocket,
    summary: 'Reduced insurance & document analyst review time via multi-stage RAG pipeline (OCR → retrieval → extraction → routing) at Enigma Technologies.',
    signal: 'GenAI Delivery',
    track: 'delivery',
  },
  {
    title: 'Production ML Experience',
    value: '5+',
    icon: FaHourglass,
    summary: 'Years shipping production ML systems across NLP, computer vision, GenAI, and MLOps at Cognizant, UMBC R/SEEK, and Enigma Technologies.',
    signal: 'Execution Maturity',
    track: 'engineering',
  },
  {
    title: 'NLP Latency Reduction',
    value: '80%',
    icon: FaBolt,
    summary: 'Reduced NLP inference latency from 450 ms to under 90 ms through batch inference and model optimization at Cognizant.',
    signal: 'Performance Engineering',
    track: 'engineering',
  },
  {
    title: 'Legal Review Effort Cut',
    value: '35%',
    icon: FaCheckCircle,
    summary: 'Contract Intelligence & Legal NLP pipeline reduced manual legal and compliance review effort while meeting SLA targets at Cognizant.',
    signal: 'NLP Impact',
    track: 'delivery',
  },
  {
    title: 'Scoring Precision Gain',
    value: '20%',
    icon: FaChartLine,
    summary: 'Regression, classification, and clustering models on 10 M+ customer records improved scoring precision in production at Enigma Technologies.',
    signal: 'Model Impact',
    track: 'engineering',
  },
  {
    title: 'Wildfire CNN Accuracy',
    value: '91%',
    icon: FaFire,
    summary: 'AllCNN classifier on Sentinel-2 multispectral satellite imagery with NDVI/NBR spectral indices — 88% F1-score on held-out test data.',
    signal: 'Computer Vision',
    track: 'engineering',
  },
  {
    title: 'Batcave Containers',
    value: '56',
    icon: FaDocker,
    summary: 'Solo-built 56-container private AI cloud running LLMs, RAG pipelines, media, monitoring, and automation at 99.9% uptime.',
    signal: 'Ops Reliability',
    track: 'ops',
  },
  {
    title: 'Text Records / Day',
    value: '1M+',
    icon: FaDatabase,
    summary: 'Fault-tolerant PySpark workflow processing 1 M+ text records per day with consistent throughput on AWS at Cognizant.',
    signal: 'Data Scale',
    track: 'ops',
  },
  {
    title: 'RAG OCR Accuracy',
    value: '98%',
    icon: FaBrain,
    summary: 'PDF-to-podcast RAG pipeline achieving 98% OCR accuracy on 200+ page documents with transformer NER for character identification.',
    signal: 'RAG Precision',
    track: 'delivery',
  },
  {
    title: 'AWS Infra Cost Saved',
    value: '25%',
    icon: FaCloud,
    summary: 'Monthly AWS infrastructure cost reduction via Lambda and SageMaker optimization and autoscaling at Cognizant.',
    signal: 'Cloud Efficiency',
    track: 'ops',
  },
  {
    title: 'ML Release Cycles Cut',
    value: '30%',
    icon: FaCogs,
    summary: 'Enterprise MLOps CI/CD with Jenkins — automated retraining, model versioning, drift alerting, and production incident reduction.',
    signal: 'MLOps Velocity',
    track: 'engineering',
  },
  {
    title: 'LLMs Self-Hosted',
    value: '5+',
    icon: FaTrophy,
    summary: 'LLaMA, Mistral, Phi, DeepSeek, and more — locally running via Ollama on Batcave with FAISS-backed RAG and semantic caching.',
    signal: 'Local AI Stack',
    track: 'ops',
  },
  {
    title: 'YOLOv8 Detection Accuracy',
    value: '95%',
    icon: FaServer,
    summary: 'Real-time object detection for autonomous RC car navigation at UMBC R/SEEK — TensorFlow Lite on ESP32, no cloud dependency.',
    signal: 'Edge AI',
    track: 'engineering',
  },
  {
    title: 'Technologies in Production',
    value: '30+',
    icon: FaBolt,
    summary: 'Frameworks, cloud services, databases, and tools used in live production systems across roles and personal projects.',
    signal: 'Stack Breadth',
    track: 'engineering',
  },
];

const trackLabels: Record<'all' | Stat['track'], string> = {
  all: 'All Signals',
  delivery: 'Delivery',
  engineering: 'Engineering',
  ops: 'Operations',
};

function parseStatValue(value: string): number {
  const normalized = value.toLowerCase().replace(/,/g, '').trim();
  const base = Number(normalized.replace(/[^0-9.]/g, '')) || 0;
  if (normalized.includes('k')) return base * 1000;
  return base;
}

/* ── GSAP counter ── */
function StatCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Parse e.g. "91%", "30%+", "56", "5+", "1M+"
    const match = value.match(/^([\d.]+)([KkMm%]?)(\+?)$/);
    if (!match) { el.textContent = value; return; }

    const base = parseFloat(match[1]);
    const kSuffix = match[2] || '';
    const plus = match[3] || '';
    const decimals = (match[1].split('.')[1] || '').length;

    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: base,
      duration: 2,
      ease: 'power3.out',
      paused: true,
      onUpdate() {
        const formatted = decimals > 0
          ? obj.v.toFixed(decimals)
          : Math.round(obj.v).toString();
        el.textContent = formatted + kSuffix + plus;
      },
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => tween.play(),
    });

    return () => { st.kill(); tween.kill(); };
  }, [value]);

  return <span ref={ref}>{value}</span>;
}

const morphPaths = [
  'M0,200 Q175,140 350,200 T700,200 V300 H0 Z',
  'M0,200 Q175,180 350,200 T700,200 V300 H0 Z',
  'M0,200 Q175,140 350,200 T700,200 V300 H0 Z',
];

export default function ImpactStats() {
  const [mounted, setMounted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'all' | Stat['track']>('all');
  const [selectedSignal, setSelectedSignal] = useState<string>(stats[0].title);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'value_desc' | 'value_asc' | 'title_asc'>('default');
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const morphIdx = useRef(0);
  const morphProgress = useRef(0);
  const lastMorphTime = useRef(performance.now());
  const morphDuration = 4000;

  useEffect(() => { setMounted(true); }, []);

  /* ── SVG morph ── */
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
        pathRef.current.setAttribute('d', lerpPath(
          morphPaths[morphIdx.current],
          morphPaths[morphIdx.current + 1],
          morphProgress.current,
        ));
      }
      lastMorphTime.current = now;
      animationRef.current = requestAnimationFrame(animateMorph);
    }
    animationRef.current = requestAnimationFrame(animateMorph);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [mounted]);

  /* ── GSAP card stagger ── */
  useEffect(() => {
    if (!mounted || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('[data-stat-card]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 36, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      );
    }, gridRef);
    return () => ctx.revert();
  }, [mounted, activeTrack, searchQuery, sortMode]);

  if (!mounted) return null;

  const baseFiltered = activeTrack === 'all' ? stats : stats.filter((s) => s.track === activeTrack);
  const query = searchQuery.trim().toLowerCase();
  const searchedStats = query
    ? baseFiltered.filter((s) => `${s.title} ${s.signal} ${s.summary}`.toLowerCase().includes(query))
    : baseFiltered;

  const filteredStats = [...searchedStats].sort((a, b) => {
    if (sortMode === 'value_desc') return parseStatValue(b.value) - parseStatValue(a.value);
    if (sortMode === 'value_asc') return parseStatValue(a.value) - parseStatValue(b.value);
    if (sortMode === 'title_asc') return a.title.localeCompare(b.title);
    return stats.findIndex((s) => s.title === a.title) - stats.findIndex((s) => s.title === b.title);
  });

  const focusedStat =
    filteredStats.find((s) => s.title === selectedSignal) || filteredStats[0] || stats[0];
  return (
    <section className="relative pt-0 pb-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        <svg
          ref={svgRef}
          className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-15 pointer-events-none rounded-2xl"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="impact-gradient-dark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="impact-gradient-light" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path ref={pathRef} d={morphPaths[0]} fill={`url(#impact-gradient-${theme === 'dark' ? 'dark' : 'light'})`} />
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search signal, metric, or summary"
                className="neural-input text-xs sm:text-sm"
                aria-label="Search impact signals"
              />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
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

          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {filteredStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  data-stat-card
                  style={{ opacity: 0 }}
                  className={`neural-card-soft rounded-2xl p-5 sm:p-6 border focus-visible:border-amber-400 focus-visible:shadow-lg cursor-pointer transition-all hover:-translate-y-1 ${
                    focusedStat.title === stat.title
                      ? 'border-amber-300/70 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]'
                      : 'border-slate-600/55'
                  }`}
                  aria-label={stat.title}
                  tabIndex={0}
                  onClick={() => setSelectedSignal(stat.title)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSignal(stat.title); }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-400">{stat.signal}</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-100">{stat.title}</h3>
                    </div>
                    <Icon className="text-2xl text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                  </div>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-3xl font-bold text-amber-200 leading-none tabular-nums">
                      <StatCounter value={stat.value} />
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-700/70 overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-orange-700/80 via-orange-500/80 to-amber-400/80" />
                  </div>
                  <div className="mt-3">
                    <span className="neural-statement-chip">{stat.summary}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={focusedStat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-5 neural-card-soft rounded-xl border border-amber-400/35 p-4 sm:p-5"
            >
              <p className="text-xs uppercase tracking-wider text-amber-300">Focused Signal</p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <div>
                  {(() => { const Icon = focusedStat.icon; return <Icon className="inline text-amber-400 mr-2 text-lg" aria-hidden="true" />; })()}
                  <h3 className="inline text-lg font-semibold text-slate-100">{focusedStat.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{focusedStat.summary}</p>
                </div>
                <p className="text-2xl font-bold text-amber-200 shrink-0 tabular-nums">{focusedStat.value}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
