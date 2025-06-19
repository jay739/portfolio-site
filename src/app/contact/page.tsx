'use client';

import ContactSection from '@/components/sections/ContactSection';

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full max-w-[1800px] px-2 sm:px-6 mx-auto">
      <section id="contact">
        <ContactSection />
      </section>
    </main>
  );
} 