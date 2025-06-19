'use client';

import AiToolsLab from '@/components/sections/AiToolsLab';

export default function AiToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="ai-tools">
        <AiToolsLab />
      </section>
    </main>
  );
} 