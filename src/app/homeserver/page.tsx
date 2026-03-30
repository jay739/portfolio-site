'use client';

import HomeServerStats from '@/components/sections/HomeServerStats';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function HomeServerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Telemetry Control Center"
        subtitle="Live infrastructure metrics presented as a neural operations dashboard for system awareness and reliability."
        chips={['Real-Time Signals', 'Ops Insight', 'Infrastructure']}
      />
      <section id="home-server" className="w-full">
        <HomeServerStats />
      </section>
    </main>
  );
} 