'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { projects } from '@/data/projects';
import { sitePaths } from '@/data/paths';
import { siteUpdates } from '@/data/site-updates';
import { getRecentViews, getSeenUpdatesTimestamp, type RecentViewItem } from '@/lib/site-ux';
import { projectSlug } from '@/lib/project-utils';
import type { BlogPostMeta } from '@/lib/blog';

export default function HomeSmartHub({ latestPost }: { latestPost?: BlogPostMeta }) {
  const [recent, setRecent] = useState<RecentViewItem[]>([]);
  const [seenUpdatesAt, setSeenUpdatesAt] = useState(0);

  useEffect(() => {
    const sync = () => setRecent(getRecentViews());
    sync();
    window.addEventListener('site-ux:recent-views', sync as EventListener);
    return () => window.removeEventListener('site-ux:recent-views', sync as EventListener);
  }, []);

  useEffect(() => {
    const sync = () => setSeenUpdatesAt(getSeenUpdatesTimestamp());
    sync();
    window.addEventListener('site-ux:updates-seen', sync as EventListener);
    return () => window.removeEventListener('site-ux:updates-seen', sync as EventListener);
  }, []);

  const featuredProject = projects.find((project) => project.featured) || projects[0];
  const suggestedPath = useMemo(() => {
    const latestKind = recent[0]?.kind;
    if (latestKind === 'project' || latestKind === 'tool') return sitePaths[0];
    if (latestKind === 'gallery' || latestKind === 'page') return sitePaths[1];
    return sitePaths[2];
  }, [recent]);

  const unseenUpdates = useMemo(() => {
    return siteUpdates
      .filter((update) => new Date(update.timestamp).getTime() > seenUpdatesAt)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2);
  }, [seenUpdatesAt]);

  return (
    <section className="w-full px-2 sm:px-6">
      <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-950/80 via-slate-900/75 to-slate-950/80 p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-widest text-amber-300">Smart Hub</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Start where your last visit left off</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Continue exploring</p>
              {recent.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {recent.slice(0, 3).map((item) => (
                    <Link key={item.id} href={item.href} className="block rounded-xl border border-slate-700/60 bg-slate-950/35 p-3 transition hover:border-amber-400/25">
                      <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.description || item.kind}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Once you explore a few pages, this space becomes your quick return rail.</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/45 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Suggested collection</p>
              <Link href={`/paths#${suggestedPath.id}`} className="mt-3 block rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 transition hover:border-amber-400/25">
                <p className="text-lg font-semibold text-amber-200">{suggestedPath.title}</p>
                <p className="mt-2 text-sm text-slate-400">{suggestedPath.description}</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <Link href={`/projects?project=${projectSlug(featuredProject.title)}`} className="rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-orange-950/50 via-slate-950/70 to-slate-950/80 p-5 transition hover:border-amber-400/25">
            <p className="text-[11px] uppercase tracking-widest text-orange-300">Featured build</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-100">{featuredProject.title}</h3>
            <p className="mt-2 text-sm text-slate-400 line-clamp-3">{featuredProject.description}</p>
          </Link>

          {latestPost && (
            <Link href={`/blog/${latestPost.slug}`} className="rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-sky-950/45 via-slate-950/75 to-slate-950/85 p-5 transition hover:border-sky-400/30">
              <p className="text-[11px] uppercase tracking-widest text-sky-300">Latest note</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-100">{latestPost.title}</h3>
              <p className="mt-2 text-sm text-slate-400 line-clamp-3">{latestPost.excerpt}</p>
              <p className="mt-3 text-[11px] uppercase tracking-widest text-slate-500">{latestPost.readingTime}</p>
            </Link>
          )}

          <div className="rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-sky-950/40 via-slate-950/70 to-slate-950/80 p-5">
            <p className="text-[11px] uppercase tracking-widest text-sky-300">New since last visit</p>
            <div className="mt-3 space-y-2">
              {unseenUpdates.length > 0 ? unseenUpdates.map((update) => (
                <Link key={update.id} href={update.href || '/updates'} className="block rounded-xl border border-slate-700/60 bg-slate-950/35 p-3 transition hover:border-amber-400/25">
                  <p className="text-sm font-semibold text-slate-100">{update.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{update.details}</p>
                </Link>
              )) : (
                <p className="text-sm text-slate-400">You’re caught up. The updates page will light up again when something new lands.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
