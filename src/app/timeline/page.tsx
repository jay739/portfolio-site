'use client';

import Timeline from '@/components/sections/Timeline';
import { timelineItems } from '@/data/timeline';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import SectionDeepLink from '@/components/ui/SectionDeepLink';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

export default function TimelinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:timeline', title: 'Experience Timeline', href: '/timeline', kind: 'page', description: 'Chronological milestones and career narrative' }} />
      <NeuralPageIntro
        title="Experience Timeline"
        subtitle="A chronological network of milestones, roles, and shipped work with narrative continuity and interaction depth."
        chips={['Journey Map', 'Milestones', 'Narrative Flow']}
        theme="timeline"
      />
      <section id="timeline" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="timeline" title="Timeline" />
        </div>
        <Timeline items={timelineItems} />
      </section>
      <RouteNextSteps
        items={[
          { href: '/impact', label: 'See the measurable outcomes', note: 'Jump from chronology into verified delivery metrics.' },
          { href: '/skills', label: 'Open the skills map', note: 'See the technical topology built through the timeline.' },
          { href: '/projects', label: 'Browse the shipped work', note: 'Move from milestones into concrete builds.' },
        ]}
      />
    </main>
  );
} 
