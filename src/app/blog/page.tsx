import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBlogPostMeta, getFeaturedPosts } from "@/lib/blog";
import BlogListingClient from "@/components/blog/BlogListingClient";
import RouteNextSteps from "@/components/layout/RouteNextSteps";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Technical writing on software engineering, AI/ML systems, MLOps, Docker, and self-hosted infrastructure.",
  path: "/blog",
});

// ISR: content/blog is a live read-only bind mount. Re-read it at most every
// 5 min so new posts appear in the listing without a rebuild (keeps static perf).
export const revalidate = 300;

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
          {
            href: "/reading-list",
            label: "Open your reading list",
            note: "Jump back into saved or recently opened posts.",
          },
          {
            href: "/projects",
            label: "See the systems behind the writing",
            note: "Move from notes into case studies.",
          },
          {
            href: "/contact?intent=technical-question",
            label: "Discuss a topic",
            note: "Open a technical conversation about what you just read.",
          },
        ]}
      />
    </main>
  );
}
