'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, History } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';
import {
  getBlogBookmarks,
  getBlogHistory,
  pushSiteFeedback,
  recordBlogHistory,
  setBlogBookmarks,
  type BlogHistoryEntry,
} from '@/lib/site-ux';

export default function BlogPostEnhancements({
  slug,
  title,
  allPosts,
}: {
  slug: string;
  title: string;
  allPosts: BlogPostMeta[];
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [history, setHistory] = useState<BlogHistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const bookmarks = getBlogBookmarks();
      setBookmarked(bookmarks.includes(slug));
    } catch {
      setBookmarked(false);
    }

    try {
      recordBlogHistory({ slug, title, visitedAt: Date.now() });
      setHistory(getBlogHistory());
    } catch {
      setHistory([{ slug, title, visitedAt: Date.now() }]);
    }
  }, [slug, title]);

  const toggleBookmark = () => {
    if (typeof window === 'undefined') return;
    try {
      const bookmarks = getBlogBookmarks();
      const next = bookmarks.includes(slug)
        ? bookmarks.filter((entry) => entry !== slug)
        : [slug, ...bookmarks].slice(0, 20);
      setBlogBookmarks(next);
      setBookmarked(next.includes(slug));
      pushSiteFeedback(next.includes(slug) ? 'Saved to your reading list.' : 'Removed from your reading list.', 'success');
    } catch {
      setBlogBookmarks([slug]);
      setBookmarked(true);
      pushSiteFeedback('Saved to your reading list.', 'success');
    }
  };

  const recentPosts = useMemo(() => {
    const slugs = history.map((entry) => entry.slug).filter((entrySlug) => entrySlug !== slug);
    return slugs
      .map((entrySlug) => allPosts.find((post) => post.slug === entrySlug))
      .filter(Boolean)
      .slice(0, 3) as BlogPostMeta[];
  }, [allPosts, history, slug]);

  return (
    <div className="mb-8 grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4 md:grid-cols-[auto,1fr]">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleBookmark}
          className="neural-control-btn-ghost inline-flex items-center gap-2 text-xs"
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4 text-amber-300" /> : <Bookmark className="h-4 w-4" />}
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
        <Link href="/reading-list" className="neural-control-btn-ghost inline-flex items-center gap-2 text-xs">
          Reading list
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
          <History className="h-3.5 w-3.5" />
          Reading History
        </div>
        {recentPosts.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {recentPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="neural-pill-intro text-[11px]">
                {post.title}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Recent articles you open here will appear in this quick history.</p>
        )}
      </div>
    </div>
  );
}
