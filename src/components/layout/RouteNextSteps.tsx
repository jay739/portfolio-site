'use client';

import Link from 'next/link';

export default function RouteNextSteps({
  title = 'Good Next Move',
  items,
}: {
  title?: string;
  items: Array<{ href: string; label: string; note: string }>;
}) {
  return (
    <section className="w-full rounded-3xl border border-slate-700/60 bg-slate-950/35 p-5 sm:p-6">
      <p className="text-[11px] uppercase tracking-widest text-amber-300">{title}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-4 transition hover:border-amber-400/25 hover:bg-slate-900/70">
            <p className="text-sm font-semibold text-slate-100">{item.label}</p>
            <p className="mt-2 text-xs text-slate-400">{item.note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
