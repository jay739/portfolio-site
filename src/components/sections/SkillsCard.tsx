'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';

interface SkillsCardProps {
  title: string;
  skills: Array<{ name: string; url: string }>;
  delay?: number;
  onCardHover?: () => void;
  onCardLeave?: () => void;
  twoColumn?: boolean;
}

export function SkillsCard({ title, skills, delay = 0, onCardHover, onCardLeave, twoColumn = false }: SkillsCardProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={`neural-card-soft rounded-lg border border-slate-600/55 hover:border-cyan-400/50 transition-colors ${
        twoColumn ? 'p-7' : 'p-6'
      }`}
      onMouseEnter={onCardHover}
      onMouseLeave={onCardLeave}
    >
      <h3 className={`font-bold text-cyan-200 ${twoColumn ? 'text-lg mb-5' : 'text-xl mb-4'}`}>{title}</h3>
      <div className={twoColumn ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
        {skills.map((skill, index) => {
          return (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <a 
                href={skill.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={skill.name}
                aria-label={skill.name}
                onClick={(e) => e.stopPropagation()}
                className={`neural-pill text-xs sm:text-sm hover:scale-110 flex items-center gap-1 ${
                  twoColumn ? 'w-full min-h-[42px] justify-center text-center px-2.5' : ''
                }`}
              >
                <DynamicIcon name={skill.name} />
                <span className={twoColumn ? 'whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-[11px] sm:text-xs' : ''}>
                  {skill.name}
                </span>
              </a>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 