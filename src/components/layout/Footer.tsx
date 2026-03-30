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
    <footer className="relative py-8 bg-slate-950/72 border-t border-cyan-400/20 backdrop-blur-2xl">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-slate-200">
          © {year ?? ''} Jayakrishna Konda. All rights reserved.
        </p>
        <a 
          href="mailto:contact@jay739.dev" 
          className="mt-2 text-cyan-200 hover:text-cyan-100 transition-colors neural-pill text-xs"
        >
          contact@jay739.dev
        </a>
        <div className="flex gap-4 mt-4">
          <a href="https://github.com/jay739" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="neural-control-btn text-base">
            <DynamicIcon name="github" />
          </a>
          <a href="https://www.linkedin.com/in/jaya-krishna-konda/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="neural-control-btn text-base">
            <DynamicIcon name="linkedin" />
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400 animate-gradientBG" />
    </footer>
  );
} 