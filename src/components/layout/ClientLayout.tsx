'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Providers } from '@/components/providers';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import SmartScrollButton from '@/components/SmartScrollButton';
import ThemeAwareBackground from '@/components/ThemeAwareBackground';
import NavBar from '@/components/layout/NavBar';
import PageBackground from '@/components/backgrounds/PageBackground';
// import CustomCursor from '../CustomCursor';
// import FloatingTimeWidget from '../FloatingTimeWidget';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const hasPageBackground = pathname !== '/';
  const pageTheme =
    pathname === '/'
      ? 'home'
      : pathname.startsWith('/skills')
      ? 'skills'
      : pathname.startsWith('/projects')
      ? 'projects'
      : pathname.startsWith('/ai-tools')
      ? 'ai-tools'
      : pathname.startsWith('/ai-news')
      ? 'ai-news'
      : pathname.startsWith('/homeserver')
      ? 'homeserver'
      : pathname.startsWith('/impact')
      ? 'impact'
      : pathname.startsWith('/timeline')
      ? 'timeline'
      : pathname.startsWith('/contact')
      ? 'contact'
      : pathname.startsWith('/blog')
      ? 'blog'
      : 'default';

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('section, .neural-card, .neural-card-soft, .neural-glow-border')) as HTMLElement[];
    const sections = Array.from(document.querySelectorAll('main section')) as HTMLElement[];
    sections.forEach((section, index) => {
      section.classList.add('neural-section');
      section.dataset.last = index === sections.length - 1 ? 'true' : 'false';
    });

    targets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = `${Math.min(index * 40, 320)}ms`;
    });

    let visibleCount = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            visibleCount += 1;
            const level = Math.min(1, 0.2 + visibleCount * 0.08);
            window.dispatchEvent(new CustomEvent('neural:expand', { detail: { level } }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Providers>
      <ThemeAwareBackground />
      <PageBackground />
      {/* <CustomCursor /> */}
      {/* <FloatingTimeWidget /> */}
        <ChatbotWidget />
        <SmartScrollButton />
        <NavBar />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Skip to main content
        </a>
        <div className="flex flex-col min-h-[calc(var(--vh,1vh)*100)] relative z-10">
          <main
            id="main-content"
            className="flex-grow relative"
            data-page-background={hasPageBackground ? 'true' : undefined}
            data-page-theme={pageTheme}
            style={{
              background: hasPageBackground
                ? 'linear-gradient(180deg, rgba(2,6,23,0.16), rgba(2,6,23,0.04) 34%, transparent 70%)'
                : 'linear-gradient(180deg, rgba(2,6,23,0.2), rgba(2,6,23,0.05) 45%, rgba(2,6,23,0))',
            }}
          >
            {children}
          </main>
          <Footer />
        </div>
    </Providers>
  );
} 