import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'AI News',
  description:
    'A curated stream of AI breakthroughs, model launches, and tooling updates, presented for fast scanning.',
  path: '/ai-news',
})

export default function AiNewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
