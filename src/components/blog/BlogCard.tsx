'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';
import InteractiveSurface from '@/components/ui/InteractiveSurface';

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
  compact?: boolean;
}

export default function BlogCard({ post, featured = false, compact = false }: BlogCardProps) {
  const router = useRouter();
  const cleanTags = post.tags.filter((tag) => tag && tag.trim().length > 0);
  const previewTags = cleanTags.slice(0, compact ? 1 : 2);
  const hiddenTagCount = Math.max(cleanTags.length - previewTags.length, 0);

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: featured ? 0.2 : 0 }}
      className={`h-full${featured ? ' mb-16' : ''}`}
    >
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <InteractiveSurface className={`neural-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group neural-hover-lift h-full`}>
          <div className={`flex flex-col h-full ${compact ? 'p-4' : 'p-6'}`}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {featured && (
                <span className="neural-pill-intro is-active text-xs">
                  Featured
                </span>
              )}
              <span className="neural-pill-intro text-xs">
                {post.category}
              </span>
              {cleanTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium cursor-pointer text-amber-300 border-amber-500/35 bg-amber-500/10 hover:border-amber-400/60 hover:text-amber-200 hover:bg-amber-500/16 transition-colors duration-150"
                      onClick={(e) => handleTagClick(e, tag)}
                    >
                      {tag}
                    </span>
                  ))}
                  {hiddenTagCount > 0 && (
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-amber-400/70 border-amber-500/25 bg-amber-500/8">
                      +{hiddenTagCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            <h2 className={`font-bold text-slate-100 group-hover:text-amber-300 transition-colors ${compact ? 'text-base sm:text-lg mb-2 line-clamp-2 leading-snug' : 'text-lg sm:text-xl mb-3 line-clamp-2 leading-snug'}`}>
              {post.title}
            </h2>
            <div className={compact ? 'mb-3' : 'mb-4'}>
              <span className={`neural-statement-chip ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
                {post.excerpt}
              </span>
            </div>
            <div className="mt-auto flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </div>
            </div>
            <div className="mt-3 text-xs font-semibold text-orange-700 dark:text-amber-300">
              Open article →
            </div>
          </div>
        </InteractiveSurface>
      </Link>
    </motion.div>
  );
} 
