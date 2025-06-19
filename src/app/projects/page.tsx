'use client';

import Projects from '@/components/sections/Projects';
import { projects } from '@/data/projects';

export default function ProjectsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="projects">
        <Projects projects={projects} />
      </section>
    </main>
  );
} 