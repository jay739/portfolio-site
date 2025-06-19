'use client';

import ImpactStats from '@/components/sections/ImpactStats';

export default function ImpactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="impact">
        <ImpactStats />
      </section>
    </main>
  );
} 