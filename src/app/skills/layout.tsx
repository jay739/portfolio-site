import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Skills',
  description:
    'An interactive skills graph of technologies, domains, and project relationships across AI/ML, MLOps, and full-stack engineering.',
  path: '/skills',
})

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children
}
