'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';
import InteractiveSurface from '@/components/ui/InteractiveSurface';

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
  compact?: boolean;
}

export default function BlogCard({ post, featured = false, compact = false }: BlogCardProps) {
  const cleanTags = post.tags.filter((tag) => tag && tag.trim().length > 0);
  const previewTags = cleanTags.slice(0, compact ? 1 : 2);
  const hiddenTagCount = Math.max(cleanTags.length - previewTags.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: featured ? 0.2 : 0 }}
      className={featured ? 'mb-16' : ''}
    >
      <Link href={`/blog/${post.slug}`}>
        <InteractiveSurface className={`neural-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group neural-hover-lift ${featured ? '' : 'h-full'}`}>
          <div className={featured ? 'p-8' : compact ? 'p-4' : 'p-6'}>
            <div className="flex items-center gap-2 mb-4">
              {featured && (
                <span className="neural-pill-intro is-active text-xs sm:text-sm">
                  Featured
                </span>
              )}
              <span className="neural-pill-intro text-xs sm:text-sm">
                {post.category}
              </span>
              {cleanTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {previewTags.map((tag) => (
                    <span
                      key={tag}
                      className="neural-pill-intro px-2 py-0.5 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {hiddenTagCount > 0 && (
                    <span className="neural-pill-intro px-2 py-0.5 text-[10px]">
                      +{hiddenTagCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            <h2 className={`font-bold text-slate-100 group-hover:text-violet-300 transition-colors ${featured ? 'text-2xl md:text-3xl mb-4 leading-tight' : compact ? 'text-base sm:text-lg mb-2 line-clamp-2 leading-snug' : 'text-lg sm:text-xl mb-3 line-clamp-2 leading-snug'}`}>
              {post.title}
            </h2>
            <div className={featured ? 'mb-6' : compact ? 'mb-3' : 'mb-4'}>
              <span className={`neural-statement-chip ${featured ? 'text-base' : compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
                {post.excerpt}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </div>
              {featured && (
                <ArrowRight className="w-5 h-5 text-violet-300 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
            {!featured && (
              <div className="mt-3 text-xs font-semibold text-violet-600 dark:text-violet-300">
                Open article →
              </div>
            )}
          </div>
        </InteractiveSurface>
      </Link>
    </motion.div>
  );
} 