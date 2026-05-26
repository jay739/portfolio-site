import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: "What's New",
  description:
    "A changelog of recent additions and improvements across Jayakrishna Konda's portfolio.",
  path: '/updates',
})

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return children
}
