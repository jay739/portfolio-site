import type { Metadata } from 'next'

const SITE_URL = 'https://jay739.dev'
const AUTHOR = 'Jayakrishna Konda'

/**
 * Builds per-page metadata with a consistent canonical URL, Open Graph, and
 * Twitter card. The root layout sets `metadataBase` and the title template, so
 * `title` here is the bare page name (e.g. "Projects") and the "%s — Jayakrishna
 * Konda" suffix is applied automatically for the document <title>.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  const fullTitle = `${title} — ${AUTHOR}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title: fullTitle,
      description,
      siteName: `${AUTHOR} Portfolio`,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ['/opengraph-image'],
    },
  }
}
