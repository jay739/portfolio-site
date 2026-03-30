'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  XIcon,
  MenuIcon
} from '@/components/icons/icons';

const sections = [
  { id: 'welcome', label: 'Welcome', href: '/#welcome', isAnchor: true },
  { id: 'about', label: 'About', href: '/#about', isAnchor: true },
  { id: 'impact', label: 'Impact', href: '/impact', isAnchor: false },
  { id: 'timeline', label: 'Timeline', href: '/timeline', isAnchor: false },
  { id: 'skills', label: 'Skills', href: '/skills', isAnchor: false },
  { id: 'projects', label: 'Projects', href: '/projects', isAnchor: false },
  { id: 'ai-tools', label: 'AI Tools', href: '/ai-tools', isAnchor: false },
  { id: 'home-server', label: 'Home Server', href: '/homeserver', isAnchor: false },
  { id: 'ai-news', label: 'AI News', href: '/ai-news', isAnchor: false },
  { id: 'contact', label: 'Contact', href: '/contact', isAnchor: false },
  { id: 'blog', label: 'Blog', href: '/blog', isAnchor: false },
];

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced scrollspy with better detection
  useEffect(() => {
    if (!mounted) return;

    // Only track sections that are anchor links (on the same page)
    const anchorSections = sections.filter(section => section.isAnchor);

    const updateActiveSection = () => {
      // For non-anchor links, use pathname
      const nonAnchorSection = sections.find(
        (section) => !section.isAnchor && section.href === pathname
      );
      if (nonAnchorSection) {
        setActiveSection(nonAnchorSection.id);
        return;
      }

      const sectionElements = anchorSections.map(({ id }) => {
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
    const sectionEls = anchorSections.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
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
  }, [mounted, activeSection, pathname]);

  // Track manual scrolling
  const lastManualScroll = useRef<number>(0);

  // Smooth scroll for anchor links
  const handleNavClick = (section: typeof sections[0]) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (section.isAnchor) {
      if (pathname !== '/') {
        // Navigate to home with hash, then scroll after navigation
        router.push('/' + section.href);
        setTimeout(() => {
          const el = document.getElementById(section.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } else {
        lastManualScroll.current = Date.now();
        const el = document.getElementById(section.id);
        if (el) {
          setActiveSection(section.id);
          const navbarHeight = navRef.current?.offsetHeight || 64;
          const elementTop = el.getBoundingClientRect().top + window.scrollY - navbarHeight - 8;
          window.scrollTo({
            top: Math.max(0, elementTop),
            behavior: 'smooth'
          });
        } else {
          // Fallback: preserve hash behavior if section lookup is delayed.
          window.location.hash = section.id;
        }
      }
    } else {
      router.push(section.href);
    }
    setIsOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/62 backdrop-blur-2xl border-b border-cyan-400/25 transition-colors duration-300 shadow-[0_8px_32px_rgba(2,6,23,0.45)]"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-[4.25rem]">
          <div className="flex items-center">
            <Link href="/" aria-label="Home" className="text-xl font-bold text-slate-100 truncate max-w-[200px] sm:max-w-none hover:text-cyan-200 transition-colors tracking-tight">
              Jayakrishna Konda
            </Link>
          </div>

          {/* Desktop menu */}
          <div role="menubar" className="hidden md:flex items-center space-x-3">
            {sections.map((section) => (
              <motion.a
                key={section.id}
                href={section.href}
                role="menuitem"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300
                  ${activeSection === section.id 
                    ? 'text-white bg-gradient-to-r from-violet-600/90 via-indigo-500/85 to-cyan-500/85 shadow-lg border border-cyan-300/45' 
                    : 'text-slate-300 hover:text-cyan-200 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/35'
                  }`}
                onClick={handleNavClick(section)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span>{section.label}</span>
                <AnimatePresence>
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-indigo-500/85 to-cyan-500/85 rounded-md -z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.a>
            ))}
            {/* Theme toggle - commented out, dark mode is default for now
            <button
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-md text-slate-300 hover:text-violet-200 hover:bg-violet-500/10 transition-colors"
            >
              {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className="p-2.5 rounded-md text-slate-300 hover:text-violet-200 hover:bg-violet-500/10 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300"
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
              <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-950/95 backdrop-blur-2xl rounded-b-lg border-t border-cyan-400/25 max-h-[70vh] overflow-y-auto">
                {sections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={section.href}
                    className={`block px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300
                      ${activeSection === section.id 
                        ? 'text-white bg-gradient-to-r from-violet-600/90 via-indigo-500/85 to-cyan-500/85' 
                        : 'text-slate-300 hover:text-cyan-200 hover:bg-cyan-500/10'
                      }`}
                    onClick={handleNavClick(section)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <span>{section.label}</span>
                    <AnimatePresence>
                      {activeSection === section.id && (
                        <motion.span
                          layoutId="navbar-indicator-mobile"
                          className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-indigo-500/85 to-cyan-500/85 rounded-md -z-10"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.a>
                ))}
                <div className="flex items-center justify-center space-x-4 px-3 py-2 border-t border-slate-700/60 mt-2 pt-4">
                  {/* Theme toggle - commented out, dark mode is default for now
                  <button
                    onClick={toggleTheme}
                    aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    className="p-2 rounded-md text-slate-300 hover:text-violet-200 hover:bg-violet-500/10 transition-colors"
                  >
                    {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                  </button>
                  */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
} 