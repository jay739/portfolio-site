export interface SiteUpdate {
  id: string;
  date: string;
  title: string;
  details: string;
  href?: string;
  timestamp: string;
}

export const siteUpdates: SiteUpdate[] = [
  {
    id: "per-page-og-cards",
    date: "June 2026",
    title: "Unique social preview cards for every page",
    details:
      "Every route now generates its own Open Graph image from a shared branded template. Blog posts show their title, date, and tags; section pages show their name and summary. Links shared to LinkedIn, X, or Slack get a relevant preview instead of one generic card.",
    href: "/blog",
    timestamp: "2026-06-08T20:00:00.000Z",
  },
  {
    id: "blog-toc-readaloud",
    date: "June 2026",
    title: 'Collapsible "In this post" outline + cleaner read-aloud',
    details:
      "Blog posts gained a collapsible table of contents, built from each article’s headings as categories and subcategories, that now appears on every post. The read-aloud panel moved to its own full-width row so it no longer crowds the share buttons.",
    href: "/blog",
    timestamp: "2026-06-08T18:00:00.000Z",
  },
  {
    id: "ui-polish-jun-2026",
    date: "June 2026",
    title: "Navigation and layout polish",
    details:
      "The light/dark toggle now stays visible in the navbar at every width, the gap below the navbar is tighter and consistent across pages, the gallery zoom keeps each image’s real proportions, and the homelab dashboard no longer shows a stray horizontal scrollbar.",
    href: "/",
    timestamp: "2026-06-08T16:00:00.000Z",
  },
  {
    id: "node22-security-jun-2026",
    date: "June 2026",
    title: "Runtime upgraded to Node 22 and vulnerability cleanup",
    details:
      "The container base image moved to Node 22 (current LTS) and several reported runtime errors were fixed, including a hydration mismatch on the AI tools page and an invalid-URL navigation bug.",
    href: "/",
    timestamp: "2026-06-08T14:00:00.000Z",
  },
  {
    id: "light-mode-layer",
    date: "May 2026",
    title: "Global Light Mode Overrides Layer",
    details:
      "Added a comprehensive theme-aware styling layer that automatically adapts cards, text, inputs, code snippets, hover states, selections, and interactive graphs to light mode, ensuring perfect contrast and readability across all pages.",
    href: "/",
    timestamp: "2026-05-26T15:39:38.000Z",
  },
  {
    id: "podcast-gallery",
    date: "May 2026",
    title: "AI Showcase now includes Podcasts",
    details:
      "The /gallery page picked up a second section for AI-generated podcasts. Saved episodes show host tags, the TTS engine and Ollama model used, an inline audio player, and an expandable transcript. Save-to-showcase is gated by the same admin password as the image gallery.",
    href: "/gallery#podcasts",
    timestamp: "2026-05-19T20:00:00.000Z",
  },
  {
    id: "podcast-tool-tts-picker",
    date: "May 2026",
    title: "PDF to Podcast: voice engine picker + 10× speedup",
    details:
      "The PDF to Podcast tool now exposes three TTS engines in the UI: Piper (fastest, ~30s synth), Kokoro-82M (balanced, MPS-accelerated), and Bark (highest quality, slower). End-to-end time for a typical PDF drops from ~20 min on Bark to ~1m 46s on Piper. Backend runs Ollama qwen2.5:14b for transcript generation with proper context-window sizing.",
    href: "/ai-tools",
    timestamp: "2026-05-19T18:00:00.000Z",
  },
  {
    id: "pdf-to-podcast-launch",
    date: "May 2026",
    title: "PDF to Podcast tool is live",
    details:
      "Upload a PDF, pick 2–3 hosts, and the Mac Mini renders a multi-voice podcast with transcript. Self-hosted Flask + Ollama + Piper/Kokoro/Bark TTS on the Apple M4. One concurrent job site-wide, IP rate-limited. Proxied through the portfolio over Tailscale.",
    href: "/ai-tools?tool=podcast-generator",
    timestamp: "2026-05-19T12:00:00.000Z",
  },
  {
    id: "blog-rss-feed",
    date: "May 2026",
    title: "RSS Feed for the Blog",
    details:
      "The blog now publishes a standard RSS 2.0 feed at /rss.xml — sourced directly from the MDX content with reading-time metadata. Subscribe in any reader, or wire it into the GitHub profile README so the latest posts auto-sync there.",
    href: "/rss.xml",
    timestamp: "2026-05-18T12:00:00.000Z",
  },
  {
    id: "blog-lifetime-software-deals",
    date: "May 2026",
    title: "New Post: The Quiet Math of Lifetime Software Deals",
    details:
      "A reflection on which lifetime purchases (Infuse Pro, Niagara, Poweramp, Symfonium, No Man’s Sky) actually survived years of use, why companies offer the deals in the first place, and the psychology and acquisition risk behind them — with references to Kahneman, Thaler, Tien Tzuo, Hermann Simon, and Doctorow’s enshittification thesis.",
    href: "/blog/lifetime-software-deals",
    timestamp: "2026-05-12T12:00:00.000Z",
  },
  {
    id: "homelab-ops-architecture",
    date: "April 2026",
    title: "Operations Command Architecture",
    details:
      "The homeserver page now includes the V3 live HUD architecture view: a sanitized command-center map of the edge, core, AI node, mesh, services, traffic, and event stream.",
    href: "/homeserver#architecture",
    timestamp: "2026-04-28T12:00:00.000Z",
  },
  {
    id: "portfolio-share-preview",
    date: "April 2026",
    title: "Portfolio Share Preview",
    details:
      "Social previews now use a generated portfolio card with page-focused content instead of falling back to the profile photo.",
    href: "/",
    timestamp: "2026-04-27T12:00:00.000Z",
  },
  {
    id: "state-sharing",
    date: "April 2026",
    title: "Shareable Exploration State",
    details:
      "Projects, gallery, blog, AI news, skills, and AI tools now preserve useful UI state in the URL so links reopen the same view.",
    href: "/projects",
    timestamp: "2026-04-10T12:00:00.000Z",
  },
  {
    id: "command-menu",
    date: "April 2026",
    title: "Command Menu Upgrade",
    details:
      "The quick navigator now includes action shortcuts like featured project, resume link copying, and image generator presets.",
    href: "/ai-tools",
    timestamp: "2026-04-11T12:00:00.000Z",
  },
  {
    id: "draft-persistence",
    date: "April 2026",
    title: "Contact and Newsletter Persistence",
    details:
      "Drafts and success states are kept locally so refreshes do not wipe out in-progress or recently completed outreach.",
    href: "/contact",
    timestamp: "2026-04-12T12:00:00.000Z",
  },
  {
    id: "route-optimization",
    date: "April 2026",
    title: "Telemetry and Skills Route Optimization",
    details:
      "Heavy client components are lazy-loaded and the skills chart loads Chart.js only when it is actually rendered.",
    href: "/skills",
    timestamp: "2026-04-13T12:00:00.000Z",
  },
  {
    id: "public-hardening",
    date: "April 2026",
    title: "Safer Public Tooling",
    details:
      "Public APIs used by the chatbot, image generator, gallery, subscribe, contact, and telemetry routes now use tighter rate limiting.",
    href: "/ai-tools",
    timestamp: "2026-04-14T12:00:00.000Z",
  },
  {
    id: "visitor-intelligence",
    date: "April 2026",
    title: "Visitor Intelligence Layer",
    details:
      "Recently viewed rails, reading history, last-visit changelog awareness, and sticky contextual actions now adapt the site to returning visitors.",
    href: "/reading-list",
    timestamp: "2026-04-18T12:00:00.000Z",
  },
];

export const latestSiteUpdateTimestamp = siteUpdates
  .map((update) => new Date(update.timestamp).getTime())
  .sort((a, b) => b - a)[0];
