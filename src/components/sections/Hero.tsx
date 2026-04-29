'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ANIMATION } from '@/lib/constants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTypewriter } from '@/lib/effects';
import NeuralNetworkViz from '@/components/ui/NeuralNetworkViz';
import { FaGithub, FaBriefcase, FaEnvelope, FaStar } from 'react-icons/fa';

const greeting = "ML/AI Engineer building production RAG pipelines, LLM systems,\nand self-hosted AI infrastructure — from model to deployment.";
const name = "Jayakrishna Konda";
const taglines = [
  "ML/AI Engineer",
  "Data Scientist",
  "MLOps & DevOps",
  "Self-Hosted AI Builder"
];
const links = {

  resume: "/documents/Jayakrishna_Konda_Resume_FINAL.pdf",
  github: "https://github.com/jay739",
  linkedin: "https://www.linkedin.com/in/jaya-krishna-konda/",
  email: "mailto:contact@jay739.dev"
};

export default function Hero() {
  const typewriterText = useTypewriter(taglines, 90);
  const [visitorMessage, setVisitorMessage] = useState<string>('');

  const prefersReducedMotion = useReducedMotion();
  const framerReducedMotion = useFramerReducedMotion();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const cachedMessage =
          typeof window !== 'undefined' ? sessionStorage.getItem('visitor_message') : null;
        if (cachedMessage) {
          setVisitorMessage(cachedMessage);
          return;
        }

        // Use sessionStorage to only increment once per session
        const hasCounted = typeof window !== 'undefined' && sessionStorage.getItem('visitor_counted');
        const url = hasCounted ? '/api/total-visitors?readonly=true' : '/api/total-visitors';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        clearTimeout(timeoutId);
        const data = await res.json();
        const message = data.message || `You're the ${data.totalVisitors}th visitor!`;
        setVisitorMessage(message);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('visitor_message', message);
        }
        if (typeof window !== 'undefined' && !hasCounted) {
          sessionStorage.setItem('visitor_counted', '1');
        }
      } catch {
        setVisitorMessage('Welcome visitor!');
      }
    }
    
    fetchVisitors();
  }, []);

  // Decorative info overlay removed - date now shown in floating time widget



  const motionProps = prefersReducedMotion || framerReducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : ANIMATION.MOTION.HERO;
  const ctaGroupVariants = prefersReducedMotion || framerReducedMotion
    ? {}
    : {
        initial: 'hidden',
        animate: 'visible',
        variants: {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.28,
            },
          },
        },
      };
  const ctaItemVariants = prefersReducedMotion || framerReducedMotion
    ? {}
    : {
        variants: {
          hidden: { opacity: 0, y: 10, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.42, ease: 'easeOut' },
          },
        },
        whileHover: { y: -2, scale: 1.015, transition: { duration: 0.18, ease: 'easeOut' } },
        whileTap: { scale: 0.985 },
      };
  const socialItemMotion = prefersReducedMotion || framerReducedMotion
    ? {}
    : {
        whileHover: { y: -2, scale: 1.04, transition: { duration: 0.18, ease: 'easeOut' } },
        whileTap: { scale: 0.98 },
      };

  return (
    <section 
      className="relative w-full h-[calc(100svh-3.5rem)] mt-14 flex flex-col justify-center items-center text-center px-0 overflow-visible"
      role="banner"
      aria-label="Hero section"
      id="welcome"
    >
      {/* Neural Network Visualization Background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <NeuralNetworkViz
          scrollProgress={0}
          isActive={true}
          isDark={resolvedTheme !== 'light'}
          mode="orbit"
          showControls={false}
          interactive={false}
          transparentBackground
          orbitRadiusScale={1.9}
          orbitCenterYOffset={-10}
          orbitEdgePadding={20}
        />
      </div>
      {/* Overlay so text stays readable */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: resolvedTheme === 'light'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(240,244,255,0.6) 70%, rgba(230,236,248,0.85) 100%)'
            : 'linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.06) 55%, rgba(15,23,42,0.1) 100%)'
        }}
      />
      <motion.div
        {...motionProps}
        className="relative z-10 w-full py-4 sm:py-5 -translate-y-8 sm:-translate-y-10 md:-translate-y-12 px-3 sm:px-0"
      >
        {/* Visitor Count Display - Above Name */}
        <motion.div 
          className="mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-xs md:text-sm font-medium px-2.5 py-1 rounded-full inline-block border neural-float"
            style={{
              color: resolvedTheme === 'light' ? '#92400e' : '#fcd34d',
              background: resolvedTheme === 'light' ? 'rgba(254,243,199,0.75)' : 'rgba(120,53,15,0.28)',
              borderColor: resolvedTheme === 'light' ? 'rgba(245,158,11,0.4)' : 'rgba(251,191,36,0.38)'
            }}>
            <FaStar className="inline text-amber-400 mr-1" /> {visitorMessage || 'Welcome!'} <FaStar className="inline text-amber-400 ml-1" />
          </p>
        </motion.div>
        <motion.div
          className="mx-auto w-full max-w-xl neural-card neural-card-no-wave neural-glow-border px-4 py-5 md:px-6 md:py-7 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[24px] opacity-70"
            style={{
              background: 'radial-gradient(circle at 50% 35%, rgba(245,158,11,0.18), transparent 42%)',
            }}
          />
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2"
            style={{
              color: resolvedTheme === 'light' ? '#111827' : '#ffffff',
              textShadow: resolvedTheme === 'light' ? '0 6px 20px rgba(245,158,11,0.2)' : '0 0 40px rgba(245,158,11,0.38), 0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            {name}
          </h1>
          <h2
            className="text-xs sm:text-sm md:text-base mb-2 font-medium"
            style={{ color: resolvedTheme === 'light' ? '#334155' : '#d1d5db' }}
          >
            {greeting}
          </h2>
          <div 
            className="text-sm sm:text-base md:text-xl mb-4 max-w-lg mx-auto font-mono"
            role="status" 
            aria-live="polite"
            aria-label="Current role"
            style={{ color: resolvedTheme === 'light' ? '#b45309' : '#fbbf24' }}
          >
            {typewriterText}
            <span className="blinking-cursor ml-0.5" aria-hidden="true">|</span>
          </div>
          <motion.div
            className="mt-1 flex flex-col items-center gap-3"
            role="group"
            aria-label="Main actions"
            {...ctaGroupVariants}
          >
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <motion.div {...ctaItemVariants}>
                <Link
                  href={links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neural-pill text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center"
                  aria-label="View Resume"
                >
                  Resume
                </Link>
              </motion.div>
              <motion.div {...ctaItemVariants}>
                <Link
                  href="/contact"
                  prefetch={false}
                  className="neural-pill text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center"
                  aria-label="Go to contact page"
                >
                  Contact
                </Link>
              </motion.div>
            </div>
            <motion.div className="flex justify-center" {...ctaItemVariants}>
              <Link href="/skills" prefetch={false} className="neural-pill text-xs sm:text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center" aria-label="Open full neural skills map">
                Explore Full Skills Map
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        {/* Hint to explore full map */}
        <motion.p
          className="mt-5 text-slate-400 text-xs tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          Nodes orbit this profile summary. Open Skills for full graph controls, filters, and node search.
        </motion.p>
        {/* Simplified Social Links */}
        <motion.nav 
          className="flex flex-wrap gap-3 mt-6 justify-center" 
          aria-label="Social links"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            {
              href: links.github,
              icon: <FaGithub className="text-amber-400" />,
              label: "GitHub",
              color: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600",
              hoverColor: "hover:from-gray-700 hover:to-gray-900 dark:hover:from-gray-300 dark:hover:to-gray-500"
            },
            {
              href: links.linkedin,
              icon: <FaBriefcase className="text-amber-400" />,
              label: "LinkedIn", 
              color: "from-amber-600 to-orange-700 dark:from-amber-400 dark:to-orange-500",
              hoverColor: "hover:from-amber-700 hover:to-orange-800 dark:hover:from-amber-300 dark:hover:to-orange-400"
            },
            {
              href: links.email,
              icon: <FaEnvelope className="text-amber-400" />,
              label: "Email",
              color: "from-orange-600 to-amber-700 dark:from-orange-400 dark:to-amber-500", 
              hoverColor: "hover:from-orange-700 hover:to-amber-800 dark:hover:from-orange-300 dark:hover:to-amber-400"
            }
          ].map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target={social.label !== "Email" ? "_blank" : undefined}
              rel={social.label !== "Email" ? "noopener noreferrer" : undefined}
              aria-label={`${social.label === "Email" ? "Send me an email" : `Visit my ${social.label} profile`}`}
              className="neural-pill-intro text-sm neural-hover-lift"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.9 + (index * 0.1), 
                duration: 0.5,
                type: "spring",
                stiffness: 100
              }}
              {...socialItemMotion}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>{social.icon}</span>
                <span>{social.label}</span>
              </span>
            </motion.a>
          ))}
        </motion.nav>
      </motion.div>
    </section>
  );
} 
