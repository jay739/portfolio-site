'use client';

import { useEffect, useRef, useState } from 'react';

// Fade-in on scroll hook
export function useFadeInOnScroll(selector = '.fade-in') {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [selector]);
}

// Card tilt effect hook
export function useCardTilt(selector = '.tilt') {
  useEffect(() => {
    const cards = document.querySelectorAll(selector);
    
    const handleMouseMove = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      const mouseEvent = e as MouseEvent;
      const rect = card.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = '';
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [selector]);
}

// Parallax background effect hook
export function useParallaxBg(selector = '.parallax-bg', strength = 20) {
  useEffect(() => {
    const bg = document.querySelector(selector);
    if (!bg) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      (bg as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selector, strength]);
}

// Typewriter effect hook
export function useTypewriter(phrases: string[], typeSpeed = 90) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const type = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        setText(currentPhrase.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else {
        setText(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        setIsDeleting(true);
        timeoutRef.current = setTimeout(type, 900);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPhraseIndex((phraseIndex + 1) % phrases.length);
        timeoutRef.current = setTimeout(type, 400);
      } else {
        timeoutRef.current = setTimeout(type, isDeleting ? 40 : typeSpeed);
      }
    };

    timeoutRef.current = setTimeout(type, typeSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [phrases, typeSpeed, phraseIndex, charIndex, isDeleting]);

  return text;
}

// SVG morph animation hook
export function useSvgMorph(
  paths: string[],
  duration = 4000,
  elementId: string
) {
  useEffect(() => {
    let morphIdx = 0;
    let morphProgress = 0;
    let lastMorphTime = performance.now();
    let animationFrameId: number;

    const lerpPath = (a: string, b: string, t: number) => {
      const numsA = a.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const numsB = b.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const nums = numsA.map((v, i) => v + (numsB[i] - v) * t);
      return `M${nums[0]},${nums[1]} Q${nums[2]},${nums[3]} ${nums[4]},${nums[5]} T${nums[6]},${nums[7]} V${nums[8]} H${nums[9]} Z`;
    };

    const animateMorph = () => {
      const now = performance.now();
      const dt = now - lastMorphTime;
      morphProgress += dt / duration;

      if (morphProgress > 1) {
        morphProgress = 0;
        morphIdx = (morphIdx + 1) % (paths.length - 1);
      }

      const path = document.getElementById(elementId);
      if (path) {
        const d = lerpPath(paths[morphIdx], paths[morphIdx + 1], morphProgress);
        path.setAttribute('d', d);
      }

      lastMorphTime = now;
      animationFrameId = requestAnimationFrame(animateMorph);
    };

    animationFrameId = requestAnimationFrame(animateMorph);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [paths, duration, elementId]);
}

// Confetti effect hook
export function useConfetti() {
  const triggerConfetti = async (options = { particleCount: 120, spread: 80, origin: { y: 0.7 } }) => {
    if (typeof window === 'undefined') return;

    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = () => window.confetti && window.confetti(options);
      document.body.appendChild(script);
    } else {
      window.confetti(options);
    }
  };

  return triggerConfetti;
}

// Theme-aware background hook
export function useThemeAwareBg(
  elementId: string,
  lightGradient: string,
  darkGradient: string,
  lightOpacity = 0.1,
  darkOpacity = 0.15
) {
  useEffect(() => {
    const updateBgTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const path = document.getElementById(elementId);
      if (path) {
        path.setAttribute('fill', isDark ? darkGradient : lightGradient);
        (path.parentElement as HTMLElement).style.opacity = isDark ? darkOpacity.toString() : lightOpacity.toString();
      }
    };

    updateBgTheme();
    const observer = new MutationObserver(updateBgTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [elementId, lightGradient, darkGradient, lightOpacity, darkOpacity]);
}

export function fadeInOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  document.querySelectorAll('.fade-in').forEach((el) => {
    observer.observe(el);
  });
}

export function cardTilt(element: HTMLElement) {
  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

export function parallaxBg(selector: string, intensity: number = 30) {
  const elements = document.querySelectorAll(selector);
  
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const x = (clientX / innerWidth - 0.5) * intensity;
    const y = (clientY / innerHeight - 0.5) * intensity;
    
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  };

  window.addEventListener('mousemove', handleMouseMove);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}

// Add fade-in animation styles to globals.css
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .fade-in {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .fade-in-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .tilt {
      transition: transform 0.2s ease-out;
      transform-style: preserve-3d;
    }

    .glow-hover {
      transition: box-shadow 0.3s ease-in-out;
    }

    .glow-hover:hover {
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }

    .pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      }
    }
  `;
  document.head.appendChild(style);
} 