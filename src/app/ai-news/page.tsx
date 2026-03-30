'use client';

import AINewsSection from '@/components/sections/AINewsSection';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function AiNewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="AI News Feed"
        subtitle="Curated signal stream for AI breakthroughs, model launches, and tooling updates presented with fast scanability."
        chips={['Live Feed', 'Trend Signals', 'Research Pulse']}
      />
      <section id="ai-news" className="w-full">
        <AINewsSection />
      </section>
    </main>
  );
} 