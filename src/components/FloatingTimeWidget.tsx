'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const FloatingTimeWidget: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const { resolvedTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString(undefined, { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      const dateString = now.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      
      setTime(timeString);
      setDate(dateString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  // Handle scroll to hide/show widget
  useEffect(() => {
    if (!mounted) return;

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if we're at the very top
      setIsAtTop(currentScrollY < 50);
      
      // Show when scrolling up, hide when scrolling down fast
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY - lastScrollY > 10) {
        setIsVisible(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    widgetRef.current!.style.cursor = 'grabbing';
    widgetRef.current!.dataset.dragStartX = String(e.clientX - position.x);
    widgetRef.current!.dataset.dragStartY = String(e.clientY - position.y);
    document.body.style.userSelect = 'none';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dragStartX = Number(widgetRef.current!.dataset.dragStartX);
    const dragStartY = Number(widgetRef.current!.dataset.dragStartY);
    setPosition({ x: e.clientX - dragStartX, y: e.clientY - dragStartY });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
    if (widgetRef.current) widgetRef.current.style.cursor = 'grab';
    document.body.style.userSelect = '';
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={widgetRef}
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.4 
          }}
          className={`fixed z-40 pointer-events-auto transition-all duration-300 ${isAtTop ? 'top-20' : 'top-4'}`}
          style={{ right: 16 + position.x, top: (isAtTop ? 80 : 16) + position.y, cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
        >
          <motion.div
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            className="relative"
          >
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-1 right-1 z-10 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-500 hover:text-white text-gray-700 dark:text-gray-200"
              aria-label="Close time widget"
              style={{ fontSize: 14 }}
            >
              ×
            </button>
            {/* Glow effect background */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(124, 58, 237, 0.3))',
                filter: 'blur(8px)',
                transform: 'scale(1.1)'
              }}
            />
            
            {/* Main widget container */}
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-2xl p-4 shadow-2xl">
              {/* Time display with animated digits */}
              <motion.div 
                className="flex items-center justify-center mb-2"
                key={time} // Re-animate when time changes
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-wider">
                  {time.split('').map((char, index) => (
                    <motion.span
                      key={`${char}-${index}`}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ 
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Date display */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                  {date}
                </div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              
              {/* Animated border */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, ${isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.5)'}, transparent, ${isDark ? 'rgba(147, 51, 234, 0.5)' : 'rgba(124, 58, 237, 0.5)'}, transparent, ${isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(37, 99, 235, 0.5)'})`,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  padding: '1px',
                  animation: 'spin 8s linear infinite'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingTimeWidget; 