'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';

export default function Home() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        // Offset for navbar
        const navbar = document.querySelector('nav');
        const navbarHeight = navbar ? navbar.clientHeight : 64;
        const elementTop = el.offsetTop - navbarHeight;
        window.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  }, [pathname]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full">
      <section id="welcome" className="w-full">
        <Hero />
      </section>
      <section id="about" className="w-full">
        <AboutSection />
      </section>
    </main>
  );
} 