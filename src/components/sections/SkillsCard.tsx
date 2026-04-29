'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';

interface SkillsCardProps {
  title: string;
  skills: Array<{ name: string; url: string }>;
  delay?: number;
  onCardHover?: () => void;
  onCardLeave?: () => void;
  twoColumn?: boolean;
  highlighted?: boolean;
}

export function SkillsCard({
  title,
  skills,
  delay = 0,
  onCardHover,
  onCardLeave,
  twoColumn = false,
  highlighted = false,
}: SkillsCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className={`neural-card-soft rounded-lg border transition-colors ${
        highlighted
          ? 'border-amber-400/55 shadow-[0_0_0_1px_rgba(251,191,36,0.18)]'
          : 'border-slate-600/55 hover:border-amber-400/50'
      } ${
        twoColumn ? 'p-7' : 'p-6'
      }`}
      onMouseEnter={onCardHover}
      onMouseLeave={onCardLeave}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className={`font-bold text-amber-200 ${twoColumn ? 'text-lg' : 'text-xl'}`}>{title}</h3>
        <span className="neural-pill-intro text-[10px] px-2 py-1">{skills.length} skills</span>
      </div>
      <div className={twoColumn ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
        {skills.map((skill) => (
          <a
            key={skill.name}
            href={skill.url}
            target="_blank"
            rel="noopener noreferrer"
            title={skill.name}
            aria-label={skill.name}
            onClick={(e) => e.stopPropagation()}
            className={`neural-pill neural-pill-static text-xs sm:text-sm flex items-center gap-1 ${
              twoColumn ? 'w-full min-h-[42px] justify-center text-center px-2.5' : ''
            }`}
          >
            <DynamicIcon name={skill.name} className="text-amber-400 shrink-0" />
            <span className={twoColumn ? 'whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-[11px] sm:text-xs' : ''}>
              {skill.name}
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
} 
