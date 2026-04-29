'use client';

import { ReactNode, Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Providers } from '@/components/providers';
import Footer from '@/components/layout/Footer';
import ContinueExploring from '@/components/layout/ContinueExploring';
import RecentlyViewedRail from '@/components/layout/RecentlyViewedRail';
import LiveStatusStrip from '@/components/layout/LiveStatusStrip';
import StickyContextBar from '@/components/layout/StickyContextBar';
import PageProgressPill from '@/components/layout/PageProgressPill';
import FeedbackToastHub from '@/components/layout/FeedbackToastHub';
import ChatbotWidget from '@/components/ui/ChatbotWidget';
import SmartScrollButton from '@/components/ui/SmartScrollButton';
import QuickNavPalette from '@/components/ui/QuickNavPalette';
import ThemeAwareBackground from '@/components/backgrounds/ThemeAwareBackground';
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
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const sections = Array.from(mainContent.querySelectorAll('section')) as HTMLElement[];
    sections.forEach((section, index) => {
      section.classList.add('neural-section');
      section.dataset.last = index === sections.length - 1 ? 'true' : 'false';
    });
  }, [pathname]);

  return (
    <Providers>
      <ThemeAwareBackground />
      <PageBackground />
      {/* <CustomCursor /> */}
      {/* <FloatingTimeWidget /> */}
        <ChatbotWidget />
        <SmartScrollButton />
        <FeedbackToastHub />
        <Suspense fallback={null}>
          <StickyContextBar />
        </Suspense>
        <PageProgressPill />
        <QuickNavPalette />
        <NavBar />
        <LiveStatusStrip />
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
                ? 'transparent'
                : 'transparent',
            }}
          >
            {children}
          </main>
          <RecentlyViewedRail />
          <ContinueExploring />
          <Footer />
        </div>
    </Providers>
  );
} 
