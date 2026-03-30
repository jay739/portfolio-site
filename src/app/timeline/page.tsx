'use client';

import Timeline from '@/components/sections/Timeline';
import { timelineItems } from '@/data/timeline';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function TimelinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Experience Timeline"
        subtitle="A chronological network of milestones, roles, and shipped work with narrative continuity and interaction depth."
        chips={['Journey Map', 'Milestones', 'Narrative Flow']}
      />
      <section id="timeline" className="w-full">
        <Timeline items={timelineItems} />
      </section>
    </main>
  );
} 