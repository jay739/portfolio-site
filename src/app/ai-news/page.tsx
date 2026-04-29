'use client';

import { Suspense } from 'react';
import AINewsSection from '@/components/sections/AINewsSection';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import SectionDeepLink from '@/components/ui/SectionDeepLink';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

export default function AiNewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:ai-news', title: 'AI News Feed', href: '/ai-news', kind: 'page', description: 'Curated AI launches, research, and tooling updates' }} />
      <NeuralPageIntro
        title="AI News Feed"
        subtitle="Curated signal stream for AI breakthroughs, model launches, and tooling updates presented with fast scanability."
        chips={['Live Feed', 'Trend Signals', 'Research Pulse']}
        theme="ai-news"
      />
      <section id="ai-news" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="ai-news" title="AI news feed" />
        </div>
        <Suspense fallback={<div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />}>
          <AINewsSection />
        </Suspense>
      </section>
      <RouteNextSteps
        items={[
          { href: '/blog', label: 'Read deeper analysis', note: 'Move from live headlines into longer-form thinking.' },
          { href: '/projects?tag=AI/ML', label: 'See related builds', note: 'Connect current AI signals to shipped portfolio work.' },
          { href: '/ai-tools', label: 'Open the lab', note: 'Jump from news and trends into hands-on tooling.' },
        ]}
      />
    </main>
  );
}
