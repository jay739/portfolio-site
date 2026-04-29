'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImages, FaPlay, FaPause, FaTimes } from 'react-icons/fa';
import FilterChip from '@/components/ui/FilterChip';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import OnboardingHint from '@/components/ui/OnboardingHint';
import { pushSiteFeedback, recordRecentView } from '@/lib/site-ux';
import GuidedEmptyState from '@/components/ui/GuidedEmptyState';

interface GalleryItem {
  id: string;
  filename: string;
  prompt: string;
  style: string;
  speedMode: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  createdAt: string;
}

interface GalleryCarouselProps {
  initialItems?: GalleryItem[];
}

type Orientation = 'all' | 'square' | 'portrait' | 'landscape';

function getOrientation(item: GalleryItem): Exclude<Orientation, 'all'> {
  if (item.width === item.height) return 'square';
  return item.width > item.height ? 'landscape' : 'portrait';
}

export default function GalleryCarousel({ initialItems = [] }: GalleryCarouselProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [lightboxId, setLightboxId] = useState<string | null>(searchParams.get('image'));
  const scrollRef = useRef<HTMLDivElement>(null);

  useScrollLock(!!lightboxId);
  useEscapeKey(() => setLightboxId(null), !!lightboxId);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(searchParams.get('style') ?? 'all');
  const [selectedModel, setSelectedModel] = useState<string>(searchParams.get('model') ?? 'all');
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>(
    (searchParams.get('orientation') as Orientation) ?? 'all'
  );
  const [compareIds, setCompareIds] = useState<string[]>(
    (searchParams.get('compare') ?? '').split(',').map((entry) => entry.trim()).filter(Boolean).slice(0, 2)
  );

  const fetchGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Gallery fetch failed: ${res.status}`);
      }
      const data = await res.json();
      setItems(data.images || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    const handler = () => fetchGallery();
    window.addEventListener('gallery:refresh', handler);
    return () => window.removeEventListener('gallery:refresh', handler);
  }, [fetchGallery]);

  useEffect(() => {
    setSelectedStyle(searchParams.get('style') ?? 'all');
    setSelectedModel(searchParams.get('model') ?? 'all');
    setSelectedOrientation((searchParams.get('orientation') as Orientation) ?? 'all');
    setLightboxId(searchParams.get('image'));
    setCompareIds((searchParams.get('compare') ?? '').split(',').map((entry) => entry.trim()).filter(Boolean).slice(0, 2));
  }, [searchParams]);

  const styles = useMemo(
    () => ['all', ...Array.from(new Set(items.map((item) => item.style).filter((style) => style && style !== 'none'))).sort()],
    [items]
  );

  const models = useMemo(
    () => ['all', ...Array.from(new Set(items.map((item) => (item.model ?? '').replace('.safetensors', '')))).sort()],
    [items]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle;
        const cleanModel = (item.model ?? '').replace('.safetensors', '');
        const matchesModel = selectedModel === 'all' || cleanModel === selectedModel;
        const matchesOrientation = selectedOrientation === 'all' || getOrientation(item) === selectedOrientation;
        return matchesStyle && matchesModel && matchesOrientation;
      }),
    [items, selectedModel, selectedOrientation, selectedStyle]
  );

  const activeItems = filteredItems.length > 0 ? filteredItems : items;
  const lightbox = activeItems.find((item) => item.id === lightboxId) ?? items.find((item) => item.id === lightboxId) ?? null;
  const lightboxIndex = lightbox ? activeItems.findIndex((item) => item.id === lightbox.id) : -1;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedStyle !== 'all') {
      params.set('style', selectedStyle);
    } else {
      params.delete('style');
    }

    if (selectedModel !== 'all') {
      params.set('model', selectedModel);
    } else {
      params.delete('model');
    }

    if (selectedOrientation !== 'all') {
      params.set('orientation', selectedOrientation);
    } else {
      params.delete('orientation');
    }

    if (lightboxId) {
      params.set('image', lightboxId);
    } else {
      params.delete('image');
    }

    if (compareIds.length > 0) {
      params.set('compare', compareIds.join(','));
    } else {
      params.delete('compare');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareIds, lightboxId, pathname, selectedModel, selectedOrientation, selectedStyle]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        ro.disconnect();
      };
    }
  }, [items, checkScroll]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 320;
    el.scrollBy({ left: dir === 'right' ? cardWidth : -cardWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (paused || items.length <= 3) return;
    autoPlayRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, 4000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [paused, filteredItems.length, scroll]);

  const openLightbox = (item: GalleryItem) => {
    recordRecentView({
      id: `gallery:${item.id}`,
      title: item.prompt.slice(0, 48),
      href: `/gallery?image=${item.id}`,
      kind: 'gallery',
      description: `${item.style} · ${(item.model ?? '').replace('.safetensors', '')}`,
    });
    setLightboxId(item.id);
  };

  const toggleCompare = (itemId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(itemId)) {
        pushSiteFeedback('Removed image from compare tray.', 'info');
        return prev.filter((entry) => entry !== itemId);
      }
      pushSiteFeedback(prev.length === 1 ? 'Compare tray ready with two images.' : 'Added image to compare tray.', 'success');
      return [...prev, itemId].slice(-2);
    });
  };

  const compareItems = compareIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as GalleryItem[];

  const moveLightbox = useCallback((direction: 'prev' | 'next') => {
    if (!lightbox || activeItems.length <= 1) return;
    const nextIndex =
      direction === 'next'
        ? (lightboxIndex + 1) % activeItems.length
        : (lightboxIndex - 1 + activeItems.length) % activeItems.length;
    setLightboxId(activeItems[nextIndex].id);
  }, [activeItems, lightbox, lightboxIndex]);

  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveLightbox('next');
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveLightbox('prev');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, moveLightbox]);

  if (loading) {
    return (
      <section className="relative py-12 px-2 sm:px-6 w-full">
        <div className="w-full neural-card neural-glow-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse" />
          </div>
          <div className="flex gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-72 h-72 shrink-0 rounded-xl bg-slate-700/30 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="relative py-12 px-2 sm:px-6 w-full">
        <div className="w-full neural-card neural-glow-border p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <FaImages className="text-amber-400" />
            <h2 className="neural-section-title mb-0">AI Gallery</h2>
          </div>
          <p className="neural-section-copy max-w-3xl">
            Gallery items are not loading right now. If images exist on disk, this usually means the runtime fetch failed or returned an empty manifest.
          </p>
          <button type="button" onClick={() => void fetchGallery()} className="mt-4 neural-control-btn text-sm">
            Retry gallery load
          </button>
        </div>
      </section>
    );
  }

  const section = (
    <section className="relative py-12 px-2 sm:px-6 w-full">
      <div className="w-full neural-card neural-glow-border p-4 sm:p-8">
        <OnboardingHint
          storageKey="gallery_compare_hint_v1"
          title="Gallery compare mode"
          body="Use Compare on any two images to inspect prompts, styles, and output differences side by side."
        />
        <div className="flex items-center justify-between mb-2">
          <h2 className="neural-section-title mb-0 flex items-center gap-2"><FaImages className="text-amber-400" /> AI Gallery</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="text-xs text-slate-400 hover:text-slate-200 transition"
              aria-label={paused ? 'Play carousel' : 'Pause carousel'}
            >
              {paused ? <><FaPlay className="inline text-amber-400 mr-1" />Play</> : <><FaPause className="inline text-amber-400 mr-1" />Pause</>}
            </button>
            <span className="text-xs text-slate-500">{items.length} images</span>
          </div>
        </div>
        <p className="neural-section-copy max-w-3xl mb-6">
          Generated with Stable Diffusion on self-hosted Apple M4 Metal GPU — each image crafted via the AI Image Generator above.
        </p>

        <div className="mb-6 grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/30 p-4">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">Style</p>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <FilterChip
                  key={style}
                  active={selectedStyle === style}
                  onClick={() => setSelectedStyle(style)}
                  className="text-xs"
                >
                  {style === 'all' ? 'All styles' : style}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">Model</p>
            <div className="flex flex-wrap gap-2">
              {models.map((model) => (
                <FilterChip
                  key={model}
                  active={selectedModel === model}
                  onClick={() => setSelectedModel(model)}
                  className="text-xs"
                >
                  {model === 'all' ? 'All models' : model}
                </FilterChip>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-widest text-slate-500">Orientation</p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'square', 'portrait', 'landscape'] as Orientation[]).map((orientation) => (
                  <FilterChip
                    key={orientation}
                    active={selectedOrientation === orientation}
                    onClick={() => setSelectedOrientation(orientation)}
                    className="text-xs capitalize"
                  >
                    {orientation === 'all' ? 'All ratios' : orientation}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-400">
                Showing {filteredItems.length} of {items.length} images
              </div>
              {(selectedStyle !== 'all' || selectedModel !== 'all' || selectedOrientation !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStyle('all');
                    setSelectedModel('all');
                    setSelectedOrientation('all');
                  }}
                  className="neural-control-btn-ghost text-[11px]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {compareItems.length > 0 && (
          <div className={`mb-6 grid gap-4 ${compareItems.length > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            {compareItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-amber-300">{item.style === 'none' ? 'No style' : item.style}</p>
                    <p className="mt-1 text-xs text-slate-400">{(item.model ?? '').replace('.safetensors', '')} · {item.width}×{item.height}</p>
                  </div>
                  <button type="button" onClick={() => toggleCompare(item.id)} className="neural-control-btn-ghost text-[11px]">
                    Remove
                  </button>
                </div>
                <img src={`/api/gallery/image/${item.filename}`} alt={item.prompt} className="mt-4 h-64 w-full rounded-xl object-cover" />
                <p className="mt-3 text-xs text-slate-300">{item.prompt}</p>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/80 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-700 transition opacity-0 group-hover:opacity-100 -ml-2"
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-slate-900/80 border border-slate-600 text-white flex items-center justify-center hover:bg-slate-700 transition opacity-0 group-hover:opacity-100 -mr-2"
              aria-label="Scroll right"
            >
              ›
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="shrink-0 w-72 group/card"
              >
                <button
                  type="button"
                  onClick={() => openLightbox(item)}
                  className="block w-full rounded-xl border border-slate-600/50 overflow-hidden bg-slate-800/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 text-left"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={`/api/gallery/image/${item.filename}`}
                      alt={item.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-1 flex-wrap">
                        {item.style !== 'none' && (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/30 text-[10px] text-amber-200 backdrop-blur-sm">
                            {item.style}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-[10px] text-blue-200 backdrop-blur-sm">
                          {item.speedMode}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/30 text-[10px] text-slate-200 backdrop-blur-sm">
                          {item.width}×{item.height}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {item.prompt}
                    </p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleCompare(item.id);
                      }}
                      className={`mt-2 rounded-full border px-2 py-1 text-[10px] transition ${compareIds.includes(item.id) ? 'border-amber-400/60 bg-amber-500/15 text-amber-200' : 'border-slate-600/60 text-slate-400 hover:border-amber-400/35 hover:text-amber-200'}`}
                    >
                      {compareIds.includes(item.id) ? 'Compared' : 'Compare'}
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div className="mt-6">
            <GuidedEmptyState
              title="No gallery images match this filter set"
              description="Try clearing one filter at a time, or jump into the AI Tools Lab to generate a fresh image with a different style or model."
              primaryLabel="Open AI tools"
              primaryHref="/ai-tools?tool=image-generator"
              secondaryLabel="Clear filters"
              onSecondaryClick={() => {
                setSelectedStyle('all');
                setSelectedModel('all');
                setSelectedOrientation('all');
              }}
            />
          </div>
        )}
      </div>

    </section>
  );

  const lightboxPortal = typeof document !== 'undefined' ? (
    <AnimatePresence>
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxId(null)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxId(null); }}
            className="absolute top-4 right-4 text-white text-3xl hover:text-amber-300 transition-colors z-10"
            aria-label="Close (Esc)"
          >
            <FaTimes />
          </button>
          {activeItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveLightbox('prev'); }}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-950/75 text-white transition hover:border-amber-400/45 hover:text-amber-200"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); moveLightbox('next'); }}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-600 bg-slate-950/75 text-white transition hover:border-amber-400/45 hover:text-amber-200"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          <div className="flex flex-col items-center gap-4 max-w-4xl cursor-zoom-out">
            <img
              src={`/api/gallery/image/${lightbox.filename}`}
              alt={lightbox.prompt}
              className="max-w-[90vw] max-h-[75vh] rounded-lg shadow-2xl"
            />
            <div className="text-center max-w-lg">
              <p className="text-sm text-slate-200 mb-2">{lightbox.prompt}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {lightbox.style !== 'none' && (
                  <span className="px-2 py-1 rounded-full bg-amber-500/20 text-xs text-amber-300">{lightbox.style}</span>
                )}
                <span className="px-2 py-1 rounded-full bg-slate-500/20 text-xs text-slate-300">
                  {lightbox.width}×{lightbox.height}
                </span>
                <span className="px-2 py-1 rounded-full bg-slate-500/20 text-xs text-slate-300">seed {lightbox.seed}</span>
                <span className="px-2 py-1 rounded-full bg-slate-500/20 text-xs text-slate-300">
                  {(lightbox.model ?? '').replace('.safetensors', '')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Press <kbd className="bg-slate-700 px-1 rounded">Esc</kbd> to close and <kbd className="bg-slate-700 px-1 rounded">←</kbd>/<kbd className="bg-slate-700 px-1 rounded">→</kbd> to browse
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <>
      {section}
      {lightboxPortal && createPortal(lightboxPortal, document.body)}
    </>
  );
}
