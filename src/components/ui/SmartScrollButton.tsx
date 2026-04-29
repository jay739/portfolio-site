'use client';

import { useEffect, useRef, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartScrollButton() {
  const [visible, setVisible] = useState(false);
  const footerObserverRef = useRef<IntersectionObserver | null>(null);
  const footerVisibleRef = useRef(false);

  useEffect(() => {
    // Hide when footer enters viewport
    const footer = document.querySelector('footer');
    if (footer) {
      footerObserverRef.current = new IntersectionObserver(
        ([entry]) => {
          footerVisibleRef.current = entry.isIntersecting;
          setVisible(window.scrollY > 320 && !entry.isIntersecting);
        },
        { threshold: 0.01 }
      );
      footerObserverRef.current.observe(footer);
    }

    const handleScroll = () => {
      setVisible(window.scrollY > 320 && !footerVisibleRef.current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      footerObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, y: 24, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.15, boxShadow: '0 0 28px rgba(245,158,11,0.6)' }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/60 bg-slate-900/90 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          style={{ boxShadow: '0 0 18px rgba(245,158,11,0.35)' }}
          aria-label="Back to top"
        >
          {/* Pulse ring */}
          <motion.span
            className="absolute inset-0 rounded-full border border-amber-400/40"
            animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <FaArrowUp className="relative z-10 text-amber-400 text-sm" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
