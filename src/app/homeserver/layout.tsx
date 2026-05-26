import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Home Server',
  description:
    'Live telemetry from a self-hosted homelab — uptime signals, service categories, and infrastructure metrics presented as a neural operations dashboard.',
  path: '/homeserver',
})

export default function HomeserverLayout({ children }: { children: React.ReactNode }) {
  return children
}
