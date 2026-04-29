'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bookmark, Link2, Layers3, Mail, Sparkles } from 'lucide-react';
import { BLOG_BOOKMARKS_EVENT, getBlogBookmarks, pushSiteFeedback } from '@/lib/site-ux';

export default function StickyContextBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!pathname.startsWith('/blog/')) return;
    const slug = pathname.split('/').pop() || '';
    const sync = () => setBookmarked(getBlogBookmarks().includes(slug));
    sync();
    window.addEventListener(BLOG_BOOKMARKS_EVENT, sync as EventListener);
    return () => window.removeEventListener(BLOG_BOOKMARKS_EVENT, sync as EventListener);
  }, [pathname]);

  const primaryCta = useMemo(() => {
    if (pathname.startsWith('/blog/')) {
      const slug = pathname.split('/').pop() || '';
      return {
        label: 'Discuss this topic',
        href: `/contact?intent=technical-question&subject=Discussing%20blog%20post&message=Hi%2C%20I%20just%20read%20${encodeURIComponent(slug)}%20and%20wanted%20to%20talk%20through%20it.`,
      };
    }
    if (pathname.startsWith('/projects')) {
      const project = searchParams.get('project');
      return {
        label: 'Request walkthrough',
        href: `/contact?intent=consulting&subject=Project%20walkthrough&message=Hi%2C%20I%27d%20love%20a%20walkthrough%20of%20${encodeURIComponent(project || 'your project work')}.`,
      };
    }
    if (pathname.startsWith('/skills')) {
      return { label: 'See matching projects', href: '/projects' };
    }
    if (pathname.startsWith('/homeserver') || pathname.startsWith('/ai-tools')) {
      return {
        label: 'Ask about architecture',
        href: '/contact?intent=consulting&subject=Architecture%20question',
      };
    }
    return null;
  }, [pathname, searchParams]);

  if (!isVisible || !primaryCta) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[140] w-[calc(100%-0.75rem)] max-w-3xl -translate-x-1/2 px-1.5 sm:bottom-5 sm:px-2">
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-700/70 bg-slate-950/88 px-3 py-3 shadow-2xl backdrop-blur-md sm:flex-wrap sm:justify-center sm:px-4">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
            pushSiteFeedback('Page link copied.', 'success');
          }}
          className="neural-control-btn-ghost inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs"
        >
          <Link2 className="h-3.5 w-3.5" />
          Copy link
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
          className="neural-control-btn-ghost inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs"
        >
          <Layers3 className="h-3.5 w-3.5" />
          Jump
        </button>
        {pathname.startsWith('/blog/') && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-700/60 px-3 py-1 text-xs text-slate-300">
            <Bookmark className="h-3.5 w-3.5 text-amber-300" />
            {bookmarked ? 'Bookmarked' : 'Use the bookmark toggle above'}
          </span>
        )}
        <Link href={primaryCta.href} className="neural-control-btn-primary inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs">
          <Mail className="h-3.5 w-3.5" />
          {primaryCta.label}
        </Link>
        <Link href="/paths" className="neural-control-btn inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          Collections
        </Link>
      </div>
    </div>
  );
}
