import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPostMeta } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import BlogShareButtons from '@/components/BlogShareButtons';
import BlogReadAloudButton from '@/components/BlogReadAloudButton';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import BlogReadingProgress from '@/components/BlogReadingProgress';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getBlogPostMeta();
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const quickStats = [
    { label: 'Words', value: wordCount.toLocaleString() },
    { label: 'Read Time', value: post.readingTime },
    { label: 'Category', value: post.category },
  ];
  const cleanTags = post.tags.filter((tag) => tag && tag.trim().length > 0);
  const visibleTags = cleanTags.slice(0, 6);
  const hiddenTags = Math.max(cleanTags.length - visibleTags.length, 0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <div className="w-full max-w-4xl">
        <BlogReadingProgress />
        <NeuralPageIntro
          title="Article View"
          subtitle="Read in a focused research-style layout with metadata, sharing controls, and related explorations."
          chips={['Longform', 'Share', 'Read Aloud']}
        />
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-violet-300 hover:text-violet-200 transition-colors neural-pill"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="neural-card neural-glow-border rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Category and Date */}
            <div className="flex items-center gap-4 mb-6">
              <span className="neural-pill-intro text-sm">
                {post.category}
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="neural-pill-intro text-[11px] flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="neural-pill-intro text-[11px] flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <div className="mb-8">
              <span className="neural-statement-chip text-base">{post.excerpt}</span>
            </div>

            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="neural-telemetry-card">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold text-cyan-200">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Share and Read Aloud Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <BlogShareButtons title={post.title} url={`https://jay739.dev/blog/${post.slug}`} />
              <BlogReadAloudButton title={post.title} excerpt={post.excerpt} />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="neural-pill-intro text-xs sm:text-sm"
                  >
                    #{tag}
                  </span>
                ))}
                {hiddenTags > 0 && <span className="neural-pill-intro text-xs sm:text-sm">+{hiddenTags}</span>}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <MDXRemote source={post.content} />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">
              Related Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <div className="neural-card-soft rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group neural-hover-lift">
                    <span className="neural-pill-intro text-[11px]">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-2 mb-2 group-hover:text-violet-300 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="neural-pill-intro text-[10px]">
                        {relatedPost.readingTime}
                      </span>
                      <span>{new Date(relatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="neural-statement-chip text-xs sm:text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </span>
                    {relatedPost.tags?.filter((tag) => tag && tag.trim().length > 0).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {relatedPost.tags
                          .filter((tag) => tag && tag.trim().length > 0)
                          .slice(0, 2)
                          .map((tag) => (
                            <span key={tag} className="neural-pill-intro px-2 py-0.5 text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        {relatedPost.tags.filter((tag) => tag && tag.trim().length > 0).length > 2 && (
                          <span className="neural-pill-intro px-2 py-0.5 text-[10px]">
                            +{relatedPost.tags.filter((tag) => tag && tag.trim().length > 0).length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 