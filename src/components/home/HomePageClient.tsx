'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaArrowRight, FaChartLine, FaNetworkWired, FaServer, FaShieldAlt } from 'react-icons/fa';
import Hero from '@/components/sections/Hero';
import HomeSmartHub from '@/components/home/HomeSmartHub';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import type { BlogPostMeta } from '@/lib/blog';

const homeServerSignals = [
  { label: 'Core Node', detail: 'Private compute and storage', icon: <FaServer /> },
  { label: 'Backup VPS', detail: 'Edge and backup operations', icon: <FaNetworkWired /> },
  { label: 'Telemetry', detail: 'Live health snapshots', icon: <FaChartLine /> },
  { label: 'Access Layer', detail: 'Private mesh and identity', icon: <FaShieldAlt /> },
];

export default function HomePageClient({
  latestPost,
  children,
}: {
  latestPost?: BlogPostMeta;
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const navbar = document.querySelector('nav');
        const navbarHeight = navbar ? navbar.clientHeight : 64;
        const elementTop = el.offsetTop - navbarHeight;
        window.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  }, [pathname]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full neural-page-shell !pt-0 sm:!pt-0 pb-24 sm:pb-28 gap-6">
      <RecentViewTracker item={{ id: 'page:home', title: 'Home', href: '/', kind: 'page', description: 'Overview, smart hub, and portfolio entry point' }} />
      <section id="welcome" className="w-[100vw] ml-[calc(50%-50vw)] rounded-[28px] overflow-visible">
        <Hero />
      </section>
      <section id="about" className="w-full">
        {children}
      </section>
      <section id="home-server-preview" className="w-full">
        <div className="neural-card neural-glow-border rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                Home Server Live
              </div>
              <h2 className="neural-section-title">Private infrastructure, public-safe telemetry</h2>
              <p className="neural-section-copy mt-3">
                A sanitized view of my homelab operations: architecture, uptime signals, service categories, and telemetry patterns without exposing container names, ports, or internal endpoints.
              </p>
            </div>
            <Link href="/homeserver" className="neural-control-btn inline-flex items-center justify-center gap-2 self-start text-sm lg:self-center">
              Open telemetry
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {homeServerSignals.map((signal) => (
              <div key={signal.label} className="neural-card-soft rounded-xl border border-slate-600/55 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xl text-amber-400">{signal.icon}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{signal.label}</h3>
                <p className="mt-1 text-xs text-slate-400">{signal.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HomeSmartHub latestPost={latestPost} />
    </main>
  );
}
