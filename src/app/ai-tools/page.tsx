'use client';

import AiToolsLab from '@/components/sections/AiToolsLab';
import BatcaveTools from '@/components/sections/BatcaveTools';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

export default function AiToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:ai-tools', title: 'AI Tools Lab', href: '/ai-tools', kind: 'tool', description: 'Self-hosted tools, presets, and batcave utilities' }} />
      <NeuralPageIntro
        title="AI Tools Lab"
        subtitle="Hands-on AI workflows with tactile interactions. Launch tools, inspect behavior, and iterate quickly."
        chips={['Lab Console', 'RAG Demo', 'Batcave Toolbox', 'Interactive UX']}
        theme="ai-tools"
      />
      <section id="ai-tools" className="w-full">
        <AiToolsLab />
      </section>
      <section id="batcave-tools" className="w-full">
        <BatcaveTools />
      </section>
      <RouteNextSteps
        items={[
          { href: '/gallery', label: 'Browse generated outputs', note: 'See what the image workflows produce in the gallery.' },
          { href: '/homeserver?lite=1', label: 'Inspect supporting telemetry', note: 'Follow the public-safe infrastructure view behind the lab.' },
          { href: '/contact?intent=consulting', label: 'Ask about the architecture', note: 'Open a conversation about the tool stack and infra choices.' },
        ]}
      />
    </main>
  );
} 
