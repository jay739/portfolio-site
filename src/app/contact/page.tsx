'use client';

import ContactSection from '@/components/sections/ContactSection';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-6">
      <NeuralPageIntro
        title="Contact Interface"
        subtitle="A conversational contact flow with clear feedback states, smooth micro-interactions, and accessibility-first form behavior."
        chips={['Fast Response', 'Secure Form', 'Clear Feedback']}
      />
      <section id="contact" className="w-full">
        <ContactSection />
      </section>
    </main>
  );
} 