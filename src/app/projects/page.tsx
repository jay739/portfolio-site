'use client';

import Projects from '@/components/sections/Projects';
import { projects } from '@/data/projects';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function ProjectsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Project Graph"
        subtitle="Explore production systems, AI tools, and engineering builds with interactive cards and detailed drill-downs."
        chips={['Case Studies', 'Interactive Cards', 'Production Focus']}
      />
      <section id="projects" className="w-full">
        <Projects projects={projects} />
      </section>
    </main>
  );
} 