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
} from '@/components/ui/icons';
import { latestSiteUpdateTimestamp } from '@/data/site-updates';
import { getSeenUpdatesTimestamp } from '@/lib/site-ux';

const sections = [
  { id: 'welcome', label: 'Welcome', href: '/#welcome', isAnchor: true },
  { id: 'about', label: 'About', href: '/#about', isAnchor: true },
  { id: 'impact', label: 'Impact', href: '/impact', isAnchor: false },
  { id: 'timeline', label: 'Timeline', href: '/timeline', isAnchor: false },
  { id: 'skills', label: 'Skills', href: '/skills', isAnchor: false },
  { id: 'projects', label: 'Projects', href: '/projects', isAnchor: false },
  { id: 'ai-tools', label: 'AI Tools', href: '/ai-tools', isAnchor: false },
  { id: 'gallery', label: 'Gallery', href: '/gallery', isAnchor: false },
  { id: 'home-server', label: 'Home Server', href: '/homeserver', isAnchor: false },
  { id: 'ai-news', label: 'AI News', href: '/ai-news', isAnchor: false },
  { id: 'updates', label: 'What\'s New', href: '/updates', isAnchor: false, badge: 'New' },
  { id: 'contact', label: 'Contact', href: '/contact', isAnchor: false },
  { id: 'blog', label: 'Blog', href: '/blog', isAnchor: false },
];

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: 'easeInOut',
      when: 'afterChildren',
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 26,
      mass: 0.9,
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

const mobileMenuItemVariants = {
  closed: { opacity: 0, y: 10, filter: 'blur(6px)' },
  open: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};

