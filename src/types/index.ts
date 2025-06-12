import { HTMLAttributes, InputHTMLAttributes } from 'react';

// ----------------- CORE TYPES ------------------
export interface Image {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Video {
  src: string;
  type?: string;
}

export interface Widget {
  id?: string;
  isDark?: boolean;
  bg?: string;
  className?: string;
}

export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
  className?: string;
}

// ----------------- COMPONENTS ------------------
export interface CallToAction extends Omit<HTMLAttributes<HTMLAnchorElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link';
  text?: string;
  icon?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface Item {
  title?: string;
  description?: string;
  icon?: string;
  className?: string;
  callToAction?: CallToAction;
  image?: Image;
}

export interface Stat {
  amount?: number | string;
  title?: string;
  icon?: string;
}

export interface TimelineItem {
  title: string;
  subtitle?: string;
  description: string;
  date: string;
  details?: string[];
  icon?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  defaultIcon?: string;
  className?: string;
}

export interface Project {
  title: string;
  description: string;
  image?: Image;
  link?: string;
  technologies?: string[];
  github?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  date: string;
  description?: string;
  gpa?: string;
  courses?: string[];
}

export interface Skill {
  name: string;
  level: number;
  category: 'frontend' | 'backend' | 'devops' | 'data' | 'other';
}

export interface ServerGalleryItem {
  title: string;
  description: string;
  image: Image;
  link?: string;
  technologies?: string[];
}

export interface AiTool {
  name: string;
  description: string;
  link: string;
  category: string;
  icon?: string;
}

export interface ImpactStat {
  value: number | string;
  label: string;
  icon?: string;
  suffix?: string;
}

// ----------------- LAYOUT COMPONENTS ------------------
export interface HeaderProps {
  className?: string;
}

export interface FooterProps {
  className?: string;
}

// ----------------- SECTION COMPONENTS ------------------
export interface HeroProps extends Widget {
  greeting?: string;
  name: string;
  taglines: string[];
  links: {
    server?: string;
    resume?: string;
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface SummaryProps extends Widget {
  content: string;
}

export interface EducationProps extends Widget {
  items: EducationItem[];
}

export interface SkillsChartProps extends Widget {
  skills: Skill[];
}

export interface ProjectsProps extends Widget {
  projects: Project[];
}

export interface HomeServerGalleryProps extends Widget {
  items: ServerGalleryItem[];
}

export interface AiToolsLabProps extends Widget {
  tools: AiTool[];
}

export interface ImpactStatsProps extends Widget {
  stats: ImpactStat[];
}

export interface DashboardProps extends Widget {
  stats: {
    commits?: number;
    repositories?: number;
    contributions?: number;
  };
}

export interface AiNewsProps extends Widget {
  news: Array<{
    title: string;
    link: string;
    date: string;
  }>;
}

export interface GitHubClockProps extends Widget {
  username: string;
} 