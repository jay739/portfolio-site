import React from 'react';
import { getBlogPostMeta, getFeaturedPosts } from '@/lib/blog';
import BlogListingClient from '@/components/BlogListingClient';

export default function BlogPage() {
  const allPosts = getBlogPostMeta();
  const featuredPosts = getFeaturedPosts();

  return <BlogListingClient allPosts={allPosts} featuredPosts={featuredPosts} />;
} 