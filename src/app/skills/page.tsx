'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import SectionDeepLink from '@/components/ui/SectionDeepLink';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

const SkillsChart = dynamic(() => import('@/components/sections/SkillsChart'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[520px] neural-card-soft rounded-xl animate-pulse" />,
});

const NeuralNetworkViz = dynamic(() => import('@/components/ui/NeuralNetworkViz'), {
  ssr: false,
  loading: () => <div className="w-full min-h-[560px] neural-card-soft rounded-xl animate-pulse" />,
});

export default function SkillsPage() {
  const { resolvedTheme } = useTheme();
  const [mapMode, setMapMode] = useState<'orbit' | 'map'>('map');
  const [urlStateReady, setUrlStateReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'map' || mode === 'orbit') {
      setMapMode(mode);
    }
    setUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !urlStateReady) return;
    const params = new URLSearchParams(window.location.search);
    if (mapMode !== 'map') {
      params.set('mode', mapMode);
    } else {
      params.delete('mode');
    }
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [mapMode, pathname, router, urlStateReady]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:skills', title: 'Skills Graph', href: '/skills', kind: 'page', description: 'Interactive skill topology and domain map' }} />
      <NeuralPageIntro
        title="Skills Graph"
        subtitle="Explore the full neural skill topology with search, domain filters, and linked-focus pathways. Use this map to inspect technologies, projects, and impact relationships."
        chips={['Neural Radar', 'Explainability', 'Interaction']}
        theme="skills"
      />
      <div className="w-full rounded-[28px]">
        <section id="skills-map" className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="neural-section-title text-xl sm:text-2xl">Interactive Neural Skills Map</h2>
            <SectionDeepLink id="skills-map" title="Skills map" />
            <div className="inline-flex gap-2">
              <button
                type="button"
                className={`neural-control-btn ${mapMode === 'map' ? 'border-amber-400/70 text-amber-200' : ''}`}
                onClick={() => setMapMode('map')}
              >
                Map Mode
              </button>
              <button
                type="button"
                className={`neural-control-btn ${mapMode === 'orbit' ? 'border-amber-400/70 text-amber-200' : ''}`}
                onClick={() => setMapMode('orbit')}
              >
                Orbit Mode
              </button>
            </div>
          </div>
          {/* ── Map legend & how-to ── */}
          <div className="mb-5 rounded-xl border border-amber-400/20 bg-slate-900/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-3">How this map works</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'INPUT',   sub: 'Core skills & tools',    color: '#D97706', note: '11 nodes' },
                { label: 'LAYER 1', sub: 'Derived capabilities',   color: '#F97316', note: '9 nodes'  },
                { label: 'LAYER 2', sub: 'Real-world projects',    color: '#EA580C', note: '6 nodes'  },
                { label: 'OUTPUT',  sub: 'Delivered outcomes',     color: '#FED7AA', note: '4 nodes'  },
              ].map(z => (
                <div key={z.label} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: z.color, boxShadow: `0 0 6px ${z.color}` }}
                  />
                  <div>
                    <p className="text-[11px] font-bold leading-tight" style={{ color: z.color }}>{z.label}</p>
                    <p className="text-[10px] text-slate-300 leading-tight">{z.sub}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{z.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Edges flow <span className="text-amber-300 font-medium">left → right</span>: raw skills combine into capabilities, which power projects, which deliver outcomes.
              Signal dots animate along each edge to show active data flow.{' '}
              <span className="text-slate-300">Hover a node</span> to read its role ·{' '}
              <span className="text-slate-300">Click</span> to pin & isolate ·{' '}
              <span className="text-slate-300">Double-click</span> to navigate · use <span className="text-slate-300">Filter Domains</span> below to highlight a category.
            </p>
          </div>
          <NeuralNetworkViz
            mode={mapMode}
            isActive
            isDark={resolvedTheme !== 'light'}
            showControls
            interactive
          />
        </section>
      </div>
      <div className="w-full rounded-[28px]">
        <section id="skills" className="w-full p-0">
          <div className="mb-3 flex justify-end">
            <SectionDeepLink id="skills" title="Skills chart" />
          </div>
          <SkillsChart />
        </section>
      </div>
      <RouteNextSteps
        items={[
          { href: '/projects', label: 'See matching projects', note: 'Move from domain strengths into real case studies.' },
          { href: '/impact', label: 'Tie skills to outcomes', note: 'See where these capabilities produced measurable results.' },
          { href: '/paths', label: 'Follow a curated collection', note: 'Choose a guided route based on your interests.' },
        ]}
      />
    </main>
  );
} 
