import type { MetadataRoute } from "next";
import { getBlogPostMeta } from "@/lib/blog";
import { getGalleryImages } from "@/lib/gallery";
import { projects } from "@/data/projects";
import { projectSlug } from "@/lib/project-utils";

const SITE_URL = "https://jay739.dev";

// Re-read the live content/gallery mounts at most every 5 min so newly added
// blog posts and gallery images appear in the sitemap without a rebuild.
// Without this the sitemap is baked statically at build time.
export const revalidate = 300;

// Top-level routes that are stable parts of the site.
const STATIC_ROUTES = [
  "",
  "/projects",
  "/skills",
  "/impact",
  "/timeline",
  "/ai-tools",
  "/ai-news",
  "/homeserver",
  "/gallery",
  "/blog",
  "/contact",
  "/updates",
  "/paths",
  "/reading-list",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = getBlogPostMeta().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const briefEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/brief/${projectSlug(project.title)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Shareable per-image gallery pages (each has its own real OG preview).
  const galleryEntries: MetadataRoute.Sitemap = getGalleryImages().map(
    (image) => ({
      url: `${SITE_URL}/gallery/${image.id}`,
      lastModified: image.createdAt ? new Date(image.createdAt) : now,
      changeFrequency: "monthly",
      priority: 0.4,
    }),
  );

  return [...staticEntries, ...blogEntries, ...briefEntries, ...galleryEntries];
}
