'use client';

import ImpactStats from '@/components/sections/ImpactStats';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function ImpactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Impact Signals"
        subtitle="Evidence-driven outcomes represented as measurable nodes across product delivery, ML impact, and engineering velocity."
        chips={['Metrics', 'Outcomes', 'Signal View']}
      />
      <section id="impact" className="w-full">
        <ImpactStats />
      </section>
    </main>
  );
} 