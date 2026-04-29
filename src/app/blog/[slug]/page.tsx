import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPostMeta } from '@/lib/blog';
import { getRelatedProjectsForPost, getRelatedSkillsForPost } from '@/lib/blog-relations';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxIconComponents } from '@/components/blog/MdxIcons';
import BlogShareButtons from '@/components/blog/BlogShareButtons';
import BlogReadAloudButton from '@/components/blog/BlogReadAloudButton';
import BlogReadingProgress from '@/components/blog/BlogReadingProgress';
import BlogPostEnhancements from '@/components/blog/BlogPostEnhancements';
import BlogTableOfContents from '@/components/blog/BlogTableOfContents';
import RecentViewTracker from '@/components/ui/RecentViewTracker';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = getBlogPostMeta();
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const similarLengthPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Math.abs(parseInt(a.readingTime, 10) - parseInt(post.readingTime, 10)) - Math.abs(parseInt(b.readingTime, 10) - parseInt(post.readingTime, 10)))
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
  const relatedProjects = getRelatedProjectsForPost(post);
  const relatedSkills = getRelatedSkillsForPost(post);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <div className="w-full">
        <RecentViewTracker
          item={{
            id: `blog:${post.slug}`,
            title: post.title,
            href: `/blog/${post.slug}`,
            kind: 'blog',
            description: post.excerpt,
          }}
        />
        <BlogReadingProgress />
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors neural-pill"
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
                    day: 'numeric',
                    timeZone: 'UTC'
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
              <p className="neural-statement-chip text-base block w-full">{post.excerpt}</p>
            </div>

            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickStats.map((stat) => (
                <div key={stat.label} className="neural-telemetry-card">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-200">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Share and Read Aloud Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-slate-700/70">
              <BlogShareButtons title={post.title} url={`https://jay739.dev/blog/${post.slug}`} />
              <BlogReadAloudButton title={post.title} excerpt={post.excerpt} />
            </div>

            <BlogPostEnhancements slug={post.slug} title={post.title} allPosts={allPosts} />
            <BlogTableOfContents />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="neural-pill-intro text-sm sm:text-base px-3 py-1"
                  >
                    #{tag}
                  </span>
                ))}
                {hiddenTags > 0 && <span className="neural-pill-intro text-sm sm:text-base px-3 py-1">+{hiddenTags}</span>}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg prose-invert max-w-none">
              <Suspense fallback={<div className="text-slate-400 animate-pulse">Loading article…</div>}>
                <MDXRemote source={post.content} components={mdxIconComponents} />
              </Suspense>
            </div>

            {(relatedProjects.length > 0 || relatedSkills.length > 0) && (
              <div className="mt-10 rounded-2xl border border-slate-700/60 bg-slate-950/30 p-5">
                <h2 className="text-xl font-bold text-white">Follow This Topic</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Keep exploring through related builds and skill areas connected to this post.
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {relatedProjects.length > 0 && (
                    <div className="rounded-xl border border-slate-700/60 bg-slate-900/45 p-4">
                      <p className="text-xs uppercase tracking-widest text-amber-300">Related Projects</p>
                      <div className="mt-3 space-y-3">
                        {relatedProjects.map((project) => (
                          <Link key={project.href} href={project.href} className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-amber-400/25 hover:bg-slate-800/60">
                            <p className="text-sm font-semibold text-slate-100">{project.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{project.reason}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {relatedSkills.length > 0 && (
                    <div className="rounded-xl border border-slate-700/60 bg-slate-900/45 p-4">
                      <p className="text-xs uppercase tracking-widest text-amber-300">Related Skills</p>
                      <div className="mt-3 space-y-3">
                        {relatedSkills.map((skill) => (
                          <Link key={skill.href} href={skill.href} className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-amber-400/25 hover:bg-slate-800/60">
                            <p className="text-sm font-semibold text-slate-100">{skill.label}</p>
                            <p className="mt-1 text-xs text-slate-400">{skill.reason}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                    <h3 className="text-base sm:text-lg font-bold text-white mt-2 mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="neural-pill-intro text-[10px]">
                        {relatedPost.readingTime}
                      </span>
                      <span>{new Date(relatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
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

        {similarLengthPosts.length > 0 && (
          <div className="mt-10 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5">
            <h2 className="text-xl font-bold text-white">Continue Reading</h2>
            <p className="mt-2 text-sm text-slate-400">
              These are close to this article’s reading time, so they make a good next step without a big context switch.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {similarLengthPosts.map((nextPost) => (
                <Link key={nextPost.slug} href={`/blog/${nextPost.slug}`} className="rounded-xl border border-slate-700/60 bg-slate-900/45 p-4 transition hover:border-amber-400/25 hover:bg-slate-900/60">
                  <p className="text-sm font-semibold text-slate-100">{nextPost.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{nextPost.readingTime} · {nextPost.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
