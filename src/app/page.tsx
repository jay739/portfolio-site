'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';

const AboutSection = dynamic(() => import('@/components/sections/AboutSection'), {
  loading: () => (
    <div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />
  ),
});

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
    <main className="flex min-h-screen flex-col items-center justify-between w-full neural-page-shell gap-6">
      <section id="welcome" className="w-[100vw] ml-[calc(50%-50vw)] rounded-[28px] overflow-hidden">
        <Hero />
      </section>
      <section id="about" className="w-full">
        <AboutSection />
      </section>
    </main>
  );
} 