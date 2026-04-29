'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { siteUpdates } from '@/data/site-updates';

export default function LiveStatusStrip() {
  const statusItems = useMemo(
    () => [
      {
        label: 'Blog freshness',
        value: 'Research notes live',
        href: '/blog',
      },
      {
        label: 'Latest update',
        value: siteUpdates[0]?.date ?? 'April 2026',
        href: '/updates',
      },
      {
        label: 'Telemetry mode',
        value: 'Public-safe live strip',
        href: '/homeserver?lite=1',
      },
      {
        label: 'AI tools',
        value: 'Self-hosted demos live',
        href: '/ai-tools',
      },
    ],
    []
  );

  return (
    <div className="px-2 pt-3 sm:px-6">
      <div className="mx-auto flex flex-wrap gap-2 rounded-2xl border border-slate-700/50 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
        {statusItems.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-full border border-slate-700/60 bg-slate-900/50 px-3 py-1 transition hover:border-amber-400/25 hover:text-amber-200">
            <span className="text-slate-500">{item.label}:</span> {item.value}
          </Link>
        ))}
      </div>
    </div>
  );
}
