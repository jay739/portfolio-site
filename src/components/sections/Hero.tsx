'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ANIMATION } from '@/lib/constants';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { useClickSound } from '@/lib/hooks/useClickSound';
import ContactButton from '@/components/ContactButton';
import { useTypewriter } from '@/lib/effects';
import Image from 'next/image';

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

const greeting = "Full Stack Developer & DevOps Engineer specializing in AI/ML, Data Science, and Home Server solutions.";
const name = "Jayakrishna Konda";
const taglines = [
  "AI/ML Engineer",
  "Data Scientist",
  "DevOps",
  "Home Server Enthusiast"
];
const links = {
  server: "https://homarr.jay739.dev",
  resume: "/documents/Jayakrishna_Konda_Resume.pdf",
  github: "https://github.com/jay739",
  linkedin: "https://www.linkedin.com/in/jaya-krishna-konda/",
  email: "mailto:contact@jay739.dev"
};

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const typewriterText = useTypewriter(taglines, 90);
  const typewriterRef = useRef<HTMLSpanElement>(null);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [visitorMessage, setVisitorMessage] = useState<string>('');

  const { playClick } = useClickSound();
  const prefersReducedMotion = useReducedMotion();
  const framerReducedMotion = useFramerReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const res = await fetch('/api/total-visitors');
        const data = await res.json();
        setVisitorCount(data.totalVisitors || 0);
        setVisitorMessage(data.message || `You're the ${data.totalVisitors}th visitor!`);
      } catch {
        setVisitorCount(0);
        setVisitorMessage('Welcome visitor!');
      }
    }
    
    // Only fetch once when component mounts - don't want to increment on every refresh
    fetchVisitors();
  }, []);



  const handleTypewriter = useCallback(() => {
    if (!mounted || isPaused) return;

    const currentPhrase = taglines[phraseIndex];
    const shouldDelete = isDeleting;
    const currentLength = currentPhrase.length;

    if (!shouldDelete && currentLength === currentPhrase.length) {
      setTimeout(() => {
        setIsDeleting(true);
      }, ANIMATION.TYPEWRITER.PAUSE_TIME);
      return;
    }

    if (shouldDelete && currentLength === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % taglines.length);
      setTimeout(handleTypewriter, ANIMATION.TYPEWRITER.INITIAL_DELAY);
      return;
    }

    const delta = shouldDelete ? -1 : 1;
    setCurrentPhrase(currentPhrase.substring(0, currentLength + delta));
    setTimeout(
      handleTypewriter,
      shouldDelete ? ANIMATION.TYPEWRITER.DELETE_SPEED : ANIMATION.TYPEWRITER.TYPE_SPEED
    );
  }, [mounted, phraseIndex, isDeleting, isPaused]);

  useEffect(() => {
    if (!mounted) return;
    const timeout = setTimeout(handleTypewriter, ANIMATION.TYPEWRITER.TYPE_SPEED);
    return () => clearTimeout(timeout);
  }, [mounted, handleTypewriter]);

  const toggleTypewriter = () => {
    setIsPaused(prev => !prev);
  };

  if (!mounted) return null;

  // Decorative info overlay removed - date now shown in floating time widget



  const motionProps = prefersReducedMotion || framerReducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : ANIMATION.MOTION.HERO;

  return (
    <section 
      className="relative w-full min-h-screen flex flex-col justify-center items-center text-center px-0 overflow-hidden fade-in-up"
      role="banner"
      aria-label="Hero section"
      id="welcome"
    >
      {/* Decorative info overlay removed - date now shown in floating time widget */}
      {/* Animated SVG Waves at the bottom */}
      <svg
        className="absolute left-0 bottom-0 w-full h-40 -z-10"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,154.7C840,149,960,171,1080,186.7C1200,203,1320,213,1380,218.7L1440,224V320H1380C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320H0V160Z"
          fill="url(#wave-gradient)"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="wave-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1fd1f9" />
            <stop offset="100%" stopColor="#ff6ec4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Second layered wave */}
      <svg
        className="absolute left-0 bottom-0 w-full h-48 -z-20"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M0,192L80,186.7C160,181,320,171,480,154.7C640,139,800,117,960,128C1120,139,1280,181,1360,202.7L1440,224V320H1360C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320H0V192Z"
          fill="url(#wave-gradient2)"
          opacity="0.4"
        />
        <defs>
          <linearGradient id="wave-gradient2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        {...motionProps}
        className="relative z-10 w-full py-16 fade-in-up"
      >
        {/* Visitor Count Display - Above Name */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg md:text-xl font-medium text-blue-600 dark:text-blue-400 opacity-90 dark:opacity-100 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full inline-block border border-blue-200 dark:border-blue-800">
            ✨ {visitorMessage || 'Welcome!'} ✨
          </p>
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white drop-shadow-lg">
          {name}
        </h1>
        <h2 className="text-lg md:text-2xl mb-2 text-gray-700 dark:text-gray-300 font-medium">
          {greeting}
        </h2>
        <div 
          className="text-xl md:text-2xl mb-6 max-w-xl mx-auto font-mono text-blue-600 dark:text-blue-300" 
          role="status" 
          aria-live="polite"
          aria-label="Current role"
        >
          {typewriterText}
          <span className="blinking-cursor text-blue-400 ml-0.5" aria-hidden="true">|</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Main actions">
          <ConfettiButton />
          <Link
            href={links.resume}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClick()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition hover:scale-105 shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none text-white"
            aria-label="View Resume"
          >
            📄 View Resume
          </Link>
        </div>
        <div className="mt-8 flex justify-center">
          <a
            href="/contact"
            onClick={playClick}
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold shadow-lg transform transition hover:scale-105 hover:shadow-xl hover:brightness-110 text-lg md:text-xl"
            aria-label="Go to contact page"
          >
            Contact Me
          </a>
        </div>
        {/* Modern Social Links */}
        <motion.nav 
          className="flex gap-6 mt-8 justify-center" 
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
              onClick={() => playClick()}
              className={`
                group relative overflow-hidden rounded-full px-6 py-3 transition-all duration-300
                bg-gradient-to-br ${social.color} ${social.hoverColor}
                hover:scale-110 hover:shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2
                transform-gpu will-change-transform
              `}
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
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon container */}
              <motion.div 
                className="relative flex items-center gap-2 text-white"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span 
                  className="text-lg"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360 
                  }}
                  transition={{ 
                    duration: 0.5,
                    type: "spring"
                  }}
                >
                  {social.icon}
                </motion.span>
                <span className="text-sm font-medium tracking-wide">
                  {social.label}
                </span>
              </motion.div>

              {/* Animated border */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-white/20 opacity-0 group-hover:opacity-100"
                initial={false}
                whileHover={{
                  opacity: 1,
                  transition: { duration: 0.3 }
                }}
              />

              {/* Ripple effect on click */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-white/10 scale-0 group-active:scale-100"
                transition={{ duration: 0.2 }}
              />
            </motion.a>
          ))}
        </motion.nav>
      </motion.div>
    </section>
  );
} 