import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with Jayakrishna Konda — an accessibility-first contact form for collaboration, consulting, and technical conversations.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
