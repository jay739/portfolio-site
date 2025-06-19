'use client';

import SkillsChart from '@/components/sections/SkillsChart';

export default function SkillsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="skills">
        <SkillsChart />
      </section>
    </main>
  );
} 