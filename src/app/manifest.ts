import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jayakrishna Konda — ML/AI Engineer Portfolio',
    short_name: 'JK Portfolio',
    description:
      'ML/AI engineer building production RAG pipelines, LLM systems, MLOps workflows, and self-hosted AI infrastructure.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#dc480c',
    icons: [
      {
        // TODO: replace with dedicated square 192x192 and 512x512 PNG icons
        // (and a maskable variant) for full PWA install support.
        src: '/images/profile/profile.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  }
}
