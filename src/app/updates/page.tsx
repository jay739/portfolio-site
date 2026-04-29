'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import { latestSiteUpdateTimestamp, siteUpdates } from '@/data/site-updates';
import { markUpdatesSeen } from '@/lib/site-ux';

export default function UpdatesPage() {
  useEffect(() => {
    markUpdatesSeen(latestSiteUpdateTimestamp);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="What’s New"
        subtitle="A compact changelog for repeat visitors who want to see what has changed across the portfolio."
        chips={['Changelog', 'Recent Improvements', 'Portfolio Updates']}
        theme="blog"
      />
      <section className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8 bg-gradient-to-br from-sky-950/30 via-slate-950/70 to-slate-950/80">
        <div className="space-y-4">
          {siteUpdates.map((update) => (
            <article key={`${update.date}-${update.title}`} className="rounded-2xl border border-slate-700/55 bg-slate-950/35 p-5">
              <p className="text-[11px] uppercase tracking-widest text-amber-300">{update.date}</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-100">{update.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{update.details}</p>
              {update.href && (
                <Link href={update.href} className="mt-3 inline-flex text-xs text-amber-300 hover:text-amber-200">
                  Open related surface →
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-slate-700/55 bg-slate-950/35 p-5">
          <p className="text-sm text-slate-300">
            Want to suggest any improvements or new features? <Link href="/contact" className="text-amber-300 hover:text-amber-200">Send a suggestion</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
