import type { MetadataRoute } from 'next'
import { getBlogPostMeta } from '@/lib/blog'
import { projects } from '@/data/projects'
import { projectSlug } from '@/lib/project-utils'

const SITE_URL = 'https://jay739.dev'

// Top-level routes that are stable parts of the site.
const STATIC_ROUTES = [
  '',
  '/projects',
  '/skills',
  '/impact',
  '/timeline',
  '/ai-tools',
  '/ai-news',
  '/homeserver',
  '/gallery',
  '/blog',
  '/contact',
  '/updates',
  '/paths',
  '/reading-list',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  const blogEntries: MetadataRoute.Sitemap = getBlogPostMeta().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const briefEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/brief/${projectSlug(project.title)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticEntries, ...blogEntries, ...briefEntries]
}
