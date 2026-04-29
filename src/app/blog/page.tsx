import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { getBlogPostMeta, getFeaturedPosts } from '@/lib/blog';
import BlogListingClient from '@/components/blog/BlogListingClient';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

export default function BlogPage() {
  const allPosts = getBlogPostMeta();
  const featuredPosts = getFeaturedPosts();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <BlogListingClient allPosts={allPosts} featuredPosts={featuredPosts} />
      </Suspense>
      <RouteNextSteps
        items={[
          { href: '/reading-list', label: 'Open your reading list', note: 'Jump back into saved or recently opened posts.' },
          { href: '/projects', label: 'See the systems behind the writing', note: 'Move from notes into case studies.' },
          { href: '/contact?intent=technical-question', label: 'Discuss a topic', note: 'Open a technical conversation about what you just read.' },
        ]}
      />
    </main>
  );
} 
