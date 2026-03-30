'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import SkillsChart from '@/components/sections/SkillsChart';
import NeuralNetworkViz from '@/components/NeuralNetworkViz';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import InteractiveSurface from '@/components/ui/InteractiveSurface';

export default function SkillsPage() {
  const { resolvedTheme } = useTheme();
  const [mapMode, setMapMode] = useState<'orbit' | 'map'>('map');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Skills Graph"
        subtitle="Explore the full neural skill topology with search, domain filters, and linked-focus pathways. Use this map to inspect technologies, projects, and impact relationships."
        chips={['Neural Radar', 'Explainability', 'Interaction']}
      />
      <InteractiveSurface className="w-full rounded-[28px]">
        <section id="skills-map" className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8 neural-hover-lift">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="neural-section-title text-xl sm:text-2xl">Interactive Neural Skills Map</h2>
            <div className="inline-flex gap-2">
              <button
                type="button"
                className={`neural-control-btn ${mapMode === 'map' ? 'border-violet-400/70 text-violet-200' : ''}`}
                onClick={() => setMapMode('map')}
              >
                Map Mode
              </button>
              <button
                type="button"
                className={`neural-control-btn ${mapMode === 'orbit' ? 'border-violet-400/70 text-violet-200' : ''}`}
                onClick={() => setMapMode('orbit')}
              >
                Orbit Mode
              </button>
            </div>
          </div>
          <p className="neural-section-copy mb-4">
            Search any skill, click domains to filter, and pin nodes to inspect direct dependencies and neighboring capabilities.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="neural-kicker">Skills Intelligence Layer</span>
            <span className="neural-pill-intro text-[11px]">Topology exploration</span>
            <span className="neural-pill-intro text-[11px]">Domain filtering</span>
          </div>
          <div className="relative w-full h-[700px] sm:h-[790px] lg:h-[900px] rounded-2xl overflow-hidden border border-cyan-400/30 bg-[rgba(2,6,23,0.18)]">
            <NeuralNetworkViz
              mode={mapMode}
              isActive
              isDark={resolvedTheme !== 'light'}
              showControls
              interactive
            />
          </div>
        </section>
      </InteractiveSurface>
      <InteractiveSurface className="w-full rounded-[28px]">
        <section id="skills" className="w-full p-0">
          <SkillsChart />
        </section>
      </InteractiveSurface>
    </main>
  );
} 