'use client';

import Timeline from '@/components/sections/Timeline';
import { timelineItems } from '@/data/timeline';

export default function TimelinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="timeline">
        <Timeline items={timelineItems} />
      </section>
    </main>
  );
} 