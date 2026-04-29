export interface SitePath {
  id: string;
  title: string;
  description: string;
  audience: string;
  stops: Array<{
    label: string;
    href: string;
    note: string;
  }>;
}

export const sitePaths: SitePath[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer Path',
    description: 'Follow the portfolio through GenAI systems, applied ML delivery, and production experimentation.',
    audience: 'Hiring teams, founders, ML peers',
    stops: [
      { label: 'Impact Signals', href: '/impact', note: 'Start with measurable ML and GenAI outcomes.' },
      { label: 'Batcave Case Study', href: '/projects?project=ai-platform-infrastructure-batcave-personal-ml-cloud', note: 'See the private AI platform and reliability work.' },
      { label: 'Skills Graph', href: '/skills?mode=map&domain=AI/ML', note: 'Explore the AI/ML and MLOps topology.' },
      { label: 'AI Tools Lab', href: '/ai-tools?tool=image-generator&speed=quality&quality=high&aspect=portrait&style=photorealistic&advanced=1', note: 'Try the self-hosted AI workflows directly with a high-fidelity preset.' },
      { label: 'Technical Writing', href: '/blog?tag=RAG', note: 'Finish on applied writing around retrieval, tooling, and systems.' },
    ],
  },
  {
    id: 'homelab-builder',
    title: 'Homelab Builder Path',
    description: 'A curated walk through infrastructure, observability, and self-hosted systems design.',
    audience: 'Platform engineers, infra leaders, SRE peers',
    stops: [
      { label: 'Home Server Telemetry', href: '/homeserver?lite=1', note: 'Check the live ops dashboard first in the lighter telemetry mode.' },
      { label: 'Projects', href: '/projects?tag=Docker', note: 'Browse the infrastructure-heavy builds.' },
      { label: 'Skills Graph', href: '/skills?mode=map&domain=DevOps', note: 'Jump into the DevOps domain view.' },
      { label: 'Gallery', href: '/gallery?style=cinematic&orientation=landscape', note: 'See the visual side of the self-hosted AI pipeline.' },
      { label: 'AI News', href: '/ai-news?q=OpenAI&category=Infrastructure', note: 'Finish with the infra and tooling trends I keep an eye on.' },
    ],
  },
  {
    id: 'full-stack',
    title: 'Full-Stack Work Path',
    description: 'A compact route through interface craft, end-to-end application design, and user-facing tooling.',
    audience: 'Product teams, engineering managers',
    stops: [
      { label: 'Projects Grid', href: '/projects?view=grid&sort=featured', note: 'Start with the polished case studies and shipped work.' },
      { label: 'Skills Graph', href: '/skills?mode=map&domain=Frontend', note: 'Open directly into the interface and product-facing skill slice.' },
      { label: 'Blog', href: '/blog?quick=1', note: 'See the technical writing and architectural thinking.' },
      { label: 'Gallery', href: '/gallery?orientation=square', note: 'Explore polished interactive surfaces and showcase work.' },
      { label: 'Contact', href: '/contact?intent=collab', note: 'Open a collaboration thread with context prefilled.' },
    ],
  },
];
