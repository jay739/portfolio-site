'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowUpRight, Command, CornerDownLeft, Sparkles } from 'lucide-react';
import { latestSiteUpdateTimestamp } from '@/data/site-updates';
import { getSeenUpdatesTimestamp, pushSiteFeedback } from '@/lib/site-ux';

type NavItem = {
  id: string;
  label: string;
  href: string;
  kind: 'Page' | 'Home Section' | 'Action';
  description: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { id: 'welcome', label: 'Welcome', href: '/#welcome', kind: 'Home Section', description: 'Hero and first impression' },
  { id: 'about', label: 'About', href: '/#about', kind: 'Home Section', description: 'Background, focus, and strengths' },
  { id: 'impact', label: 'Impact', href: '/impact', kind: 'Page', description: 'Measured results and career highlights' },
  { id: 'timeline', label: 'Timeline', href: '/timeline', kind: 'Page', description: 'Career journey and milestones' },
  { id: 'skills', label: 'Skills', href: '/skills', kind: 'Page', description: 'Interactive skills graph and chart' },
  { id: 'projects', label: 'Projects', href: '/projects', kind: 'Page', description: 'Case studies and engineering builds' },
  { id: 'ai-tools', label: 'AI Tools', href: '/ai-tools', kind: 'Page', description: 'Hands-on tools and demos' },
  { id: 'gallery', label: 'Gallery', href: '/gallery', kind: 'Page', description: 'AI image showcase' },
  { id: 'homeserver', label: 'Home Server', href: '/homeserver', kind: 'Page', description: 'Telemetry and infrastructure dashboard' },
  { id: 'ai-news', label: 'AI News', href: '/ai-news', kind: 'Page', description: 'Live AI and tooling updates' },
  { id: 'updates', label: 'What\'s New', href: '/updates', kind: 'Page', description: 'Latest portfolio improvements and new features', badge: 'New' },
  { id: 'paths', label: 'Collections', href: '/paths', kind: 'Page', description: 'Curated visitor paths like AI Engineer and Homelab Builder' },
  { id: 'blog', label: 'Blog', href: '/blog', kind: 'Page', description: 'Articles, tutorials, and notes' },
  { id: 'reading-list', label: 'Reading List', href: '/reading-list', kind: 'Page', description: 'Bookmarks, history, and fresh reads since your last visit' },
  { id: 'contact', label: 'Contact', href: '/contact', kind: 'Page', description: 'Reach out for projects or consulting' },
  { id: 'resume', label: 'Resume', href: '/documents/Jayakrishna_Konda_Resume_FINAL.pdf', kind: 'Action', description: 'Open the PDF resume in a new tab' },
  { id: 'copy-resume', label: 'Copy Resume Link', href: '/documents/Jayakrishna_Konda_Resume_FINAL.pdf', kind: 'Action', description: 'Copy the public resume URL to your clipboard' },
  { id: 'featured-project', label: 'Featured Project', href: '/projects?project=ai-platform-infrastructure-batcave-personal-ml-cloud', kind: 'Action', description: 'Jump straight to the Batcave case study' },
  { id: 'image-preset', label: 'Image Generator Preset', href: '/ai-tools?tool=image-generator&speed=balanced&quality=high&aspect=landscape&style=cinematic&advanced=1', kind: 'Action', description: 'Open the AI image generator with a cinematic preset' },
];

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default function QuickNavPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [updatesBadge, setUpdatesBadge] = useState<string | undefined>('New');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => {
      const seenAt = getSeenUpdatesTimestamp();
      setUpdatesBadge(seenAt >= latestSiteUpdateTimestamp ? undefined : 'Updated');
    };
    sync();
    window.addEventListener('site-ux:updates-seen', sync as EventListener);
    return () => window.removeEventListener('site-ux:updates-seen', sync as EventListener);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (isShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (!open) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    const q = normalize(query);
    const baseItems = navItems
      .map((item) => (item.id === 'updates' ? { ...item, badge: updatesBadge } : item))
      .filter((item) => {
      if (!q) return true;
      return [item.label, item.description, item.kind, item.href].some((value) =>
        normalize(value).includes(q)
      );
      });

    return baseItems.sort((a, b) => {
      const aCurrent = a.href === pathname || (a.href.startsWith('/#') && pathname === '/');
      const bCurrent = b.href === pathname || (b.href.startsWith('/#') && pathname === '/');
      if (aCurrent === bCurrent) return a.label.localeCompare(b.label);
      return aCurrent ? -1 : 1;
    });
  }, [pathname, query, updatesBadge]);

  useEffect(() => {
    if (activeIndex > filteredItems.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, filteredItems]);

  const navigateTo = (item: NavItem) => {
    if (item.id === 'copy-resume') {
      const url = `${window.location.origin}${item.href}`;
      void navigator.clipboard.writeText(url);
      pushSiteFeedback('Resume link copied.', 'success');
      setOpen(false);
      return;
    }

    if (item.id === 'featured-project' || item.id === 'image-preset') {
      router.push(item.href);
      setOpen(false);
      return;
    }

    if (item.kind === 'Action') {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      setOpen(false);
      return;
    }

    if (item.href.startsWith('/#')) {
      const id = item.href.split('#')[1];
      if (pathname === '/') {
        const element = document.getElementById(id);
        if (element) {
          const navbar = document.querySelector('nav');
          const navbarHeight = navbar instanceof HTMLElement ? navbar.offsetHeight : 64;
          const elementTop = element.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;
          window.scrollTo({ top: Math.max(0, elementTop), behavior: 'smooth' });
          setOpen(false);
          return;
        }
      }
    }

    router.push(item.href);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        navigateTo(filteredItems[activeIndex]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, filteredItems, open, pathname, router]);

  if (!mounted) return null;

  const palette = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[450] bg-black/55 backdrop-blur-md p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-[28px] border border-amber-400/25 neural-card shadow-[0_25px_90px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-amber-400/15 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
                  <Search className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <label htmlFor="quick-nav-search" className="sr-only">
                    Search pages
                  </label>
                  <input
                    id="quick-nav-search"
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder="Jump to a page, section, or resume..."
                    className="w-full bg-transparent text-sm sm:text-base text-slate-100 outline-none placeholder:text-slate-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Search the portfolio and use the keyboard hints below to move fast.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="hidden sm:inline-flex rounded-full border border-amber-400/20 px-3 py-1 text-xs text-slate-300 transition hover:border-amber-400/40 hover:text-white"
                >
                  Esc
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700/70 px-4 py-8 text-center text-sm text-slate-400">
                  No matching destinations found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map((item, index) => {
                    const isActive = index === activeIndex;
                    const isCurrentPage = item.href === pathname;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? 'border-amber-400/45 bg-amber-500/10 shadow-[0_10px_30px_rgba(245,158,11,0.08)]'
                            : 'border-transparent bg-slate-900/35 hover:border-amber-400/20 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                            <span className="rounded-full border border-slate-700/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                              {item.kind}
                            </span>
                            {item.badge && (
                              <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-300 inline-flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {item.badge}
                              </span>
                            )}
                            {isCurrentPage && (
                              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-slate-500">
                          {item.kind === 'Action' ? <ArrowUpRight className="h-4 w-4" /> : <CornerDownLeft className="h-4 w-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-400/15 px-4 py-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <kbd className="rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5">↑</kbd>
                <kbd className="rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5">↓</kbd>
                <span>Move</span>
                <kbd className="ml-2 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5">Enter</kbd>
                <span>Open</span>
                <kbd className="ml-2 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5">Esc</kbd>
                <span>Close</span>
                <kbd className="ml-2 rounded border border-slate-700 bg-slate-900/80 px-1.5 py-0.5">Ctrl/Cmd+K</kbd>
                <span>Toggle</span>
              </div>
              <span>{filteredItems.length} result{filteredItems.length === 1 ? '' : 's'} · keyboard shortcuts help</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 z-[220] inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-slate-950/82 px-3 py-2 text-xs text-amber-100 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition hover:border-amber-300/55 hover:text-white sm:bottom-7 sm:left-6"
        aria-label="Open quick navigation"
      >
        <Command className="h-3.5 w-3.5 text-amber-300" />
        <span>Jump</span>
        <span className="hidden rounded border border-amber-400/20 px-1.5 py-0.5 text-[10px] text-slate-300 sm:inline">
          Ctrl/Cmd+K
        </span>
      </button>
      {createPortal(palette, document.body)}
    </>
  );
}
