'use client';

import { Suspense } from 'react';
import ContactSection from '@/components/sections/ContactSection';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import RouteNextSteps from '@/components/layout/RouteNextSteps';

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:contact', title: 'Contact Interface', href: '/contact', kind: 'page', description: 'Contact flow, hiring, collaboration, and consulting' }} />
      <NeuralPageIntro
        title="Contact Interface"
        subtitle="A conversational contact flow with clear feedback states, smooth micro-interactions, and accessibility-first form behavior."
        chips={['Fast Response', 'Secure Form', 'Clear Feedback']}
        theme="contact"
      />
      <section id="contact" className="w-full">
        <Suspense fallback={<div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />}>
          <ContactSection />
        </Suspense>
      </section>
      <RouteNextSteps
        items={[
          { href: '/impact', label: 'Review outcomes first', note: 'Best if you are evaluating fit or experience.' },
          { href: '/projects', label: 'Pick a case study', note: 'Use a project page to prefill more context before reaching out.' },
          { href: '/paths', label: 'Follow a guided collection', note: 'Choose the route that matches what you care about most.' },
        ]}
      />
    </main>
  );
} 
