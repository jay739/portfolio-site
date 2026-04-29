'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { getRecentViews, type RecentViewItem } from '@/lib/site-ux';

export default function RecentlyViewedRail() {
  const [items, setItems] = useState<RecentViewItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(getRecentViews());
    sync();
    window.addEventListener('site-ux:recent-views', sync as EventListener);
    return () => window.removeEventListener('site-ux:recent-views', sync as EventListener);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-2 pb-6 sm:px-6">
      <div className="mx-auto w-full neural-card-soft rounded-2xl border border-slate-700/60 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <History className="h-4 w-4 text-amber-300" />
          <h2 className="text-sm font-semibold text-slate-100">Recently Viewed</h2>
          <p className="text-xs text-slate-500">Saved locally on this device for fast return visits.</p>
        </div>
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="min-w-[240px] snap-start rounded-xl border border-slate-700/60 bg-slate-950/30 p-3 transition hover:border-amber-400/25 hover:bg-slate-900/60 md:min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-amber-300">{item.kind}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{item.title}</p>
              {item.description && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
