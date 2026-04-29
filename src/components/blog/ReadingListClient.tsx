'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { BlogPostMeta } from '@/lib/blog';
import GuidedEmptyState from '@/components/ui/GuidedEmptyState';
import {
  BLOG_BOOKMARKS_EVENT,
  BLOG_HISTORY_EVENT,
  getBlogBookmarks,
  getBlogHistory,
  getSeenUpdatesTimestamp,
} from '@/lib/site-ux';
import { siteUpdates } from '@/data/site-updates';

export default function ReadingListClient({ allPosts }: { allPosts: BlogPostMeta[] }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState(getBlogHistory());

  useEffect(() => {
    const syncBookmarks = () => setBookmarks(getBlogBookmarks());
    const syncHistory = () => setHistory(getBlogHistory());
    syncBookmarks();
    syncHistory();
    window.addEventListener(BLOG_BOOKMARKS_EVENT, syncBookmarks as EventListener);
    window.addEventListener(BLOG_HISTORY_EVENT, syncHistory as EventListener);
    return () => {
      window.removeEventListener(BLOG_BOOKMARKS_EVENT, syncBookmarks as EventListener);
      window.removeEventListener(BLOG_HISTORY_EVENT, syncHistory as EventListener);
    };
  }, []);

  const bookmarkedPosts = useMemo(
    () => bookmarks.map((slug) => allPosts.find((post) => post.slug === slug)).filter(Boolean),
    [allPosts, bookmarks]
  );

  const recentlyVisitedPosts = useMemo(
    () => history.map((entry) => allPosts.find((post) => post.slug === entry.slug)).filter(Boolean).slice(0, 6),
    [allPosts, history]
  );

  const updatesSinceLastVisit = useMemo(() => {
    const seenAt = getSeenUpdatesTimestamp();
    return siteUpdates.filter((update) => new Date(update.timestamp).getTime() > seenAt);
  }, []);

  return (
    <section className="w-full grid gap-5 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-5">
        <div className="neural-card neural-glow-border bg-gradient-to-br from-sky-950/25 via-slate-950/75 to-slate-950/85 p-5 sm:p-6">
          <h2 className="neural-section-title text-xl">Bookmarked Posts</h2>
          <div className="mt-4 space-y-3">
            {bookmarkedPosts.length > 0 ? bookmarkedPosts.map((post) => post && (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 transition hover:border-amber-400/25">
                <p className="text-sm font-semibold text-slate-100">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.excerpt}</p>
              </Link>
            )) : (
              <GuidedEmptyState
                title="No bookmarks yet"
                description="Save a few articles from the blog and this page becomes your lightweight local reading queue."
                primaryHref="/blog"
                primaryLabel="Browse the blog"
              />
            )}
          </div>
        </div>
        <div className="neural-card neural-glow-border bg-gradient-to-br from-slate-950/65 via-slate-950/85 to-indigo-950/25 p-5 sm:p-6">
          <h2 className="neural-section-title text-xl">Recent Reading</h2>
          <div className="mt-4 space-y-3">
            {recentlyVisitedPosts.length > 0 ? recentlyVisitedPosts.map((post) => post && (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 transition hover:border-amber-400/25">
                <p className="text-sm font-semibold text-slate-100">{post.title}</p>
                <p className="mt-1 text-xs text-slate-400">{post.readingTime}</p>
              </Link>
            )) : (
              <GuidedEmptyState
                title="No recent reading yet"
                description="As you open articles, your latest reads show up here so you can jump back in quickly."
                primaryHref="/blog"
                primaryLabel="Start reading"
              />
            )}
          </div>
        </div>
      </div>
      <aside className="neural-card neural-glow-border bg-gradient-to-br from-amber-950/20 via-slate-950/80 to-slate-950/90 p-5 sm:p-6">
        <h2 className="neural-section-title text-xl">Since Last Visit</h2>
        <div className="mt-4 space-y-3">
          {updatesSinceLastVisit.length > 0 ? updatesSinceLastVisit.map((update) => (
            <Link key={update.id} href={update.href || '/updates'} className="block rounded-xl border border-slate-700/60 bg-slate-950/35 p-4 transition hover:border-amber-400/25">
              <p className="text-[10px] uppercase tracking-widest text-amber-300">{update.date}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{update.title}</p>
              <p className="mt-1 text-xs text-slate-400">{update.details}</p>
            </Link>
          )) : (
            <GuidedEmptyState
              title="Nothing new since your last check"
              description="You’re caught up. The changelog will light up again the next time new portfolio work lands."
              primaryHref="/updates"
              primaryLabel="Open What’s New"
            />
          )}
        </div>
      </aside>
    </section>
  );
}
