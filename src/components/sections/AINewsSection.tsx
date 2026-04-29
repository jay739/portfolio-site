'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DynamicIcon } from '@/lib/icons';
import { motion, AnimatePresence } from 'framer-motion';
import GuidedEmptyState from '@/components/ui/GuidedEmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  image: string | null;
  publishedAt: string | null;
  source: string | null;
}

type Category = 'All' | 'Research' | 'Models' | 'Tools' | 'Industry';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TAG_MAP: [RegExp, string][] = [
  [/openai|chatgpt|gpt-?[0-9]/i,               'OpenAI'],
  [/anthropic|claude/i,                         'Anthropic'],
  [/google|gemini|deepmind|bard/i,              'Google'],
  [/meta(?!\w)|llama/i,                         'Meta'],
  [/mistral/i,                                  'Mistral'],
  [/hugging\s?face/i,                           'HuggingFace'],
  [/\brag\b|retrieval.augmented/i,              'RAG'],
  [/\bllm\b|large language model/i,             'LLM'],
  [/\bagent(s)?\b|agentic/i,                    'Agents'],
  [/multimodal|vision|image gen|diffusion/i,    'Multimodal'],
  [/open.source/i,                              'Open Source'],
  [/benchmark|eval|leaderboard/i,               'Benchmarks'],
];

