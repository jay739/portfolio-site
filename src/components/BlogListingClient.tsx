'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import BlogSubscribeForm from '@/components/BlogSubscribeForm';
import { Search, Tag } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import InteractiveSurface from '@/components/ui/InteractiveSurface';

interface BlogListingClientProps {
  allPosts: BlogPostMeta[];
  featuredPosts: BlogPostMeta[];
}

const POSTS_PER_PAGE = 6;

export default function BlogListingClient({ allPosts, featuredPosts }: BlogListingClientProps) {
  const regularPosts = allPosts.filter(post => !post.featured);
  const getCleanTags = (tags: string[]) => tags.filter((tag) => tag && tag.trim().length > 0);
  const allTags = Array.from(new Set(allPosts.flatMap(post => getCleanTags(post.tags))));

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortMode, setSortMode] = useState<'latest' | 'oldest' | 'read-time'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [quickReadOnly, setQuickReadOnly] = useState(false);

  const parseReadTime = (value: string): number => {
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : 0;
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    const shouldIncludeFeatured = Boolean(selectedTag || search.trim());
    let posts = shouldIncludeFeatured ? allPosts : regularPosts;
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
  }, [allPosts, regularPosts, search, selectedTag, quickReadOnly, sortMode]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // Featured post banner (show only the first featured post)
  const featured = featuredPosts[0];
  const featuredTags = featured ? getCleanTags(featured.tags) : [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Knowledge Graph"
        subtitle="Technical notes, tutorials, and engineering insights in a searchable research-style feed."
        chips={['Articles', 'Guides', 'Systems']}
      />

        {/* Featured Post Banner */}
        {featured && (
          <InteractiveSurface className="mb-12 rounded-2xl overflow-hidden neural-card-soft border border-violet-500/30 relative neural-hover-lift">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-4xl font-bold mb-2 text-slate-100">{featured.title}</h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  {featuredTags.slice(0, 3).map(tag => (
                    <button
                      key={tag}
                      className={`neural-pill-intro flex items-center gap-1 text-xs ${selectedTag === tag ? 'is-active ring-2 ring-violet-300/60' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                  {featuredTags.length > 3 && (
                    <span className="neural-pill-intro text-xs">+{featuredTags.length - 3}</span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="neural-statement-chip">{featured.excerpt}</span>
                </div>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="neural-pill-intro text-[11px]">{featured.category}</span>
                  <span className="neural-pill-intro text-[11px]">{featured.readingTime}</span>
                  <span className="neural-pill-intro text-[11px]">{new Date(featured.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <Link href={`/blog/${featured.slug}`} className="inline-flex neural-control-btn-primary font-semibold px-6 py-2 rounded-lg shadow">Read More</Link>
              </div>
            </div>
          </InteractiveSurface>
        )}

        {/* Search and Controls */}
        <div className="mb-8 neural-card-soft rounded-xl border border-slate-600/55 p-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
            <div className="xl:col-span-5">
              <label className="neural-kicker mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, topic, or keyword..."
                  className="neural-input w-full !pl-12 pr-3 py-2.5 text-sm"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="xl:col-span-3">
              <label className="neural-kicker mb-2">Tag</label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedTag ?? ''}
                  onChange={(e) => { setSelectedTag(e.target.value || null); setPage(1); }}
                  className="neural-input !pl-14 py-2 text-sm w-full appearance-none"
                  aria-label="Filter posts by tag"
                >
                  <option value="">All tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <span className="neural-kicker">Sort</span>
                <button
                  type="button"
                  onClick={() => setSortMode('latest')}
                  className={`neural-pill-intro text-[11px] ${sortMode === 'latest' ? 'is-active' : ''}`}
                >
                  Latest
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('oldest')}
                  className={`neural-pill-intro text-[11px] ${sortMode === 'oldest' ? 'is-active' : ''}`}
                >
                  Oldest
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('read-time')}
                  className={`neural-pill-intro text-[11px] ${sortMode === 'read-time' ? 'is-active' : ''}`}
                >
                  Read Time
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <span className="neural-kicker">View</span>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`neural-pill-intro text-[11px] ${viewMode === 'grid' ? 'is-active' : ''}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`neural-pill-intro text-[11px] ${viewMode === 'compact' ? 'is-active' : ''}`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setQuickReadOnly((prev) => !prev)}
                  className={`neural-pill-intro text-[11px] ${quickReadOnly ? 'is-active' : ''}`}
                >
                  {quickReadOnly ? 'Quick Reads: ON' : 'Quick Reads: OFF'}
                </button>
                {(selectedTag || search.trim() || quickReadOnly || sortMode !== 'latest') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag(null);
                      setSearch('');
                      setQuickReadOnly(false);
                      setSortMode('latest');
                      setPage(1);
                    }}
                    className="neural-control-btn-ghost text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 text-sm text-slate-400">
          Showing {filteredPosts.length} posts
          {selectedTag && <span className="ml-2 text-cyan-300">Tag: {selectedTag}</span>}
          {quickReadOnly && <span className="ml-2 text-violet-300">Quick reads only</span>}
        </div>

        {/* All Posts */}
        <div className={`grid gap-6 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {paginatedPosts.length === 0 && (
            <div className="col-span-full text-center text-slate-400 py-12">No posts found.</div>
          )}
          {paginatedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} compact={viewMode === 'compact'} />
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