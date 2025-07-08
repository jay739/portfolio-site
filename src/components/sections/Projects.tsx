'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';
import type { Project } from '@/types/project';
import { GitHubIcon, ExternalLinkIcon } from '@/components/icons/icons';
import { Tag, X, ChevronLeft, ChevronRight, Search, Star, Copy, Volume2, VolumeX } from 'lucide-react';

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
    className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
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
    
    return filtered;
  }, [projects, selectedTag, searchQuery]);

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

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
    const [imageIdx, setImageIdx] = useState(0);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
        whileTap={{ scale: 0.98 }}
        className="group bg-white dark:bg-slate-700 rounded-2xl p-6 flex flex-col justify-between border border-gray-200 dark:border-slate-700 h-full relative overflow-hidden tilt glow-hover cursor-pointer"
        onClick={() => openModal(project)}
      >
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 right-4 z-10">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
          </div>
        )}

        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
            {project.description}
          </p>
          {/* Image carousel on main grid */}
          {project.images && project.images.length > 0 && (
            <div className="mb-4 relative group">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={project.images[imageIdx]}
                  alt={project.title}
                  className="object-cover w-full h-full transition-opacity duration-300"
                  loading="lazy"
                />
                {project.images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 p-1 rounded-full shadow opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIdx((imageIdx - 1 + project.images!.length) % project.images!.length);
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 p-1 rounded-full shadow opacity-100 transition-opacity"
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
                  className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium shadow hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-1"
                  title={`Learn more about ${techInfo.label}`}
                >
                  {techInfo.icon}
                  <span>{tag}</span>
                </a>
              ) : (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium shadow"
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {project.year}
          </div>
          <div className="flex gap-2">
            {/* View HomeServer button */}
            {project.viewHomeServer && (
              <a
                href={project.viewHomeServer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 hover:bg-green-600 hover:text-white dark:hover:bg-green-600 transition-all font-medium shadow ml-2"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLinkIcon className="h-5 w-5" />
                <span>View HomeServer</span>
              </a>
            )}
          {/* View on GitHub button */}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all font-medium shadow ml-2"
              onClick={e => e.stopPropagation()}
            >
              <GitHubIcon className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          )}
          </div>
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

      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">💼</span>
          <motion.h2 
            className="text-3xl font-bold text-blue-600 dark:text-blue-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h2>
        </div>
        <motion.p 
          className="text-muted-foreground max-w-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          My recent work and personal projects
        </motion.p>

        {/* Featured Projects Banner */}
        {projects.filter(p => p.featured).length > 0 && (
          <motion.div 
            className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                Featured Projects
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              {projects.filter(p => p.featured).slice(0, 2).map((project) => (
                <div
                  key={project.title}
                  className="p-4 bg-white dark:bg-slate-700 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(project)}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className={`px-3 py-1 rounded-full text-sm font-medium ${selectedTag === null ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'}`}
              onClick={() => setSelectedTag(tag)}
            >
              <Tag className="w-4 h-4" />
              {tag}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
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
            >
              <motion.div
                ref={modalRef}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.95, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 40 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-6">
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 hover:text-white transition"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {modalProject.title}
                    </h3>
                    {modalProject.featured && (
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {modalProject.description}
                  </p>

                  {/* Enhanced Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {modalProject.techStack && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tech Stack</h4>
                        <div className="flex flex-wrap gap-2">
                          {modalProject.techStack.map((tech) => {
                            const techInfo = techIconMap[tech];
                            return techInfo ? (
                              <a
                                key={tech}
                                href={techInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                              >
                                {techInfo.icon}
                                <span>{tech}</span>
                              </a>
                            ) : (
                            <span
                              key={tech}
                              className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm"
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
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Challenges</h4>
                        <ul className="space-y-1">
                          {modalProject.challenges.map((challenge, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {modalProject.learnings && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Learnings</h4>
                        <ul className="space-y-1">
                          {modalProject.learnings.map((learning, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
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
                      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={modalProject.images[carouselIdx]}
                          alt={modalProject.title}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        {modalProject.images.length > 1 && (
                          <>
                            <button
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow hover:bg-blue-600 hover:text-white transition"
                              onClick={prevImage}
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow hover:bg-blue-600 hover:text-white transition"
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
                                carouselIdx === idx ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
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
                        className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-medium shadow"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-4">
                    {modalProject.github && (
                      <a
                        href={modalProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all font-medium shadow"
                      >
                        <GitHubIcon className="h-5 w-5" />
                        <span>View on GitHub</span>
                      </a>
                    )}
                    {modalProject.demo && (
                      <a
                        href={modalProject.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all font-medium shadow"
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                        <span>Live Demo</span>
                      </a>
                    )}
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