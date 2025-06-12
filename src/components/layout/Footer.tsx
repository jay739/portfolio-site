'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DynamicIcon } from '@/lib/icons';

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="relative py-8 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">
            © {year ?? ''} Jayakrishna Konda. All rights reserved.
          </p>
          <a 
            href="mailto:jayakrishnakonda@jay739.dev" 
            className="mt-2 text-accent hover:text-accent-foreground transition-colors"
          >
            jayakrishnakonda@jay739.dev
          </a>
          <div className="flex gap-4 mt-4">
            <a href="https://github.com/jay739" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-accent-foreground text-xl">
              <DynamicIcon name="github" />
            </a>
            <a href="https://www.linkedin.com/in/jaya-krishna-konda/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-accent-foreground text-xl">
              <DynamicIcon name="linkedin" />
            </a>
            <a href="https://x.com/jay739" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-accent-foreground text-xl">
              <DynamicIcon name="twitter" />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-pink-400 to-cyan-400 animate-gradientBG" />
    </footer>
  );
} 