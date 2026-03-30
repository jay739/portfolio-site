'use client';

import AiToolsLab from '@/components/sections/AiToolsLab';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function AiToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="AI Tools Lab"
        subtitle="Hands-on AI workflows with tactile interactions. Launch tools, inspect behavior, and iterate quickly."
        chips={['Lab Console', 'RAG Demo', 'Interactive UX']}
      />
      <section id="ai-tools" className="w-full">
        <AiToolsLab />
      </section>
    </main>
  );
} 