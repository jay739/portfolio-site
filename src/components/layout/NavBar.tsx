'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundContext } from '@/components/providers/SoundProvider';
import {
  VolumeIcon,
  VolumeOffIcon,
  SunIcon,
  MoonIcon,
  XIcon,
  MenuIcon
} from '@/components/icons/icons';

const sections = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'about', label: 'About' },
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { soundEnabled, toggleSound, playClick } = useSoundContext();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced scrollspy with better detection
  useEffect(() => {
    if (!mounted) return;

    const updateActiveSection = () => {
      const sectionElements = sections.map(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            id,
            element,
            top: rect.top,
            bottom: rect.bottom,
            height: rect.height
          };
        }
        return null;
      }).filter(Boolean);

      if (sectionElements.length === 0) return;

      // Find the section that's most visible in the viewport
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      let bestMatch = sectionElements[0];
      let bestScore = -1;

      for (const section of sectionElements) {
        if (!section) continue;
        
        const { top, bottom, height, id } = section;
        
        // Calculate how much of the section is visible
        const visibleTop = Math.max(0, -top);
        const visibleBottom = Math.min(height, viewportHeight - top);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibilityRatio = visibleHeight / height;
        
        // Bias towards sections in the upper part of the viewport
        const centerDistance = Math.abs((top + bottom) / 2 - viewportHeight / 2);
        const centerScore = 1 - (centerDistance / viewportHeight);
        
        // Combined score: visibility + position preference
        const score = visibilityRatio * 0.7 + centerScore * 0.3;
        
        if (score > bestScore && visibilityRatio > 0.1) {
          bestScore = score;
          bestMatch = section;
        }
      }

      if (bestMatch && bestMatch.id !== activeSection) {
        setActiveSection(bestMatch.id);
      }
    };

    // IntersectionObserver as backup
    const sectionEls = sections.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        // Only update if no manual scroll is happening
        if (Date.now() - lastManualScroll.current > 1000) {
          updateActiveSection();
        }
      },
      { 
        threshold: [0.1, 0.5, 0.8],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sectionEls.forEach(el => observer.observe(el));

    // Scroll listener for real-time updates
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted, activeSection]);

  // Track manual scrolling
  const lastManualScroll = useRef<number>(0);

  // Smooth scroll for anchor links
  const handleNavClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lastManualScroll.current = Date.now();
    
    // Play click sound
    playClick();
    
    const el = document.getElementById(id);
    if (el) {
      // Immediately update active section for instant feedback
      setActiveSection(id);
      
      // Smooth scroll to element
      el.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
    setIsOpen(false);
  };

  const toggleTheme = () => {
    playClick();
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" aria-label="Home" className="text-xl font-bold text-primary truncate max-w-[200px] sm:max-w-none hover:text-blue-600 transition-colors">
              Jayakrishna Konda
            </Link>
          </div>

          {/* Desktop menu */}
          <div role="menubar" className="hidden md:flex items-center space-x-4">
            {sections.map((section) => (
              <motion.a
                key={section.id}
                href={`#${section.id}`}
                role="menuitem"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden
                  ${activeSection === section.id 
                    ? 'text-white bg-blue-600 shadow-lg' 
                    : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                onClick={handleNavClick(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span>{section.label}</span>
                <AnimatePresence>
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-blue-600 rounded-md -z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.a>
            ))}
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              {soundEnabled ? <VolumeIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200"
            >
              {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-sm rounded-b-lg border-t border-border">
                {sections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 relative
                      ${activeSection === section.id 
                        ? 'text-white bg-blue-600' 
                        : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    onClick={handleNavClick(section.id)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <span>{section.label}</span>
                    <AnimatePresence>
                      {activeSection === section.id && (
                        <motion.span
                          layoutId="navbar-indicator-mobile"
                          className="absolute inset-0 bg-blue-600 rounded-md -z-10"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.a>
                ))}
                <div className="flex items-center justify-center space-x-4 px-3 py-2 border-t border-border mt-2 pt-4">
                  <button
                    onClick={toggleSound}
                    aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                  >
                    {soundEnabled ? <VolumeIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleTheme}
                    aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                  >
                    {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 