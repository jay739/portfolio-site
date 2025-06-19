'use client';

import AINewsSection from '@/components/sections/AINewsSection';

export default function AiNewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="ai-news">
        <AINewsSection />
      </section>
    </main>
  );
} 