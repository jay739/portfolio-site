'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { ANIMATION } from '@/lib/constants';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useTypewriter } from '@/lib/effects';
import NeuralNetworkViz from '@/components/NeuralNetworkViz';

// Dynamically import confetti with no SSR
const ConfettiButton = dynamic(() => import('./ConfettiButton'), {
  ssr: false,
  loading: () => (
    <Link
      href="https://homarr.jay739.dev"
      className="px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition hover:scale-105 shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      aria-label="Access Home Server"
    >
      🏠 Access Home Server
    </Link>
  ),
});

const greeting = "Full Stack Developer & DevOps Engineer specializing in AI/ML,\nData Science, and Home Server solutions.";
const name = "Jayakrishna Konda";
const taglines = [
  "AI/ML Engineer",
  "Data Scientist",
  "DevOps",
  "Home Server Enthusiast"
];
const links = {
  server: "https://homarr.jay739.dev",
  resume: "/documents/Jayakrishna_Konda_Resume_FINAL.pdf",
  github: "https://github.com/jay739",
  linkedin: "https://www.linkedin.com/in/jaya-krishna-konda/",
  email: "mailto:contact@jay739.dev"
};

export default function Hero() {
  const typewriterText = useTypewriter(taglines, 90);
  const [visitorMessage, setVisitorMessage] = useState<string>('');
  const [cardGlow, setCardGlow] = useState({ x: 50, y: 50 });

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

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-0 overflow-hidden"
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
          orbitRadiusScale={2.25}
          orbitCenterYOffset={-24}
          orbitEdgePadding={28}
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
        className="relative z-10 w-full py-4 sm:py-5 -mt-10 sm:-mt-12"
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
              color: resolvedTheme === 'light' ? '#1e3a8a' : '#93c5fd',
              background: resolvedTheme === 'light' ? 'rgba(219,234,254,0.7)' : 'rgba(30,64,175,0.25)',
              borderColor: resolvedTheme === 'light' ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.4)'
            }}>
            ✨ {visitorMessage || 'Welcome!'} ✨
          </p>
        </motion.div>
        <motion.div
          className="mx-auto max-w-xl neural-card neural-glow-border px-4 py-5 md:px-6 md:py-7 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;
            setCardGlow({ x, y });
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[24px] opacity-70"
            style={{
              background: `radial-gradient(circle at ${cardGlow.x}% ${cardGlow.y}%, rgba(56,189,248,0.22), transparent 40%)`,
            }}
          />
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-2"
            style={{
              color: resolvedTheme === 'light' ? '#111827' : '#ffffff',
              textShadow: resolvedTheme === 'light' ? '0 6px 20px rgba(59,130,246,0.2)' : '0 0 40px rgba(139,92,246,0.5), 0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            {name}
          </h1>
          <h2
            className="text-sm md:text-lg mb-2 font-medium whitespace-pre-line"
            style={{ color: resolvedTheme === 'light' ? '#334155' : '#cbd5f5' }}
          >
            {greeting}
          </h2>
          <div 
            className="text-base md:text-xl mb-4 max-w-lg mx-auto font-mono"
            role="status" 
            aria-live="polite"
            aria-label="Current role"
            style={{ color: resolvedTheme === 'light' ? '#4f46e5' : '#c4b5fd' }}
          >
            {typewriterText}
            <span className="blinking-cursor ml-0.5" aria-hidden="true">|</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center" role="group" aria-label="Main actions">
            <Link
              href={links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="neural-pill text-xs sm:text-sm px-3 py-1.5"
              aria-label="View Resume"
            >
              Resume
            </Link>
            <Link
              href="/contact"
              prefetch={false}
              className="neural-pill text-xs sm:text-sm px-3 py-1.5"
              aria-label="Go to contact page"
            >
              Contact
            </Link>
            <ConfettiButton />
          </div>
          <div className="mt-3 flex justify-center">
            <Link href="/skills" prefetch={false} className="neural-pill text-xs sm:text-sm px-3 py-1.5" aria-label="Open full neural skills map">
              Explore Full Skills Map
            </Link>
          </div>
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
              icon: "🚀",
              label: "GitHub",
              color: "from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600",
              hoverColor: "hover:from-gray-700 hover:to-gray-900 dark:hover:from-gray-300 dark:hover:to-gray-500"
            },
            {
              href: links.linkedin,
              icon: "💼",
              label: "LinkedIn", 
              color: "from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600",
              hoverColor: "hover:from-blue-700 hover:to-blue-900 dark:hover:from-blue-300 dark:hover:to-blue-500"
            },
            {
              href: links.email,
              icon: "✉️",
              label: "Email",
              color: "from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600", 
              hoverColor: "hover:from-purple-700 hover:to-purple-900 dark:hover:from-purple-300 dark:hover:to-purple-500"
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
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
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