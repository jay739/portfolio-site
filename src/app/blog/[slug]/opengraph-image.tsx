import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";
import { getBlogPostBySlug } from "@/lib/blog";

// Per-post social card: post title + date + excerpt + tags over the brand card.
// nodejs runtime (not edge) because getBlogPostBySlug reads the MDX from disk.
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Blog post preview — Jayakrishna Konda";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return renderOgImage({
      eyebrow: "Blog",
      title: "Jayakrishna Konda",
      subtitle: "jay739.dev/blog",
    });
  }

  const subtitle =
    post.excerpt.length > 140
      ? `${post.excerpt.slice(0, 137).trimEnd()}…`
      : post.excerpt;

  return renderOgImage({
    eyebrow: `Blog · ${post.date}`,
    title: post.title,
    subtitle,
    tags: post.tags,
  });
}
