'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import BlogSubscribeForm from '@/components/BlogSubscribeForm';
import { Search, Tag } from 'lucide-react';
import type { BlogPost } from '@/lib/blog';

interface BlogListingClientProps {
  allPosts: BlogPost[];
  featuredPosts: BlogPost[];
}

const POSTS_PER_PAGE = 6;

export default function BlogListingClient({ allPosts, featuredPosts }: BlogListingClientProps) {
  const regularPosts = allPosts.filter(post => !post.featured);
  const allTags = Array.from(new Set(allPosts.flatMap(post => post.tags)));

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    let posts = regularPosts;
    if (selectedTag) {
      posts = posts.filter(post => post.tags.includes(selectedTag));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return posts;
  }, [regularPosts, search, selectedTag]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  // Featured post banner (show only the first featured post)
  const featured = featuredPosts[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about software development, AI, and technology.
          </p>
        </div>

        {/* Featured Post Banner */}
        {featured && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{featured.title}</h2>
                <div className="flex flex-wrap gap-2 mb-2">
                  {featured.tags.map(tag => (
                    <button
                      key={tag}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 hover:bg-white/40 transition ${selectedTag === tag ? 'ring-2 ring-white' : ''}`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="mb-4 text-lg text-white/90">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="bg-white/20 px-2 py-1 rounded-full">{featured.category}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">{featured.readingTime}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full">{new Date(featured.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <Link href={`/blog/${featured.slug}`} className="inline-block bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-100 transition">Read More</Link>
              </div>
            </div>
          </div>
        )}

        {/* Search and Tag Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 shadow">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTag === null ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'}`}
              onClick={() => { setSelectedTag(null); setPage(1); }}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'}`}
                onClick={() => { setSelectedTag(tag); setPage(1); }}
              >
                <Tag className="w-4 h-4" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* All Posts */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">No posts found.</div>
          )}
          {paginatedPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-2 text-gray-700 dark:text-gray-200">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Get notified when I publish new articles about software development and technology.
          </p>
          <BlogSubscribeForm />
        </div>
      </div>
    </div>
  );
} 