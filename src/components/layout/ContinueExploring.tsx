'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Compass } from 'lucide-react';

type ExploreLink = {
  href: string;
  title: string;
  description: string;
};

const defaultLinks: ExploreLink[] = [
  {
    href: '/projects',
    title: 'Project Graph',
    description: 'Dive into case studies, demos, and shipped engineering work.',
  },
  {
    href: '/skills',
    title: 'Skills Graph',
    description: 'Trace tools, domains, and outcomes through the interactive map.',
  },
  {
    href: '/contact',
    title: 'Start a Conversation',
    description: 'Turn interest into a project, consulting call, or collaboration.',
  },
];

const exploreMap: Record<string, ExploreLink[]> = {
  '/impact': [
    { href: '/timeline', title: 'See the Timeline', description: 'Connect the metrics to the career story behind them.' },
    { href: '/projects', title: 'Open the Projects', description: 'Jump from outcomes into concrete system builds and case studies.' },
    { href: '/contact', title: 'Talk Through a Similar Problem', description: 'Reach out if you want these kinds of results on your team.' },
  ],
  '/timeline': [
    { href: '/impact', title: 'Review the Impact', description: 'Switch from milestones to measurable outcomes and performance signals.' },
    { href: '/skills', title: 'Inspect the Skills Graph', description: 'See how the underlying stack evolved across the journey.' },
    { href: '/projects', title: 'Browse the Builds', description: 'Open the systems and projects that came out of this path.' },
  ],
  '/projects': [
    { href: '/impact', title: 'Compare Outcomes', description: 'Move from project details to the strongest business and technical results.' },
    { href: '/blog', title: 'Read the Write-Ups', description: 'Go deeper with longer technical notes and build breakdowns.' },
    { href: '/contact', title: 'Discuss a Build', description: 'Start a conversation about product work, infrastructure, or AI systems.' },
  ],
  '/skills': [
    { href: '/projects', title: 'See Skills in Action', description: 'Translate the graph into real builds, deployments, and tooling choices.' },
    { href: '/impact', title: 'See the Results', description: 'Map those skills to measurable outcomes and delivery signals.' },
    { href: '/timeline', title: 'Follow the Journey', description: 'Understand when and where each major capability matured.' },
  ],
  '/gallery': [
    { href: '/ai-tools', title: 'Try the AI Tools Lab', description: 'Move from outputs into the tooling and workflows behind them.' },
    { href: '/homeserver', title: 'View the Infrastructure', description: 'See the telemetry and self-hosted systems powering the creative pipeline.' },
    { href: '/blog', title: 'Read the Engineering Notes', description: 'Explore longer write-ups on systems, workflows, and experiments.' },
  ],
  '/ai-news': [
    { href: '/blog', title: 'Read Original Notes', description: 'Pair the live feed with deeper articles and technical perspectives.' },
    { href: '/ai-tools', title: 'Open the Tools Lab', description: 'Go from trend watching to hands-on experimentation.' },
    { href: '/contact', title: 'Talk AI Delivery', description: 'Reach out if you want help turning AI ideas into production systems.' },
  ],
  '/ai-tools': [
    { href: '/gallery', title: 'View Generated Outputs', description: 'See visual results from the image and workflow tooling.' },
    { href: '/homeserver', title: 'Inspect the Runtime Stack', description: 'Explore the self-hosted infrastructure behind the tools.' },
    { href: '/projects', title: 'Browse Related Projects', description: 'Jump into larger systems that extend these experiments.' },
  ],
  '/homeserver': [
    { href: '/gallery', title: 'See Creative Output', description: 'Move from telemetry to the images and artifacts produced on the stack.' },
    { href: '/impact', title: 'See Reliability Outcomes', description: 'Connect infrastructure choices to uptime, scale, and delivery metrics.' },
    { href: '/blog', title: 'Read the Homelab Notes', description: 'Open longer write-ups on architecture, incidents, and operations.' },
  ],
  '/blog': [
    { href: '/projects', title: 'Back to Project Graph', description: 'Return to the interactive case studies and engineering builds.' },
    { href: '/ai-news', title: 'Check the Live Feed', description: 'Pair evergreen write-ups with current model and tooling updates.' },
    { href: '/contact', title: 'Reach Out', description: 'Start a conversation if an article sparked a project or question.' },
  ],
  '/contact': [
    { href: '/projects', title: 'Browse Projects First', description: 'Review recent systems and case studies before reaching out.' },
    { href: '/impact', title: 'See the Results', description: 'Check measurable delivery outcomes and engineering signals.' },
    { href: '/blog', title: 'Read More Context', description: 'Open deeper technical notes and build write-ups.' },
  ],
};

export default function ContinueExploring() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  const links = exploreMap[pathname] ?? defaultLinks;

  return (
    <section className="relative px-2 pb-6 sm:px-6">
      <div className="w-full neural-card neural-glow-border rounded-[28px] p-4 sm:p-6 md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="neural-kicker mb-1">Next Best Stops</p>
            <h2 className="neural-section-title text-xl sm:text-2xl">Continue Exploring</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-slate-700/60 bg-slate-950/35 p-5 transition-all duration-300 hover:border-amber-400/35 hover:bg-slate-900/55 hover:shadow-[0_14px_38px_rgba(245,158,11,0.08)]"
            >
              <p className="text-sm font-semibold text-slate-100 transition-colors group-hover:text-amber-200">
                {link.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {link.description}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-amber-300">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
