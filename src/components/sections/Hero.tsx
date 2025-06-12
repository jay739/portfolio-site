'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ANIMATION } from '@/lib/constants';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import ContactButton from '@/components/ContactButton';
import { useTypewriter } from '@/lib/effects';

// Dynamically import confetti with no SSR
const ConfettiButton = dynamic(() => import('./ConfettiButton'), {
  ssr: false,
  loading: () => (
    <Link
      href="https://homarr.jay739.dev"
      className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition hover:scale-105 shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
  resume: "/resume.pdf",
  github: "https://github.com/jay739",
  linkedin: "https://www.linkedin.com/in/jaya-krishna-konda/",
  email: "mailto:jayakrishnakonda@jay739.dev"
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
  const [time, setTime] = useState<string | null>(null);
  
  const prefersReducedMotion = useReducedMotion();
  const framerReducedMotion = useFramerReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchVisitors() {
      try {
        const res = await fetch('/api/active-users');
        const data = await res.json();
        setVisitorCount(data.activeUsers || 0);
      } catch {
        setVisitorCount(0);
      }
    }
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(interval);
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

  if (!mounted || !time) return null;

  // Decorative info overlay
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'short' });
  const date = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const visitorsString = `${visitorCount} VISITORS`;
  const infoOverlay = (
    <>
    <div className="flex flex-col items-center justify-center w-full h-full">
      <span className="text-6xl md:text-8xl font-extrabold text-gray-400 dark:text-gray-600 opacity-5 whitespace-nowrap uppercase">{visitorsString}</span>
    </div>
    <div className="flex flex-col items-center justify-center w-full h-full">
      <span className="text-4xl md:text-6xl font-extrabold text-gray-400 dark:text-gray-600 opacity-5 whitespace-nowrap mt-2">{date}, {day}</span>
    </div>
    </>
  );

  const timeOverlay = (
    <div className="absolute left-1/16 top-3/4 -translate-y-1/2 z-0 flex items-center" style={{height: '100%'}}>
      <span className="origin-left text-7xl md:text-9xl font-extrabold text-gray-400 dark:text-gray-600 opacity-10 whitespace-nowrap select-none">
        {time}
      </span>
    </div>
  );

  const motionProps = prefersReducedMotion || framerReducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : ANIMATION.MOTION.HERO;

  return (
    <section 
      className="relative w-screen min-h-screen flex flex-col justify-center items-center text-center px-0 overflow-hidden fade-in-up"
      role="banner"
      aria-label="Hero section"
      id="welcome"
    >
      {/* Decorative info overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {infoOverlay}
        {timeOverlay}
      </div>
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
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded transition hover:scale-105 shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none text-white"
            aria-label="Download Resume"
            download
          >
            📄 Download Resume
          </Link>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold shadow-lg transform transition hover:scale-105 hover:shadow-xl hover:brightness-110 text-lg md:text-xl"
            aria-label="Scroll to contact section"
          >
            Contact Me
          </button>
        </div>
        <nav className="flex gap-4 mt-6 justify-center text-blue-600 dark:text-blue-300" aria-label="Social links">
          <a 
            href={links.github} 
            target="_blank" 
            aria-label="Visit my GitHub profile" 
            rel="noopener noreferrer"
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            💻 GitHub
          </a>
          <a 
            href={links.linkedin} 
            target="_blank" 
            aria-label="Visit my LinkedIn profile" 
            rel="noopener noreferrer"
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            👤 LinkedIn
          </a>
          <a 
            href={links.email} 
            aria-label="Send me an email"
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            📧 Email
          </a>
        </nav>
      </motion.div>
    </section>
  );
} 