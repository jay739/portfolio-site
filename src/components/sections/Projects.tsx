'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';
import type { Project } from '@/types/project';
import { GitHubIcon, ExternalLinkIcon } from '@/components/icons/icons';
import { Tag, X, ChevronLeft, ChevronRight, Search, Star, Copy, Volume2, VolumeX } from 'lucide-react';
import FilterChip from '@/components/ui/FilterChip';

interface ProjectsProps {
  projects: Project[];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const techIconMap: Record<string, { icon: JSX.Element, url: string, label: string }> = {
  'Python': { icon: <DynamicIcon name="python" />, url: 'https://www.python.org/', label: 'Python' },
  'JavaScript': { icon: <DynamicIcon name="javascript" />, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', label: 'JavaScript' },
  'TypeScript': { icon: <DynamicIcon name="typescript" />, url: 'https://www.typescriptlang.org/', label: 'TypeScript' },
  'React': { icon: <DynamicIcon name="react" />, url: 'https://react.dev/', label: 'React' },
  'Next.js': { icon: <DynamicIcon name="next.js" />, url: 'https://nextjs.org/', label: 'Next.js' },
  'Astro': { icon: <DynamicIcon name="astro" />, url: 'https://astro.build/', label: 'Astro' },
  'Node.js': { icon: <DynamicIcon name="node.js" />, url: 'https://nodejs.org/', label: 'Node.js' },
  'Docker': { icon: <DynamicIcon name="docker" />, url: 'https://www.docker.com/', label: 'Docker' },
  'Kubernetes': { icon: <DynamicIcon name="kubernetes" />, url: 'https://kubernetes.io/', label: 'Kubernetes' },
  'Linux': { icon: <DynamicIcon name="linux" />, url: 'https://www.linux.org/', label: 'Linux' },
  'CI/CD': { icon: <DynamicIcon name="ci/cd" />, url: 'https://en.wikipedia.org/wiki/CI/CD', label: 'CI/CD' },
  'Portainer': { icon: <DynamicIcon name="portainer" />, url: 'https://www.portainer.io/', label: 'Portainer' },
  'Nginx': { icon: <DynamicIcon name="nginx" />, url: 'https://nginx.org', label: 'Nginx' },
  'Uptime Kuma': { icon: <DynamicIcon name="uptime kuma" />, url: 'https://github.com/louislam/uptime-kuma', label: 'Uptime Kuma' },
  'TensorFlow': { icon: <DynamicIcon name="tensorflow" />, url: 'https://www.tensorflow.org/', label: 'TensorFlow' },
  'PyTorch': { icon: <DynamicIcon name="pytorch" />, url: 'https://pytorch.org/', label: 'PyTorch' },
  'NLP': { icon: <DynamicIcon name="nlp" />, url: 'https://en.wikipedia.org/wiki/Natural_language_processing', label: 'NLP' },
  'Computer Vision': { icon: <DynamicIcon name="computer vision" />, url: 'https://en.wikipedia.org/wiki/Computer_vision', label: 'Computer Vision' },
  'MLOps': { icon: <DynamicIcon name="mlops" />, url: 'https://en.wikipedia.org/wiki/MLOps', label: 'MLOps' },
  'Pandas': { icon: <DynamicIcon name="pandas" />, url: 'https://pandas.pydata.org/', label: 'Pandas' },
  'Scikit-learn': { icon: <DynamicIcon name="scikit-learn" />, url: 'https://scikit-learn.org/', label: 'Scikit-learn' },
  'LangChain': { icon: <DynamicIcon name="langchain" />, url: 'https://www.langchain.com/', label: 'LangChain' },
  'Ollama': { icon: <DynamicIcon name="ollama" />, url: 'https://ollama.com/', label: 'Ollama' },
  'AWS': { icon: <DynamicIcon name="aws" />, url: 'https://aws.amazon.com/', label: 'AWS' },
  'GCP': { icon: <DynamicIcon name="gcp" />, url: 'https://cloud.google.com/', label: 'GCP' },
  'GitHub Actions': { icon: <DynamicIcon name="github actions" />, url: 'https://github.com/features/actions', label: 'GitHub Actions' },
  'Watchtower': { icon: <DynamicIcon name="watchtower" />, url: 'https://containrrr.dev/watchtower/', label: 'Watchtower' },
  'Vaultwarden': { icon: <DynamicIcon name="vaultwarden" />, url: 'https://vaultwarden.dev/', label: 'Vaultwarden' },
  'HTML/CSS': { icon: <DynamicIcon name="html/css" />, url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', label: 'HTML/CSS' },
  'Tailwind CSS': { icon: <DynamicIcon name="tailwind css" />, url: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
  'Tkinter': { icon: <DynamicIcon name="tkinter" />, url: 'https://wiki.python.org/moin/TkInter', label: 'Tkinter' },
  'Django': { icon: <DynamicIcon name="django" />, url: 'https://www.djangoproject.com/', label: 'Django' },
  'FastAPI': { icon: <DynamicIcon name="fastapi" />, url: 'https://fastapi.tiangolo.com/', label: 'FastAPI' },
  'REST APIs': { icon: <DynamicIcon name="rest apis" />, url: 'https://restfulapi.net/', label: 'REST APIs' },
  'Express': { icon: <DynamicIcon name="express" />, url: 'https://expressjs.com/', label: 'Express' },
  'Java': { icon: <DynamicIcon name="java" />, url: 'https://www.java.com/', label: 'Java' },
  'Go': { icon: <DynamicIcon name="go" />, url: 'https://go.dev/', label: 'Go' },
  'Bash': { icon: <DynamicIcon name="bash" />, url: 'https://www.gnu.org/software/bash/', label: 'Bash' },
  'SQL': { icon: <DynamicIcon name="sql" />, url: 'https://en.wikipedia.org/wiki/SQL', label: 'SQL' },
  'MySQL': { icon: <DynamicIcon name="mysql" />, url: 'https://www.mysql.com/', label: 'MySQL' },
  'PostgreSQL': { icon: <DynamicIcon name="postgresql" />, url: 'https://www.postgresql.org/', label: 'PostgreSQL' },
  'MongoDB': { icon: <DynamicIcon name="mongodb" />, url: 'https://www.mongodb.com/', label: 'MongoDB' },
  'Azure': { icon: <DynamicIcon name="azure" />, url: 'https://azure.microsoft.com', label: 'Azure' },
  'Power BI': { icon: <DynamicIcon name="power bi" />, url: 'https://powerbi.microsoft.com/', label: 'Power BI' },
  'Streamlit': { icon: <DynamicIcon name="streamlit" />, url: 'https://streamlit.io/', label: 'Streamlit' },
  'XGBoost': { icon: <DynamicIcon name="xgboost" />, url: 'https://xgboost.readthedocs.io', label: 'XGBoost' },
  'Home Assistant': { icon: <DynamicIcon name="home assistant" />, url: 'https://www.home-assistant.io/', label: 'Home Assistant' },
  'qBittorrent': { icon: <DynamicIcon name="qbittorrent" />, url: 'https://www.qbittorrent.org/', label: 'qBittorrent' }
};

// Toast component
const Toast = ({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg border ${
      type === 'success'
        ? 'neural-card-soft border-emerald-400/40 text-emerald-100'
        : 'neural-card-soft border-red-400/40 text-red-100'
    }`}
  >
    <div className="flex items-center gap-2">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

export default function Projects({ projects, className = '' }: ProjectsProps) {
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [sortMode, setSortMode] = useState<'featured' | 'latest' | 'alphabetical'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus trap for modal
  useEffect(() => {
    if (modalProject && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      firstElement?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        } else if (e.key === 'Escape') {
          closeModal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [modalProject]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (featuredOnly) {
      filtered = filtered.filter((project) => Boolean(project.featured));
    }
    
    if (sortMode === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'latest') {
      filtered = [...filtered].sort((a, b) => Number(b.year) - Number(a.year));
    } else {
      filtered = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return filtered;
  }, [projects, selectedTag, searchQuery, sortMode, featuredOnly]);

  const openModal = (project: Project) => {
    setModalProject(project);
    setCarouselIdx(0);
  };
  
  const closeModal = () => setModalProject(null);

  const nextImage = () => {
    if (!modalProject?.images) return;
    setCarouselIdx((carouselIdx + 1) % modalProject.images.length);
  };
  
  const prevImage = () => {
    if (!modalProject?.images) return;
    setCarouselIdx((carouselIdx - 1 + modalProject.images.length) % modalProject.images.length);
  };

  const copyToClipboard = async (text: string, type: 'link' | 'github') => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ 
        message: `${type === 'github' ? 'GitHub' : 'Demo'} link copied to clipboard!`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const readProjectDescription = (project: Project) => {
    if (!speechSynthesis) return;
    
    if (isReading) {
      speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const text = `${project.title}. ${project.description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  const ProjectCard = ({ project, index, compact }: { project: Project; index: number; compact: boolean }) => {
    const [imageIdx, setImageIdx] = useState(0);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98 }}
        className={`group neural-card-soft rounded-2xl ${compact ? 'p-4' : 'p-6'} flex flex-col justify-between border border-slate-600/55 h-full relative overflow-hidden tilt glow-hover cursor-pointer focus-visible:border-violet-400 focus-visible:shadow-lg`}
        onClick={() => openModal(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(project);
          }
        }}
        aria-label={`Open details for project ${project.title}`}
      >
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 z-10">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          </div>
        )}

        <div>
          <h3 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-semibold mb-2 text-slate-100 group-hover:text-primary transition-colors`}>
            {project.title}
          </h3>
          <div className="mb-4">
            <span className={`neural-statement-chip ${compact ? 'line-clamp-2 text-xs' : ''}`}>{project.description}</span>
          </div>
          {/* Image carousel on main grid */}
          {!compact && project.images && project.images.length > 0 && (
            <div className="mb-4 relative group">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-900/40">
                <img
                  src={project.images[imageIdx]}
                  alt={project.title}
                  className="object-cover w-full h-full transition-opacity duration-300"
                  loading="lazy"
                />
                {project.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 neural-control-btn-ghost p-1 rounded-full shadow opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIdx((imageIdx - 1 + project.images!.length) % project.images!.length);
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 neural-control-btn-ghost p-1 rounded-full shadow opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIdx((imageIdx + 1) % project.images!.length);
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {project.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${imageIdx === idx ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => {
              const techInfo = techIconMap[tag];
              return techInfo ? (
                <a
                  key={tag}
                  href={techInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                className="neural-pill text-xs sm:text-sm hover:scale-110 flex items-center gap-1"
                  title={`Learn more about ${techInfo.label}`}
                >
                  {techInfo.icon}
                  <span>{tag}</span>
                </a>
              ) : (
                <span
                  key={tag}
                  className="neural-pill text-xs sm:text-sm"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/70">
          <div className="text-sm text-slate-400">
            {project.year}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {/* View HomeServer button */}
            {project.viewHomeServer && (
              <a
                href={project.viewHomeServer}
                target="_blank"
                rel="noopener noreferrer"
                className={`neural-control-btn flex items-center gap-2 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1'} font-medium shadow ml-2`}
                onClick={e => e.stopPropagation()}
              >
                <ExternalLinkIcon className="h-5 w-5" />
                <span>{compact ? 'HomeServer' : 'View HomeServer'}</span>
              </a>
            )}
          {/* View on GitHub button */}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`neural-control-btn-ghost flex items-center gap-2 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1'} font-medium shadow ml-2`}
              onClick={e => e.stopPropagation()}
            >
              <GitHubIcon className="h-5 w-5" />
              <span>{compact ? 'GitHub' : 'View on GitHub'}</span>
            </a>
          )}
          </div>
        </div>
        <div className={`mt-3 text-right text-xs text-violet-300 font-semibold opacity-80 group-hover:opacity-100 ${compact ? 'hidden sm:block' : ''}`}>
          Click to view full case study →
        </div>
      </motion.div>
    );
  };

  return (
    <section className={`relative py-16 px-2 sm:px-6 w-full overflow-x-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden w-full h-full pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background w-full h-full" />
      </div>

      <div className="w-full neural-card neural-glow-border rounded-2xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">💼</span>
          <motion.h2 
            className="neural-section-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h2>
        </div>
        <motion.p 
          className="neural-section-copy max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Selected builds across AI, full-stack engineering, and self-hosted systems.
        </motion.p>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Total</p>
            <p className="mt-1 text-xl font-bold text-cyan-200">{projects.length}</p>
          </div>
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Featured</p>
            <p className="mt-1 text-xl font-bold text-violet-200">{projects.filter((project) => project.featured).length}</p>
          </div>
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Tags</p>
            <p className="mt-1 text-xl font-bold text-cyan-200">{allTags.length}</p>
          </div>
        </div>

        {/* Featured Projects Banner */}
        {projects.filter(p => p.featured).length > 0 && (
          <motion.div 
            className="mb-8 p-6 neural-card-soft rounded-xl border border-amber-300/35 overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <h3 className="text-xl font-bold text-yellow-200">
                Featured Projects
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {projects.filter(p => p.featured).slice(0, 2).map((project) => (
                <div
                  key={project.title}
                  className="p-4 neural-telemetry-card rounded-lg border border-amber-300/35 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(project)}
                >
                  <h4 className="font-semibold text-slate-100 mb-2">
                    {project.title}
                  </h4>
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mb-8 neural-card-soft rounded-xl border border-slate-600/55 p-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-end">
            <div className="xl:col-span-5">
              <label className="neural-kicker mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by title, stack, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="neural-input w-full !pl-12 !pr-14 py-2.5 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">Press /</span>
              </div>
            </div>

            <div className="xl:col-span-3">
              <label className="neural-kicker mb-2">Stack Filter</label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedTag ?? ''}
                  onChange={(event) => setSelectedTag(event.target.value || null)}
                  className="neural-input !pl-14 pr-8 py-2 text-sm w-full appearance-none"
                  aria-label="Filter projects by technology tag"
                >
                  <option value="">All stacks</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <span className="neural-kicker">Sort</span>
                {[
                  { key: 'featured', label: 'Featured first' },
                  { key: 'latest', label: 'Latest first' },
                  { key: 'alphabetical', label: 'A-Z' },
                ].map((mode) => (
                  <FilterChip
                    key={mode.key}
                    active={sortMode === mode.key}
                    onClick={() => setSortMode(mode.key as 'featured' | 'latest' | 'alphabetical')}
                    className="px-2.5 py-1 text-[11px] font-semibold"
                  >
                    {mode.label}
                  </FilterChip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <span className="neural-kicker">View</span>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`neural-pill-intro text-[11px] ${viewMode === 'grid' ? 'is-active' : ''}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`neural-pill-intro text-[11px] ${viewMode === 'compact' ? 'is-active' : ''}`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((prev) => !prev)}
                  className={`neural-pill-intro text-[11px] ${featuredOnly ? 'is-active' : ''}`}
                >
                  {featuredOnly ? 'Featured: ON' : 'Featured: OFF'}
                </button>
                {(selectedTag || searchQuery || featuredOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                      setFeaturedOnly(false);
                    }}
                    className="neural-control-btn-ghost text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-slate-400">
          Showing {filteredProjects.length} of {projects.length} projects in this view.
          {selectedTag && <span className="ml-2 text-cyan-300">Tag: {selectedTag}</span>}
        </div>

        <motion.div 
          className={`grid gap-6 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
          variants={containerVariants}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} compact={viewMode === 'compact'} />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
            >
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter.</p>
          </motion.div>
        )}

        {/* Modal for Project Details */}
        <AnimatePresence>
          {modalProject && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                ref={modalRef}
                className="neural-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.95, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 40 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-6">
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full neural-control-btn-ghost transition"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-cyan-200">
                      {modalProject.title}
                    </h3>
                    {modalProject.featured && (
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-slate-300 mb-6">
                    {modalProject.description}
                  </p>

                  {/* Enhanced Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {modalProject.techStack && (
                      <div>
                        <h4 className="font-semibold text-slate-100 mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {modalProject.techStack.map((tech) => {
                            const techInfo = techIconMap[tech];
                            return techInfo ? (
                              <a
                                key={tech}
                                href={techInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="neural-pill text-xs sm:text-sm flex items-center gap-1"
                              >
                                {techInfo.icon}
                                <span>{tech}</span>
                              </a>
                            ) : (
                            <span
                              key={tech}
                              className="neural-pill text-xs sm:text-sm"
                            >
                              {tech}
                            </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {modalProject.challenges && (
                      <div>
                        <h4 className="font-semibold text-slate-100 mb-2">Challenges</h4>
                        <ul className="space-y-1">
                          {modalProject.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {modalProject.learnings && (
                      <div>
                        <h4 className="font-semibold text-slate-100 mb-2">Key Learnings</h4>
                        <ul className="space-y-1">
                          {modalProject.learnings.map((learning, idx) => (
                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {learning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Carousel/Gallery */}
                  {modalProject.images && modalProject.images.length > 0 && (
                    <div className="mb-6 flex flex-col items-center">
                      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-slate-900/40">
                        <img
                          src={modalProject.images[carouselIdx]}
                          alt={modalProject.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        {modalProject.images.length > 1 && (
                          <>
                            <button
                              className="absolute left-2 top-1/2 -translate-y-1/2 neural-control-btn p-2 rounded-full shadow"
                              onClick={prevImage}
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 neural-control-btn p-2 rounded-full shadow"
                              onClick={nextImage}
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                      {modalProject.images.length > 1 && (
                        <div className="flex gap-2 mt-4">
                          {modalProject.images.map((img, idx) => (
                            <button
                              key={img}
                        className={`w-3 h-3 rounded-full transition-colors ${
                                carouselIdx === idx ? 'bg-violet-600' : 'bg-slate-500'
                              }`}
                              onClick={() => setCarouselIdx(idx)}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {modalProject.tags.map(tag => (
                      <span
                        key={tag}
                        className="neural-pill text-xs sm:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-3">
                    {modalProject.github && (
                      <a
                        href={modalProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow"
                      >
                        <GitHubIcon className="h-5 w-5" />
                        <span>View on GitHub</span>
                      </a>
                    )}
                    {modalProject.github && (
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(modalProject.github!, 'github')}
                        className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy GitHub</span>
                      </button>
                    )}
                    {modalProject.demo && (
                      <a
                        href={modalProject.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neural-control-btn-primary flex items-center gap-2 px-4 py-2 font-medium shadow"
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {modalProject.demo && (
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(modalProject.demo!, 'link')}
                        className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Copy Demo</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => readProjectDescription(modalProject)}
                      className="neural-control-btn flex items-center gap-2 px-4 py-2 font-medium shadow"
                    >
                      {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span>{isReading ? 'Stop Readout' : 'Read Summary'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 