function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${summary}`;
  return TAG_MAP
    .filter(([rx]) => rx.test(text))
    .map(([, label]) => label)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);
}

const CATEGORY_PATTERNS: Record<Exclude<Category, 'All'>, RegExp> = {
  Research:  /paper|arxiv|research|study|benchmark|dataset|training|architecture|survey/i,
  Models:    /GPT|Claude|Gemini|LLaMA|Mistral|model release|version \d|launch|announce/i,
  Tools:     /API|SDK|library|framework|plugin|integration|open.source|open source|tool|release/i,
  Industry:  /startup|funding|partnership|acquisition|investment|valuation|billion|deal|raises/i,
};

function matchesCategory(item: NewsItem, category: Category): boolean {
  if (category === 'All') return true;
  const text = `${item.title} ${item.summary}`;
  return CATEGORY_PATTERNS[category].test(text);
}

// Deterministic gradient per source so the same outlet always gets the same colour
const PLACEHOLDER_GRADIENTS = [
  'from-amber-950 to-orange-900',
  'from-orange-950 to-amber-900',
  'from-stone-950 to-orange-950',
  'from-amber-950 to-orange-900',
  'from-orange-950 to-yellow-900',
  'from-neutral-950 to-amber-950',
];

function sourceGradient(source: string | null): string {
  if (!source) return PLACEHOLDER_GRADIENTS[0];
  const hash = source.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

function articleDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const h  = Math.floor(ms / 3_600_000);
  if (h < 1)  return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

function isNew(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 6 * 3_600_000;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="neural-card-soft rounded-xl overflow-hidden animate-pulse flex gap-4 p-4">
      <div className="hidden sm:block w-32 h-24 bg-slate-700/50 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-slate-700/50 rounded w-3/4" />
        <div className="h-3 bg-slate-700/50 rounded w-full" />
        <div className="h-3 bg-slate-700/50 rounded w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-slate-700/50 rounded-full" />
          <div className="h-5 w-12 bg-slate-700/50 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/12 text-amber-200 border border-amber-500/20">
      {label}
    </span>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: Category;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3 py-1 text-xs rounded-full font-medium transition-all border ${
        active
          ? 'bg-amber-600 border-amber-500 text-white'
          : 'border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function ImagePlaceholder({ source, url }: { source: string | null; url: string }) {
  const domain   = articleDomain(url);
  const gradient = sourceGradient(source);
  const initial  = (source ?? domain).charAt(0).toUpperCase();
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2`}>
      <span className="text-lg font-bold text-white/20 leading-none">{initial}</span>
      {domain && <span className="text-[10px] text-white/45 uppercase tracking-[0.2em]">{domain.split('.')[0]}</span>}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem & { tags: string[] } }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && !imgError;

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block neural-card-soft rounded-xl overflow-hidden border border-transparent hover:border-amber-500/30 transition-all"
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex gap-0 sm:gap-4">
        {/* Image slot — always rendered on sm+, shows placeholder when no image */}
        <div className="hidden sm:block relative flex-shrink-0 w-36 min-h-[120px] overflow-hidden rounded-l-xl">
          {hasImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/image-proxy?url=${encodeURIComponent(item.image!)}`}
                alt=""
                onError={() => setImgError(true)}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ minHeight: '120px' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/60" />
            </>
          ) : (
            <ImagePlaceholder source={item.source} url={item.url} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Top row: source + date + new badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {item.source && (
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
                {item.source}
              </span>
            )}
            {item.publishedAt && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-500">{relativeTime(item.publishedAt)}</span>
                {isNew(item.publishedAt) && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    NEW
                  </span>
                )}
              </>
            )}
          </div>

          {/* Title */}
          <h4 className="font-semibold text-sm sm:text-base text-slate-100 mb-1.5 leading-snug group-hover:text-amber-200 transition-colors line-clamp-2">
            {item.title}
          </h4>

          {/* Summary */}
          {item.summary && (
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">
              {item.summary}
            </p>
          )}

          {/* Tags + Read more */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <TagPill key={tag} label={tag} />
              ))}
            </div>
            <div className="flex items-center text-xs text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
              <span>Read more</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['All', 'Research', 'Models', 'Tools', 'Industry'];

export default function AINewsSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [news, setNews]           = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [query, setQuery]         = useState(searchParams.get('q') ?? '');
  const [category, setCategory]   = useState<Category>((searchParams.get('category') as Category) ?? 'All');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchNews() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/ai-news?t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setNews(data.articles || []);
      setLastUpdated(new Date());
    } catch {
      setError('Could not load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setCategory((searchParams.get('category') as Category) ?? 'All');
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    if (category !== 'All') {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, pathname, query]);

  // Enrich with tags, then filter
  const enriched = news.map((item) => ({
    ...item,
    tags: extractTags(item.title, item.summary),
  }));

  const filtered = enriched.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchesQuery && matchesCategory(item, category);
  });

  return (
    <section className="w-full mt-0 mb-16 rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-indigo-950/25 via-slate-950/85 to-slate-950/90 p-4 sm:p-8 neural-card neural-glow-border" id="ai-news">
      {/* Header */}
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DynamicIcon name="openai" className="text-2xl text-amber-400" />
          <h2 className="neural-section-title">AI & Tech News</h2>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-slate-500">
              Updated {relativeTime(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/50 transition-all disabled:opacity-40"
            aria-label="Refresh"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <p className="neural-section-copy mb-5">
        High-signal updates on models, research, and tooling — refreshed every 5 minutes.
      </p>

      {/* Filter row */}
      <div className="mb-6 flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by topic, model, or company..."
          className="neural-input flex-1 max-w-sm"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap">
          {CATEGORIES.map((cat) => (
            <CategoryTab
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
          {(query.trim() || category !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
              className="px-3 py-1 text-xs rounded-full font-medium transition-all border border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <GuidedEmptyState
          title="News feed unavailable right now"
          description={error}
          primaryHref="/updates"
          primaryLabel="Open What's New"
          secondaryLabel="Retry now"
          onSecondaryClick={() => void fetchNews()}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${query}`}
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.length > 0 ? (
              filtered.map((item, idx) => <NewsCard key={idx} item={item} />)
            ) : (
              <GuidedEmptyState
                title="No articles match this filter"
                description="Try a broader keyword or switch back to All to widen the signal stream."
                secondaryLabel="Clear filters"
                onSecondaryClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Footer count */}
      {!loading && !error && filtered.length > 0 && (
        <p className="text-xs text-slate-600 text-right mt-4">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
          {category !== 'All' || query ? ` · filtered from ${news.length}` : ''}
        </p>
      )}
    </section>
  );
}
