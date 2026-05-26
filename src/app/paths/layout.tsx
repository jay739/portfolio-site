import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Collections',
  description:
    'Curated paths through the portfolio — explore by AI delivery, homelab architecture, or full-stack product work.',
  path: '/paths',
})

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return children
}
