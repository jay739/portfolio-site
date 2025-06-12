'use client';

import { ReactNode } from 'react';
import { Providers } from '@/components/providers';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import SmartScrollButton from '@/components/SmartScrollButton';
import ThemeAwareBackground from '@/components/ThemeAwareBackground';
import NavBar from '@/components/layout/NavBar';
import CustomCursor from '../CustomCursor';
import InfiniteLoopScroll from '../InfiniteLoopScroll';
import FloatingTimeWidget from '../FloatingTimeWidget';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <ThemeAwareBackground />
      <CustomCursor />
      <InfiniteLoopScroll />
      <FloatingTimeWidget />
      <Providers>
        <ChatbotWidget />
        <SmartScrollButton />
        <NavBar />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Skip to main content
        </a>
        <div className="flex flex-col min-h-[calc(var(--vh,1vh)*100)]">
          <main id="main-content" className="flex-grow">{children}</main>
          <Footer />
        </div>
      </Providers>
    </>
  );
} 