import { getBlogPostMeta } from '@/lib/blog';
import { SEO } from '@/lib/constants';

export const dynamic = 'force-static';
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = getBlogPostMeta();
  const siteUrl = SEO.SITE_URL;
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      const categories = post.tags
        .map((tag) => `    <category>${escapeXml(tag)}</category>`)
        .join('\n');
      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(post.excerpt)}</description>
${categories}
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Jayakrishna Konda — Blog</title>
  <link>${siteUrl}/blog</link>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  <description>ML/AI engineering, self-hosted AI infrastructure, and homelab notes from the Batcave.</description>
  <language>en-us</language>
  <lastBuildDate>${buildDate}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
