import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Timeline',
  description:
    "A chronological timeline of milestones, roles, and shipped work across Jayakrishna Konda's engineering career.",
  path: '/timeline',
})

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children
}
