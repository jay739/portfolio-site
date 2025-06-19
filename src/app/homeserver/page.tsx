'use client';

import HomeServerStats from '@/components/sections/HomeServerStats';

export default function HomeServerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="home-server">
        <HomeServerStats />
      </section>
    </main>
  );
} 