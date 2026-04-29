'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { SkillsCard } from './SkillsCard';
import { FaBolt } from 'react-icons/fa';

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
  const chartInstance = useRef<any>(null);
  const [activeDomain, setActiveDomain] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const domain = params.get('domain');
    if (!domain) return;
    const matchIndex = domainLabels.findIndex((label) => label.toLowerCase() === domain.toLowerCase());
    if (matchIndex >= 0) {
      setActiveDomain(matchIndex);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (activeDomain !== null) {
      params.set('domain', domainLabels[activeDomain]);
    } else {
      params.delete('domain');
    }
    const nextUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', nextUrl);
  }, [activeDomain]);

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
    let cancelled = false;

    async function renderChart() {
      if (!mounted || !chartRef.current) return;

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      const { default: Chart } = await import('chart.js/auto');
      if (cancelled) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const isDark = theme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));
      const gridColor = isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(194, 65, 12, 0.14)';
      const labelColor = isDark ? 'rgba(255, 247, 237, 0.92)' : 'rgba(67, 20, 7, 0.92)';
      const tickColor = isDark ? 'rgba(251, 191, 36, 0.56)' : 'rgba(120, 53, 15, 0.52)';

      const labels = domainLabels;
      const values = domainValues;
      const baseBarColor = isDark ? 'rgba(245, 158, 11, 0.72)' : 'rgba(217, 119, 6, 0.68)';
      const activeBarColor = isDark ? 'rgba(249, 115, 22, 0.88)' : 'rgba(194, 65, 12, 0.82)';
      const backgroundColors = values.map((_, idx) =>
        activeDomain === idx ? activeBarColor : baseBarColor
      );
      const borderColors = values.map((_, idx) =>
        activeDomain === idx ? 'rgba(254, 215, 170, 1)' : 'rgba(251, 191, 36, 0.95)'
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
    }

    void renderChart();

    return () => {
      cancelled = true;
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [mounted, theme, activeDomain]);

  if (!mounted) return null;

  const chartHeightClass = 'h-[460px] sm:h-[500px]';
  const averageScore = Math.round(domainValues.reduce((sum, value) => sum + value, 0) / domainValues.length);
  const topScore = Math.max(...domainValues);
  const topDomains = domainLabels.filter((_, index) => domainValues[index] === topScore);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSkillCategories = skillCategories
    .map((category, index) => ({ category, index }))
    .filter(({ category }) => {
      if (!normalizedQuery) return true;
      return (
        category.title.toLowerCase().includes(normalizedQuery) ||
        category.skills.some((skill) => skill.name.toLowerCase().includes(normalizedQuery))
      );
    });
  const totalSkills = skillCategories.reduce((sum, category) => sum + category.skills.length, 0);
  const visibleSkills = filteredSkillCategories.reduce((sum, entry) => sum + entry.category.skills.length, 0);

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background behind the container, like Projects */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full neural-card neural-glow-border p-4 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <FaBolt className="text-2xl text-amber-400" />
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
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <div>
              <label className="neural-kicker mb-2">Search Skills</label>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by domain, framework, tool, or language"
                className="neural-input text-xs sm:text-sm"
                aria-label="Search technical skills"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="neural-telemetry-card min-w-[110px]">
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Coverage</p>
                <p className="mt-1 text-sm font-semibold text-amber-200">{visibleSkills}/{totalSkills} skills</p>
              </div>
              <div className="neural-telemetry-card min-w-[110px]">
                <p className="text-[11px] uppercase tracking-widest text-slate-400">Top Domain</p>
                <p className="mt-1 text-sm font-semibold text-orange-200">{topDomains.join(', ')}</p>
              </div>
            </div>
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
            <button
              type="button"
              onClick={() => {
                setActiveDomain(null);
                setQuery('');
              }}
              className="neural-pill-intro text-[11px]"
            >
              Reset
            </button>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Average Proficiency</p>
              <p className="mt-1 text-xl font-bold text-amber-200">{averageScore}%</p>
            </div>
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Top Domain</p>
              <p className="mt-1 text-sm font-semibold text-orange-200">{topDomains.join(', ')}</p>
            </div>
            <div className="neural-telemetry-card">
              <p className="text-[11px] uppercase tracking-widest text-slate-400">Current Focus</p>
              <p className="mt-1 text-sm font-semibold text-amber-200">{domainInfo.label}</p>
            </div>
          </div>

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
                <p className="text-xs tracking-wider text-orange-700 dark:text-amber-300 font-semibold">
                  Domain Spotlight
                </p>
                <p className="mt-1 font-semibold text-slate-100">{domainInfo.label} - {domainInfo.value}%</p>
                <p className="mt-1 text-xs text-slate-300">{domainInfo.description}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-amber-300 transition-all duration-500"
                    style={{ width: `${domainInfo.value}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 p-0 text-sm text-slate-300 max-w-md">
                <p className="font-semibold mb-2 text-slate-100">How to use this section</p>
                <p className="text-xs leading-relaxed">
                  Click a chart bar or a domain chip to focus an area, then scan the cards on the right for the exact tools,
                  frameworks, and platforms I use in that domain.
                </p>
              </div>
            </div>
            <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredSkillCategories.map(({ category, index }) => (
                <SkillsCard
                  key={category.title}
                  title={category.title}
                  skills={category.skills}
                  twoColumn
                  delay={index * 100}
                  onCardHover={() => setActiveDomain(index)}
                  onCardLeave={() => setActiveDomain(null)}
                  highlighted={activeDomain === index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
