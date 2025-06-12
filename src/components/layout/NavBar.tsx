'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { DynamicIcon } from '@/lib/icons';
import { useSound } from '../providers/SoundProvider';

const sections = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'impact', label: 'Impact' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai-tools', label: 'AI Tools' },
  { id: 'home-server', label: 'Home Server' },
  { id: 'ai-news', label: 'AI News' },
  { id: 'contact', label: 'Contact' },
];

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');
  const { theme, setTheme } = useTheme();
  const { on: soundOn, toggle: toggleSound } = useSound();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop - 100 &&
            scrollPosition < offsetTop + offsetHeight - 100
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" aria-label="Home" className="text-xl font-bold text-primary">
              Jayakrishna Konda
            </Link>
          </div>

          {/* Desktop menu */}
          <div role="menubar" className="hidden md:flex items-center space-x-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                role="menuitem"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'text-accent-foreground bg-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
                onClick={() => {
                  setIsOpen(false);
                  const element = document.getElementById(section.id);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                {section.label}
              </a>
            ))}
          </div>

          {/* Site controls */}
          <div role="toolbar" aria-label="Site controls" className="flex items-center space-x-4">
            <button
              aria-label={`Toggle theme to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              <DynamicIcon name={theme === 'dark' ? 'sun' : 'moon'} size={24} />
            </button>
            <button
              aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
              aria-pressed={soundOn}
              onClick={toggleSound}
              className={`p-2 rounded-md transition-colors ${
                soundOn ? 'text-accent-foreground bg-accent/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
              }`}
            >
              <DynamicIcon name={soundOn ? 'volume-up' : 'volume-off'} size={24} />
            </button>
            <button
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation"
          className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                role="menuitem"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  activeSection === section.id
                    ? 'text-accent-foreground bg-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                }`}
                onClick={() => {
                  setIsOpen(false);
                  const element = document.getElementById(section.id);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                {section.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 