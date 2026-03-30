'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Chart from 'chart.js/auto';
import { SkillsCard } from './SkillsCard';

const skillCategories = [
  {
    title: 'Frontend Development',
    skills: [
      { name: 'React', url: 'https://reactjs.org/' },
      { name: 'Next.js', url: 'https://nextjs.org/' },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com/' },
      { name: 'HTML/CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
      { name: 'Astro', url: 'https://astro.build/' },
      { name: 'Tkinter', url: 'https://docs.python.org/3/library/tkinter.html' }
    ],
  },
  {
    title: 'Backend & APIs',
    skills: [
      { name: 'Node.js', url: 'https://nodejs.org/' },
      { name: 'Python', url: 'https://www.python.org/' },
      { name: 'Django', url: 'https://www.djangoproject.com/' },
      { name: 'Express', url: 'https://expressjs.com/' },
      { name: 'REST APIs', url: 'https://en.wikipedia.org/wiki/Representational_state_transfer' },
      { name: 'FastAPI', url: 'https://fastapi.tiangolo.com/' }
    ],
  },
  {
    title: 'DevOps & Home Server',
    skills: [
      { name: 'Docker', url: 'https://www.docker.com/' },
      { name: 'Kubernetes', url: 'https://kubernetes.io/' },
      { name: 'Linux', url: 'https://www.linux.org/' },
      { name: 'CI/CD', url: 'https://en.wikipedia.org/wiki/CI/CD' },
      { name: 'Portainer', url: 'https://www.portainer.io/' },
      { name: 'Nginx', url: 'https://nginx.org/' },
      { name: 'Authentik SSO', url: 'https://goauthentik.io/' },
      { name: 'Tailscale VPN', url: 'https://tailscale.com/' },
      { name: 'Netdata', url: 'https://www.netdata.cloud/' },
      { name: 'Uptime Kuma', url: 'https://github.com/louislam/uptime-kuma' }
    ],
  },
  {
    title: 'AI/ML & Data Science',
    skills: [
      { name: 'TensorFlow', url: 'https://www.tensorflow.org/' },
      { name: 'PyTorch', url: 'https://pytorch.org/' },
      { name: 'NLP', url: 'https://en.wikipedia.org/wiki/Natural_language_processing' },
      { name: 'Computer Vision', url: 'https://en.wikipedia.org/wiki/Computer_vision' },
      { name: 'MLOps', url: 'https://en.wikipedia.org/wiki/MLOps' },
      { name: 'Pandas', url: 'https://pandas.pydata.org/' },
      { name: 'Scikit-learn', url: 'https://scikit-learn.org/' },
      { name: 'LangChain', url: 'https://www.langchain.com/' },
      { name: 'LangGraph', url: 'https://langchain-ai.github.io/langgraph/' },
      { name: 'Ollama', url: 'https://ollama.ai/' },
      { name: 'PySpark', url: 'https://spark.apache.org/docs/latest/api/python/' },
      { name: 'YOLOv8', url: 'https://docs.ultralytics.com/' }
    ],
  },
  {
    title: 'Databases & Cache',
    skills: [
      { name: 'PostgreSQL', url: 'https://www.postgresql.org/' },
      { name: 'MariaDB', url: 'https://mariadb.org/' },
      { name: 'Redis', url: 'https://redis.io/' },
      { name: 'SQLite', url: 'https://www.sqlite.org/' },
      { name: 'MongoDB', url: 'https://www.mongodb.com/' },
      { name: 'FAISS', url: 'https://github.com/facebookresearch/faiss' }
    ],
  },
  {
    title: 'Cloud & Automation',
    skills: [
      { name: 'AWS', url: 'https://aws.amazon.com/' },
      { name: 'GCP', url: 'https://cloud.google.com/' },
      { name: 'GitHub Actions', url: 'https://github.com/features/actions' },
      { name: 'Watchtower', url: 'https://containrrr.dev/watchtower/' },
      { name: 'Vaultwarden', url: 'https://github.com/dani-garcia/vaultwarden' }
    ],
  },
  {
    title: 'Android & Embedded',
    skills: [
      { name: 'Android ROM', url: 'https://source.android.com/' },
      { name: 'Custom Kernels', url: 'https://kernel.org/' },
      { name: 'LineageOS', url: 'https://lineageos.org/' },
      { name: 'AOSP', url: 'https://source.android.com/' },
      { name: 'Embedded Systems', url: 'https://en.wikipedia.org/wiki/Embedded_system' },
      { name: 'Device Trees', url: 'https://www.devicetree.org/' }
    ],
  },
];

const domainLabels = ['Frontend', 'Backend', 'DevOps', 'AI/ML', 'Databases', 'Cloud', 'Android/Embedded'];
const domainValues = [90, 85, 90, 85, 80, 80, 85];

const domainDescriptions = [
  'Interfaces, component architecture, and responsive UX systems.',
  'APIs, services, and scalable server-side application design.',
  'Deployment, container orchestration, observability, and reliability.',
  'Modeling, retrieval, GenAI workflows, and ML system delivery.',
  'Data modeling, query performance, and persistence design.',
  'Cloud services, CI/CD pipelines, and automation workflows.',
  'Low-level customization, ROM/kernel work, and embedded integration.',
];

export default function SkillsChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const chartInstance = useRef<Chart | null>(null);
  const [activeDomain, setActiveDomain] = useState<number | null>(null);
  const [chartSize, setChartSize] = useState<'balanced' | 'large' | 'xl'>('large');
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [compareDomain, setCompareDomain] = useState<number | null>(null);
  const [autoFocus, setAutoFocus] = useState(false);

  const domainInfo = useMemo(() => {
    const index = activeDomain ?? 0;
    return {
      label: domainLabels[index],
      value: domainValues[index],
      description: domainDescriptions[index],
    };
  }, [activeDomain]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!autoFocus) return;
    let idx = activeDomain ?? 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % domainLabels.length;
      setActiveDomain(idx);
    }, 2200);
    return () => clearInterval(timer);
  }, [autoFocus, activeDomain]);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const isDark = theme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.2)';
    const labelColor = isDark ? 'rgba(248, 250, 252, 0.9)' : 'rgba(15, 23, 42, 0.9)';
    const tickColor = isDark ? 'rgba(148, 163, 184, 0.5)' : 'rgba(100, 116, 139, 0.5)';

    const labels = domainLabels;
    const values = domainValues;
    const baseBarColor = isDark ? 'rgba(56, 189, 248, 0.72)' : 'rgba(14, 116, 144, 0.65)';
    const activeBarColor = isDark ? 'rgba(232, 121, 249, 0.86)' : 'rgba(147, 51, 234, 0.82)';
    const backgroundColors = values.map((_, idx) =>
      showSpotlight && activeDomain === idx ? activeBarColor : baseBarColor
    );
    const borderColors = values.map((_, idx) =>
      showSpotlight && activeDomain === idx ? 'rgba(244, 114, 182, 1)' : 'rgba(34, 211, 238, 0.95)'
    );

    const newChartData = {
      labels,
      datasets: [
        {
          label: 'Proficiency (0–100)',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.2,
          borderRadius: 999,
          borderSkipped: false,
          barThickness: 18,
          maxBarThickness: 22,
          categoryPercentage: 0.78,
          barPercentage: 0.88,
        },
      ],
    };

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: newChartData,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              stepSize: 20,
              color: tickColor,
              callback: (value: number | string) => `${Number(value)}%`,
            },
            title: {
              display: true,
              text: 'Proficiency',
              color: labelColor,
              font: { size: 11 },
            },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: labelColor,
              font: { size: 12, weight: 600 },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                const labels = context.chart.data.labels as string[] | undefined;
                const label = labels ? labels[context.dataIndex] : '';
                return `${label}: ${context.formattedValue}% proficiency`;
              },
            },
          },
        },
        onClick: (_event, _elements, chart) => {
          const active = chart.getActiveElements();
          if (!active.length) return;
          const idx = active[0].index;
          setActiveDomain((prev) => (prev === idx ? null : idx));
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [mounted, theme, activeDomain]);

  if (!mounted) return null;

  const chartHeightClass =
    chartSize === 'xl' ? 'h-[560px]' : chartSize === 'large' ? 'h-[500px]' : 'h-[430px]';
  const primarySkillCategories = skillCategories.slice(0, 4);
  const secondarySkillCategories = skillCategories.slice(4);
  const averageScore = Math.round(domainValues.reduce((sum, value) => sum + value, 0) / domainValues.length);
  const topScore = Math.max(...domainValues);
  const topDomains = domainLabels.filter((_, index) => domainValues[index] === topScore);
  const activeIndex = activeDomain ?? 0;
  const compareDelta =
    compareDomain === null ? null : domainValues[activeIndex] - domainValues[compareDomain];

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background behind the container, like Projects */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full neural-card neural-glow-border p-4 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">⚡</span>
            <h2 className="neural-section-title">
              Technical Skills
            </h2>
          </div>
          <p className="neural-section-copy max-w-2xl mb-3">
            A comprehensive overview of my technical expertise across various domains
          </p>

          <div className="mb-4">
            <span className="neural-statement-chip">
              Use the neural map above for relationship discovery, then use this structured matrix for exact skill coverage.
            </span>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="neural-kicker">Chart Size</span>
            {([
              { id: 'balanced', label: 'Balanced' },
              { id: 'large', label: 'Large' },
              { id: 'xl', label: 'XL' },
            ] as const).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setChartSize(option.id)}
                className={`neural-pill-intro text-[11px] ${chartSize === option.id ? 'is-active' : ''}`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowSpotlight((prev) => !prev)}
              className={`neural-pill-intro text-[11px] ${showSpotlight ? 'is-active' : ''}`}
            >
              {showSpotlight ? 'Spotlight ON' : 'Spotlight OFF'}
            </button>
            <button
              type="button"
              onClick={() => setAutoFocus((prev) => !prev)}
              className={`neural-pill-intro text-[11px] ${autoFocus ? 'is-active' : ''}`}
            >
              {autoFocus ? 'Auto Focus ON' : 'Auto Focus OFF'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveDomain(null);
                setCompareDomain(null);
                setAutoFocus(false);
              }}
              className="neural-pill-intro text-[11px]"
            >
              Reset View
            </button>
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="neural-kicker">Quick Focus</span>
            {domainLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveDomain(index)}
                className={`neural-pill-intro text-[10px] ${activeDomain === index ? 'is-active' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Average Proficiency</p>
              <p className="mt-1 text-xl font-bold text-cyan-200">{averageScore}%</p>
            </div>
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Top Domain</p>
              <p className="mt-1 text-sm font-semibold text-violet-200">{topDomains.join(', ')}</p>
            </div>
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Compare Domain</p>
              <select
                value={compareDomain ?? ''}
                onChange={(event) => {
                  const value = event.target.value;
                  setCompareDomain(value === '' ? null : Number(value));
                }}
                className="neural-input mt-1 text-xs"
                aria-label="Compare selected domain"
              >
                <option value="">None</option>
                {domainLabels.map((label, index) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {compareDomain !== null && (
            <div className="mb-5">
              <span className="neural-statement-chip">
                {domainLabels[activeIndex]} ({domainValues[activeIndex]}%) vs {domainLabels[compareDomain]} ({domainValues[compareDomain]}%):
                {' '}
                {compareDelta === 0
                  ? 'parity'
                  : compareDelta! > 0
                  ? `${Math.abs(compareDelta!)} points higher`
                  : `${Math.abs(compareDelta!)} points lower`}
                .
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start min-h-[420px]">
            <div className="xl:col-span-7 flex flex-col items-center min-w-[220px] w-full">
              <div className={`w-full ${chartHeightClass} p-2 flex flex-col items-center justify-center`}>
                {mounted ? (
                  <canvas ref={chartRef} className="w-full h-full cursor-pointer" />
                ) : (
                  <span className="text-slate-400 text-center w-full">Loading chart...</span>
                )}
              </div>
              <div className="mt-4 w-full max-w-md text-sm">
                <p className="text-xs tracking-wider text-pink-700 dark:text-pink-300 font-semibold">
                  Domain Spotlight
                </p>
                <p className="mt-1 font-semibold text-slate-100">{domainInfo.label} - {domainInfo.value}%</p>
                <p className="mt-1 text-xs text-slate-300">{domainInfo.description}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${domainInfo.value}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 p-0 text-sm text-slate-300 max-w-md">
                <p className="font-semibold mb-2 text-slate-100">Legend</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Bars:</strong> Each row = one skill domain (Frontend, Backend, DevOps, etc.)</li>
                  <li><strong>Scale:</strong> 0–100% proficiency from left to right</li>
                  <li><strong>Spotlight:</strong> highlighted row marks the currently focused domain</li>
                  <li><strong>Interaction:</strong> click a bar, quick-focus chips, or hover domain cards to focus a category</li>
                </ul>
              </div>
            </div>
            <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {primarySkillCategories.map((category, index) => (
                <SkillsCard
                  key={category.title}
                  title={category.title}
                  skills={category.skills}
                  twoColumn
                  delay={index * 100}
                  onCardHover={() => setActiveDomain(index)}
                  onCardLeave={() => setActiveDomain(null)}
                />
              ))}
            </div>
          </div>
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Additional Skill Domains</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {secondarySkillCategories.map((category, index) => {
                const categoryIndex = index + primarySkillCategories.length;
                return (
                  <SkillsCard
                    key={category.title}
                    title={category.title}
                    skills={category.skills}
                    delay={categoryIndex * 100}
                    onCardHover={() => setActiveDomain(categoryIndex)}
                    onCardLeave={() => setActiveDomain(null)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 