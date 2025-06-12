'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { SoundProvider } from './providers/SoundProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SoundProvider>
        {children}
      </SoundProvider>
    </ThemeProvider>
  );
} 