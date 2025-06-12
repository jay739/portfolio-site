'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface Tool {
  title: string;
  description: string;
  href: string;
}

const tools: Tool[] = [
  {
    title: 'PDF to Podcast',
    description: 'Convert PDFs into audio podcasts using LLMs and TTS models.',
    href: '/tools/pdf-to-podcast'
  },
  {
    title: 'RAG Chatbot',
    description: 'Chatbot with retrieval-augmented generation, trained on your docs.',
    href: '/tools/rag-chatbot'
  },
  {
    title: 'AI Image Generator',
    description: 'Generate images from text prompts using Stable Diffusion.',
    href: '/tools/ai-image-generator'
  }
];

const morphPaths = [
  "M0,200 Q175,100 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,100 350,200 T700,200 V300 H0 Z"
];

export default function AiToolsLab() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<number>();
  const morphIdx = useRef(0);
  const morphProgress = useRef(0);
  const lastMorphTime = useRef(performance.now());
  const morphDuration = 4000;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    function lerpPath(a: string, b: string, t: number) {
      const numsA = a.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const numsB = b.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const nums = numsA.map((v, i) => v + (numsB[i] - v) * t);
      return `M${nums[0]},${nums[1]} Q${nums[2]},${nums[3]} ${nums[4]},${nums[5]} T${nums[6]},${nums[7]} V${nums[8]} H${nums[9]} Z`;
    }

    function animateMorph() {
      const now = performance.now();
      const dt = now - lastMorphTime.current;
      morphProgress.current += dt / morphDuration;

      if (morphProgress.current > 1) {
        morphProgress.current = 0;
        morphIdx.current = (morphIdx.current + 1) % (morphPaths.length - 1);
      }

      if (pathRef.current) {
        const d = lerpPath(
          morphPaths[morphIdx.current],
          morphPaths[morphIdx.current + 1],
          morphProgress.current
        );
        pathRef.current.setAttribute('d', d);
      }

      lastMorphTime.current = now;
      animationRef.current = requestAnimationFrame(animateMorph);
    }

    animationRef.current = requestAnimationFrame(animateMorph);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mounted]);

  const handleDemoClick = async () => {
    if (typeof window !== 'undefined' && !window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = () => {
        if (window.confetti) {
          window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
        }
      };
      document.body.appendChild(script);
    } else if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    }
  };

  if (!mounted) return null;

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ai-gradient-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="ai-gradient-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={morphPaths[0]}
          fill={`url(#ai-gradient-${theme === 'dark' ? 'dark' : 'light'})`}
        />
      </svg>

      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🧪 AI Tools Lab
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="transform transition-all duration-300 bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6 flex flex-col items-center fade-in tilt glow-hover"
              aria-label={tool.title}
            >
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
                {tool.description}
              </p>
              <a
                href={tool.href}
                onClick={e => {
                  handleDemoClick();
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label={`Try ${tool.title} Demo`}
              >
                Try Demo
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 