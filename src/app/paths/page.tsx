'use client';

import Link from 'next/link';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import { sitePaths } from '@/data/paths';

export default function PathsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="Collections"
        subtitle="Curated ways to explore the portfolio depending on what you care about most: AI delivery, homelab architecture, or full-stack product work."
        chips={['Guided Paths', 'Curated Journeys', 'Audience-Aware']}
        theme="projects"
      />
      <section className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8 bg-gradient-to-br from-orange-950/30 via-slate-950/70 to-slate-950/80">
        <div className="mb-6 grid gap-4 rounded-3xl border border-orange-400/10 bg-orange-500/5 p-4 sm:grid-cols-[1.1fr,0.9fr] sm:p-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-orange-300">Choose your route</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">Collections are tuned to intent, not just page order.</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Each collection lands with route-specific filters, presets, or views already selected so the portfolio feels guided instead of generic.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {sitePaths.map((path) => (
            <article id={path.id} key={path.id} className="rounded-[26px] border border-slate-700/60 bg-gradient-to-br from-slate-950/55 via-slate-950/35 to-slate-900/55 p-5 scroll-mt-28">
              <p className="text-[11px] uppercase tracking-widest text-amber-300">{path.audience}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-100">{path.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{path.description}</p>
              <div className="mt-5 space-y-3">
                {path.stops.map((stop, index) => (
                  <Link key={stop.href} href={stop.href} className="block rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 transition hover:border-amber-400/25 hover:bg-slate-900/60">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Stop {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{stop.label}</p>
                    <p className="mt-1 text-xs text-slate-400">{stop.note}</p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
