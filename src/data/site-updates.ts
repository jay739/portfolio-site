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
    id: 'homelab-ops-architecture',
    date: 'April 2026',
    title: 'Operations Command Architecture',
    details: 'The homeserver page now includes the V3 live HUD architecture view: a sanitized command-center map of the edge, core, AI node, mesh, services, traffic, and event stream.',
    href: '/homeserver#architecture',
    timestamp: '2026-04-28T12:00:00.000Z',
  },
  {
    id: 'portfolio-share-preview',
    date: 'April 2026',
    title: 'Portfolio Share Preview',
    details: 'Social previews now use a generated portfolio card with page-focused content instead of falling back to the profile photo.',
    href: '/',
    timestamp: '2026-04-27T12:00:00.000Z',
  },
  {
    id: 'state-sharing',
    date: 'April 2026',
    title: 'Shareable Exploration State',
    details: 'Projects, gallery, blog, AI news, skills, and AI tools now preserve useful UI state in the URL so links reopen the same view.',
    href: '/projects',
    timestamp: '2026-04-10T12:00:00.000Z',
  },
  {
    id: 'command-menu',
    date: 'April 2026',
    title: 'Command Menu Upgrade',
    details: 'The quick navigator now includes action shortcuts like featured project, resume link copying, and image generator presets.',
    href: '/ai-tools',
    timestamp: '2026-04-11T12:00:00.000Z',
  },
  {
    id: 'draft-persistence',
    date: 'April 2026',
    title: 'Contact and Newsletter Persistence',
    details: 'Drafts and success states are kept locally so refreshes do not wipe out in-progress or recently completed outreach.',
    href: '/contact',
    timestamp: '2026-04-12T12:00:00.000Z',
  },
  {
    id: 'route-optimization',
    date: 'April 2026',
    title: 'Telemetry and Skills Route Optimization',
    details: 'Heavy client components are lazy-loaded and the skills chart loads Chart.js only when it is actually rendered.',
    href: '/skills',
    timestamp: '2026-04-13T12:00:00.000Z',
  },
  {
    id: 'public-hardening',
    date: 'April 2026',
    title: 'Safer Public Tooling',
    details: 'Public APIs used by the chatbot, image generator, gallery, subscribe, contact, and telemetry routes now use tighter rate limiting.',
    href: '/ai-tools',
    timestamp: '2026-04-14T12:00:00.000Z',
  },
  {
    id: 'visitor-intelligence',
    date: 'April 2026',
    title: 'Visitor Intelligence Layer',
    details: 'Recently viewed rails, reading history, last-visit changelog awareness, and sticky contextual actions now adapt the site to returning visitors.',
    href: '/reading-list',
    timestamp: '2026-04-18T12:00:00.000Z',
  },
];

export const latestSiteUpdateTimestamp = siteUpdates
  .map((update) => new Date(update.timestamp).getTime())
  .sort((a, b) => b - a)[0];