export default function NavBar() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');
  const [updatesBadge, setUpdatesBadge] = useState<string | undefined>('New');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => {
      const seenAt = getSeenUpdatesTimestamp();
      setUpdatesBadge(seenAt >= latestSiteUpdateTimestamp ? undefined : 'Updated');
    };
    sync();
    window.addEventListener('site-ux:updates-seen', sync as EventListener);
    return () => window.removeEventListener('site-ux:updates-seen', sync as EventListener);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let ticking = false;

    const handleScrollState = () => {
      const currentY = window.scrollY;
      const movingDown = currentY > lastScrollY.current;

      setIsScrolled(currentY > 72);
      setIsNavHidden(movingDown && currentY > 160 && !isOpen);
      lastScrollY.current = currentY;
      ticking = false;
    };

    handleScrollState();

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(handleScrollState);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mounted, isOpen]);

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
  }, [mounted, pathname]);

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

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
    <div
      className={`fixed inset-x-0 top-0 z-50 pointer-events-none transition-[padding] duration-500 ease-out ${
        isScrolled ? 'px-4 sm:px-6 md:px-10 pt-2 sm:pt-3' : 'px-1 pt-1'
      }`}
    >
      <motion.nav
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        animate={{
          y: isNavHidden ? -96 : 0,
          borderRadius: isScrolled ? 9999 : 14,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 30 }}
        className={`pointer-events-auto relative mx-auto w-full overflow-visible backdrop-blur-2xl transition-[box-shadow,max-width] duration-500 ease-out ${
          isScrolled
            ? 'max-w-[1320px] border border-amber-400/30 shadow-[0_18px_48px_rgba(120,53,15,0.45),0_0_0_1px_rgba(245,158,11,0.10)]'
            : 'max-w-full shadow-[0_6px_28px_rgba(120,53,15,0.38)]'
        }`}
        style={{
          background: 'linear-gradient(180deg,rgba(220,72,12,0.88) 0%,rgba(180,55,8,0.86) 100%)',
        }}
      >
        {/* Amber glass sheen — top bright, fades down */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(251,191,36,0.22)_0%,rgba(245,158,11,0.10)_35%,rgba(255,255,255,0)_100%)]" />
        {/* Bottom amber hairline */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/45 to-transparent rounded-full" />
        <div className="relative mx-auto px-4">
          <div className={`flex items-center gap-3 transition-all duration-300 ${isScrolled ? 'h-11' : 'h-14'}`}>
          <div className="flex shrink-0 items-center">
            <Link href="/" aria-label="Home" className="text-base xl:text-xl font-bold text-amber-50 truncate max-w-[160px] xl:max-w-none hover:text-white transition-colors tracking-tight drop-shadow-[0_1px_6px_rgba(245,158,11,0.35)]">
              Jayakrishna Konda
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden xl:flex min-w-0 flex-1 items-center justify-end overflow-hidden">
          <div role="menubar" className="flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((section) => (
              <motion.a
                key={section.id}
                href={section.href}
                role="menuitem"
                className={`shrink-0 px-2.5 2xl:px-3.5 py-2 rounded-xl text-xs 2xl:text-sm font-medium transition-all duration-200 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300/70 whitespace-nowrap
                  ${activeSection === section.id
                    ? 'text-white bg-[linear-gradient(135deg,rgba(194,65,12,0.94),rgba(234,88,12,0.88)_54%,rgba(245,158,11,0.84))] shadow-[0_14px_28px_rgba(120,53,15,0.34)] border border-amber-300/35'
                    : 'text-amber-100/80 hover:text-white hover:bg-amber-500/[0.12] border border-amber-500/10 hover:border-amber-400/30 hover:shadow-[0_8px_18px_rgba(120,53,15,0.28)]'
                  }`}
                onClick={handleNavClick(section)}
                whileHover={{ y: -1.5, scale: 1.02 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.7 }}
              >
                {(() => {
                  const badge = section.id === 'updates' ? updatesBadge : ('badge' in section ? section.badge : undefined);
                  return (
                <span className="inline-flex items-center gap-1.5">
                  <span>{section.label}</span>
                  {badge && (
                    <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-50/90">
                      {badge}
                    </span>
                  )}
                </span>
                  );
                })()}
                <AnimatePresence>
                  {activeSection === section.id && (
                    <motion.span
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-orange-700/90 via-orange-600/85 to-amber-500/80 rounded-md -z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                </AnimatePresence>
              </motion.a>
            ))}
            {/* Theme toggle - commented out, dark mode is default for now
            <button
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="p-2 rounded-md text-slate-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
            >
              {resolvedTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            */}
          </div>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto xl:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300/70 ${
                isOpen
                  ? 'text-white border-amber-300/35 bg-[linear-gradient(135deg,rgba(194,65,12,0.72),rgba(245,158,11,0.32))] shadow-[0_16px_28px_rgba(120,53,15,0.28)]'
                  : 'text-amber-100/80 border-amber-500/18 bg-amber-500/[0.08] hover:text-white hover:border-amber-400/35 hover:bg-amber-500/[0.16]'
              }`}
            >
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0))]" />
              {isOpen ? <XIcon className="relative z-[1] w-5 h-5" /> : <MenuIcon className="relative z-[1] w-5 h-5" />}
            </button>
          </div>
        </div>
        </div>
      </motion.nav>

      {/* Mobile menu — floating panel, does not push page content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dim backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              className="lg:hidden absolute top-full mt-3 right-3 z-50 w-72 pointer-events-auto"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div
                className="overflow-hidden rounded-[26px] border border-amber-500/22 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.7),0_0_0_1px_rgba(245,158,11,0.07)] p-3"
                style={{ background: 'linear-gradient(160deg,rgba(210,68,12,0.90) 0%,rgba(175,54,8,0.88) 100%)' }}
              >
                {/* Glass sheen */}
                <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[linear-gradient(160deg,rgba(251,191,36,0.18)_0%,rgba(245,158,11,0.06)_40%,rgba(255,255,255,0)_100%)]" />
                <div className="relative grid grid-cols-2 gap-1.5">
                  {sections.map((section) => (
                    <motion.a
                      key={section.id}
                      href={section.href}
                      variants={mobileMenuItemVariants}
                      className={`relative flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300/70 overflow-hidden
                        ${activeSection === section.id
                          ? 'text-white bg-[linear-gradient(135deg,rgba(194,65,12,0.9),rgba(234,88,12,0.82)_52%,rgba(245,158,11,0.74))] shadow-[0_14px_28px_rgba(120,53,15,0.3)] border border-amber-300/28'
                          : 'text-amber-100/80 hover:text-white bg-amber-500/[0.06] hover:bg-amber-500/[0.16] border border-amber-500/12 hover:border-amber-400/30'
                        }`}
                      onClick={handleNavClick(section)}
                      whileHover={{ y: -1.5, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {(() => {
                        const badge = section.id === 'updates' ? updatesBadge : ('badge' in section ? section.badge : undefined);
                        return (
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <span>{section.label}</span>
                        {badge && (
                          <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-50/85">
                            {badge}
                          </span>
                        )}
                      </span>
                        );
                      })()}
                    </motion.a>
                  ))}
                </div>
                <motion.div
                  variants={mobileMenuItemVariants}
                  className="mt-2 pt-2 border-t border-amber-500/20 text-center text-[10px] text-amber-300/50 tracking-wider uppercase"
                >
                  jay739.dev
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
