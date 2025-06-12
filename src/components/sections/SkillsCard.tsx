'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { DynamicIcon, getIconData } from '@/lib/icons';

interface SkillsCardProps {
  title: string;
  skills: string[];
  delay?: number;
}

export function SkillsCard({ title, skills, delay = 0 }: SkillsCardProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [displayedSkills, setDisplayedSkills] = useState<string[]>([]);
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
      
      for (let i = 0; i <= currentSkill.length; i++) {
        currentText = currentSkill.slice(0, i);
        setDisplayedSkills(prev => {
          const newSkills = [...prev];
          newSkills[currentSkillIndex] = currentText;
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
      className="bg-card rounded-lg p-6 border border-border hover:border-accent/50 transition-colors"
    >
      <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {displayedSkills.map((skill, index) => {
          const iconData = getIconData(skill);
          return (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                index === currentSkillIndex && isTyping
                  ? 'bg-accent/20 text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <a 
                href={iconData.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                title={skill}
                aria-label={skill}
                className="text-lg align-middle hover:text-blue-500 transition-colors"
              >
                <DynamicIcon name={skill} />
              </a>
              <span>{skill}</span>
              {index === currentSkillIndex && isTyping && (
                <span className="animate-pulse">|</span>
              )}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
} 