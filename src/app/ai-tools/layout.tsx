import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'AI Tools',
  description:
    'Hands-on AI workflows and interactive tools — launch, inspect, and iterate on self-hosted AI experiments.',
  path: '/ai-tools',
})

export default function AiToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
