'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import type { BlogPostMeta } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPostMeta;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: featured ? 0.2 : 0 }}
      className={featured ? 'mb-16' : ''}
    >
      <Link href={`/blog/${post.slug}`}>
        <div className={`bg-white dark:bg-slate-800 rounded-${featured ? '2xl' : 'xl'} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${featured ? '' : 'h-full'}`}>
          <div className={featured ? 'p-8' : 'p-6'}>
            <div className="flex items-center gap-2 mb-4">
              {featured && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
              )}
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
            </div>
            <h2 className={`font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${featured ? 'text-2xl md:text-3xl mb-4' : 'text-xl mb-3 line-clamp-2'}`}>
              {post.title}
            </h2>
            <p className={`text-gray-600 dark:text-gray-300 ${featured ? 'text-lg mb-6 leading-relaxed' : 'text-sm mb-4 line-clamp-3'}`}>
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </div>
              {featured && (
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
} 