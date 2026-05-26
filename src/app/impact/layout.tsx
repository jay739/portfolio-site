import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Impact',
  description:
    'Evidence-driven outcomes across production ML delivery, infrastructure engineering, and applied AI research — measured, not estimated.',
  path: '/impact',
})

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return children
}
