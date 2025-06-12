'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { DynamicIcon, getIconData } from '@/lib/icons';

interface SkillsCardProps {
  title: string;
  skills: Array<{ name: string; url: string }>;
  delay?: number;
}

export function SkillsCard({ title, skills, delay = 0 }: SkillsCardProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [displayedSkills, setDisplayedSkills] = useState<Array<{ name: string; url: string }>>([]);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const typeSkill = async () => {
      if (currentSkillIndex >= skills.length) return;

      setIsTyping(true);
      const currentSkill = skills[currentSkillIndex];
      let currentText = '';
      
      for (let i = 0; i <= currentSkill.name.length; i++) {
        currentText = currentSkill.name.slice(0, i);
        setDisplayedSkills(prev => {
          const newSkills = [...prev];
          newSkills[currentSkillIndex] = { name: currentText, url: currentSkill.url };
          return newSkills;
        });
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setIsTyping(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentSkillIndex(prev => prev + 1);
    };

    typeSkill();
  }, [mounted, currentSkillIndex, skills]);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="bg-white dark:bg-slate-700 rounded-lg p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-600/50 transition-colors"
    >
      <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {displayedSkills.map((skill, index) => {
          const iconData = getIconData(skill.name);
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
                className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium shadow hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-1"
              >
                <DynamicIcon name={skill.name} />
                <span>{skill.name}</span>
                {index === currentSkillIndex && isTyping && (
                  <span className="animate-pulse text-white">|</span>
                )}
              </a>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 