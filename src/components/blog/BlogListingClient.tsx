'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import BlogSubscribeForm from '@/components/blog/BlogSubscribeForm';
import { Search, Tag } from 'lucide-react';
import { FaBolt, FaTimes } from 'react-icons/fa';
import type { BlogPostMeta } from '@/lib/blog';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import InteractiveSurface from '@/components/ui/InteractiveSurface';
import GuidedEmptyState from '@/components/ui/GuidedEmptyState';
import RecentViewTracker from '@/components/ui/RecentViewTracker';

interface BlogListingClientProps {
  allPosts: BlogPostMeta[];
  featuredPosts: BlogPostMeta[];
}

const POSTS_PER_PAGE = 6;

export default function BlogListingClient({ allPosts, featuredPosts }: BlogListingClientProps) {
  const getCleanTags = (tags: string[]) => tags.filter((tag) => tag && tag.trim().length > 0);
  const allTags = Array.from(new Set(allPosts.flatMap(post => getCleanTags(post.tags))));

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1') || 1);
  const [sortMode, setSortMode] = useState<'latest' | 'oldest' | 'read-time'>(
    (searchParams.get('sort') as 'latest' | 'oldest' | 'read-time') ?? 'latest'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>(
    (searchParams.get('view') as 'grid' | 'compact') ?? 'grid'
  );
  const [quickReadOnly, setQuickReadOnly] = useState(searchParams.get('quick') === '1');

  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
    setSelectedTag(searchParams.get('tag'));
    setPage(Math.max(1, Number(searchParams.get('page') ?? '1') || 1));
    setSortMode((searchParams.get('sort') as 'latest' | 'oldest' | 'read-time') ?? 'latest');
    setViewMode((searchParams.get('view') as 'grid' | 'compact') ?? 'grid');
    setQuickReadOnly(searchParams.get('quick') === '1');
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (selectedTag) params.set('tag', selectedTag);
    if (sortMode !== 'latest') params.set('sort', sortMode);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (quickReadOnly) params.set('quick', '1');
    if (page > 1) params.set('page', String(page));

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, search, selectedTag, sortMode, viewMode, quickReadOnly, page]);

  const parseReadTime = (value: string): number => {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    if (selectedTag) {
      posts = posts.filter(post => getCleanTags(post.tags).includes(selectedTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        getCleanTags(post.tags).some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (quickReadOnly) {
      posts = posts.filter((post) => parseReadTime(post.readingTime) <= 6);
    }
    posts = [...posts].sort((a, b) => {
      if (sortMode === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortMode === 'read-time') return parseReadTime(a.readingTime) - parseReadTime(b.readingTime);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return posts;
  }, [allPosts, search, selectedTag, quickReadOnly, sortMode]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  useEffect(() => {
    if (page > Math.max(totalPages, 1)) {
      setPage(Math.max(totalPages, 1));
    }
  }, [page, totalPages]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <RecentViewTracker item={{ id: 'page:blog', title: 'Knowledge Graph', href: '/blog', kind: 'page', description: 'Technical writing, guides, and research notes' }} />
      <NeuralPageIntro
        title="Knowledge Graph"
        subtitle="Technical notes, tutorials, and engineering insights in a searchable research-style feed."
        chips={['Articles', 'Guides', 'Systems']}
        theme="blog"
      />

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(8,14,32,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 pl-7 py-1"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="w-px h-4 bg-indigo-900/60 mx-2" />

          {/* Tag */}
          <div className="relative flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-600" />
            <select
              value={selectedTag ?? ''}
              onChange={(e) => { setSelectedTag(e.target.value || null); setPage(1); }}
              className="bg-transparent border-none outline-none text-sm cursor-pointer appearance-none"
              style={{ color: selectedTag ? '#a78bfa' : '#64748b' }}
              aria-label="Filter by tag"
            >
              <option value="" style={{ background: '#080e20', color: '#94a3b8' }}>All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} style={{ background: '#080e20', color: '#94a3b8' }}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-indigo-900/60 mx-2" />

          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => { setSortMode(e.target.value as 'latest' | 'oldest' | 'read-time'); setPage(1); }}
            className="bg-transparent border-none outline-none text-sm cursor-pointer appearance-none"
            style={{ color: sortMode !== 'latest' ? '#a78bfa' : '#64748b' }}
            aria-label="Sort posts"
          >
            <option value="latest" style={{ background: '#080e20', color: '#94a3b8' }}>Latest</option>
            <option value="oldest" style={{ background: '#080e20', color: '#94a3b8' }}>Oldest</option>
            <option value="read-time" style={{ background: '#080e20', color: '#94a3b8' }}>Read time</option>
          </select>

          <div className="w-px h-4 bg-indigo-900/60 mx-2" />

          {/* View */}
          <div className="flex items-center gap-3 text-xs">
            <button type="button" onClick={() => setViewMode('grid')} className={`transition-colors ${viewMode === 'grid' ? 'text-amber-300' : 'text-slate-600 hover:text-slate-400'}`}>Grid</button>
            <button type="button" onClick={() => setViewMode('compact')} className={`transition-colors ${viewMode === 'compact' ? 'text-amber-300' : 'text-slate-600 hover:text-slate-400'}`}>Compact</button>
          </div>

          <div className="w-px h-4 bg-indigo-900/60 mx-2" />

          {/* Quick Reads */}
          <button
            type="button"
            onClick={() => setQuickReadOnly((prev) => !prev)}
            title="Show only articles under 6 minutes"
            className={`text-xs transition-colors ${quickReadOnly ? 'text-amber-300' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <FaBolt className="inline text-amber-400 mr-1" /> Quick reads
          </button>

          {/* Clear */}
          {(selectedTag || search.trim() || quickReadOnly || sortMode !== 'latest') && (
            <>
              <div className="w-px h-4 bg-indigo-900/60 mx-2" />
              <button
                type="button"
                onClick={() => { setSelectedTag(null); setSearch(''); setQuickReadOnly(false); setSortMode('latest'); setPage(1); }}
                className="text-xs text-slate-600 hover:text-slate-300 transition-colors"
              >
                <FaTimes className="inline text-amber-400 mr-1" /> Clear
              </button>
            </>
          )}

          {/* Counter */}
          <span className="ml-auto text-xs text-slate-600">
            {Math.min(page * POSTS_PER_PAGE, filteredPosts.length)}/{filteredPosts.length}
            {selectedTag && <span className="ml-1 text-orange-700">· {selectedTag}</span>}
            {quickReadOnly && <span className="ml-1 text-amber-700">· <FaBolt className="inline text-amber-400" /></span>}
          </span>
        </div>

        {/* All Posts */}
        <div className={`grid gap-6 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {paginatedPosts.length === 0 && (
            <div className="col-span-full">
              <GuidedEmptyState
                title="No posts match this view"
                description="Try a broader search, remove a tag filter, or switch off Quick Reads to bring longer articles back in."
                primaryLabel="Open reading list"
                primaryHref="/reading-list"
                secondaryLabel="Clear filters"
                onSecondaryClick={() => { setSelectedTag(null); setSearch(''); setQuickReadOnly(false); setSortMode('latest'); setPage(1); }}
              />
            </div>
          )}
          {paginatedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} featured={post.featured} compact={viewMode === 'compact'} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              className="neural-control-btn-ghost px-3 py-1 font-semibold disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-2 text-slate-300">Page {page} of {totalPages}</span>
            <button
              className="neural-control-btn-ghost px-3 py-1 font-semibold disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
      <InteractiveSurface className="mt-20 neural-card neural-glow-border rounded-2xl p-8 text-center neural-hover-lift">
        <h3 className="text-2xl font-bold mb-4 text-slate-100">Stay Updated</h3>
        <p className="text-slate-300 mb-6 max-w-md mx-auto">
          Get notified when I publish new articles about software development and technology.
        </p>
        <BlogSubscribeForm />
      </InteractiveSurface>
    </div>
  );
} 
