'use client';

import { Suspense } from 'react';
import Projects from '@/components/sections/Projects';
import { projects } from '@/data/projects';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RouteNextSteps from '@/components/layout/RouteNextSteps';
import SectionDeepLink from '@/components/ui/SectionDeepLink';

export default function ProjectsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="Project Graph"
        subtitle="Explore production systems, AI tools, and engineering builds with interactive cards and detailed drill-downs."
        chips={['Case Studies', 'Interactive Cards', 'Production Focus']}
        theme="projects"
      />
      <section id="projects" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="projects" title="Projects" />
        </div>
        <Suspense fallback={<div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />}>
          <Projects projects={projects} />
        </Suspense>
      </section>
      <RouteNextSteps
        items={[
          { href: '/skills?mode=map&domain=AI/ML', label: 'Map the supporting skills', note: 'See the domains behind these case studies.' },
          { href: '/impact', label: 'See measured outcomes', note: 'Connect project work to concrete delivery impact.' },
          { href: '/contact?intent=consulting', label: 'Request a walkthrough', note: 'Open a project-specific conversation.' },
        ]}
      />
    </main>
  );
} 
