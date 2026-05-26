import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Projects',
  description:
    'Production systems, AI tools, and engineering builds — interactive case studies spanning ML delivery, infrastructure, and full-stack work.',
  path: '/projects',
})

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children
}
