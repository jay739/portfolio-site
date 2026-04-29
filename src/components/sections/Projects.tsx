'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';
import type { Project } from '@/types/project';
import { projectSlug } from '@/lib/project-utils';
import { pushSiteFeedback, recordRecentView } from '@/lib/site-ux';
import { GitHubIcon, ExternalLinkIcon } from '@/components/ui/icons';
import { Tag, X, ChevronLeft, ChevronRight, Search, Star, Copy, Volume2, VolumeX, Scale } from 'lucide-react';
import { FaBriefcase } from 'react-icons/fa';
import FilterChip from '@/components/ui/FilterChip';
import OnboardingHint from '@/components/ui/OnboardingHint';
import GuidedEmptyState from '@/components/ui/GuidedEmptyState';

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

// ─── ProjectModal ────────────────────────────────────────────────────────────
// Owns all modal state so navigating images never re-renders the projects grid.

function ProjectModal({
  project,
  onClose,
  shareUrl,
  onPrevProject,
  onNextProject,
  initialImageIdx,
  onImageChange,
}: {
  project: Project;
  onClose: () => void;
  shareUrl: string;
  onPrevProject: () => void;
  onNextProject: () => void;
  initialImageIdx: number;
  onImageChange: (index: number) => void;
}) {
  const [carouselIdx, setCarouselIdx] = useState(initialImageIdx);
  const [isReading, setIsReading] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [imageLightbox, setImageLightbox] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCarouselIdx(initialImageIdx);
    setIsReading(false);
  }, [project, initialImageIdx]);

  useEffect(() => {
    onImageChange(carouselIdx);
  }, [carouselIdx, onImageChange]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (!modalRef.current) return;
    modalRef.current.scrollTop = 0;
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) { e.preventDefault(); lastElement?.focus(); }
        } else {
          if (document.activeElement === lastElement) { e.preventDefault(); firstElement?.focus(); }
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (project.images && project.images.length > 1) {
          e.preventDefault();
          prevImage();
        } else {
          onPrevProject();
        }
      } else if (e.key === 'ArrowRight') {
        if (project.images && project.images.length > 1) {
          e.preventDefault();
          nextImage();
        } else {
          onNextProject();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNextProject, onPrevProject, project.images]);

  useEffect(() => {
    const node = modalRef.current;
    if (!node) return;
    const onScroll = () => {
      const max = node.scrollHeight - node.clientHeight;
      setScrollProgress(max > 0 ? node.scrollTop / max : 0);
    };
    onScroll();
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, []);

  const nextImage = () => {
    if (!project.images) return;
    setCarouselIdx((i) => (i + 1) % project.images!.length);
  };

  const prevImage = () => {
    if (!project.images) return;
    setCarouselIdx((i) => (i - 1 + project.images!.length) % project.images!.length);
  };

  const copyToClipboard = async (text: string, type: 'link' | 'github' | 'case-study') => {
    try {
      await navigator.clipboard.writeText(text);
      const label = type === 'github' ? 'GitHub' : type === 'case-study' ? 'Case study' : 'Demo';
      setToast({ message: `${label} link copied to clipboard!`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const readProjectDescription = () => {
    if (!speechSynthesis) return;
    if (isReading) { speechSynthesis.cancel(); setIsReading(false); return; }
    const utterance = new SpeechSynthesisUtterance(`${project.title}. ${project.description}`);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          className="neural-card-soft rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-slate-700/60 bg-slate-900/95 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, y: -20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="sticky top-0 z-10 h-1 w-full bg-slate-950/80">
            <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200" style={{ width: `${Math.max(scrollProgress * 100, 2)}%` }} />
          </div>
          <div className="p-6">
            <button
              className="absolute top-4 right-4 p-2 rounded-full neural-control-btn-ghost transition"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              className="absolute top-4 left-4 p-2 rounded-full neural-control-btn-ghost transition"
              onClick={onPrevProject}
              aria-label="Previous project"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="absolute top-4 left-16 p-2 rounded-full neural-control-btn-ghost transition"
              onClick={onNextProject}
              aria-label="Next project"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 mt-8">
              <h3 className="text-2xl font-bold text-amber-200">{project.title}</h3>
              {project.featured && <Star className="w-6 h-6 text-yellow-500 fill-current" />}
            </div>

            <p className="text-slate-300 mb-6">{project.description}</p>

            {project.lifecycle && project.lifecycle.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-100 mb-2">Project Timeline</h4>
                <div className="flex flex-wrap gap-2">
                  {project.lifecycle.map((stage) => (
                    <span key={stage} className="neural-pill-intro text-xs">{stage}</span>
                  ))}
                </div>
              </div>
            )}

            {project.proofPoints && project.proofPoints.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                <h4 className="font-semibold text-slate-100 mb-2">Proof Points</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {project.proofPoints.map((point) => (
                    <div key={point} className="rounded-xl border border-slate-700/50 bg-slate-900/45 px-3 py-2 text-sm text-slate-200">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {project.techStack && (
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => {
                      const techInfo = techIconMap[tech];
                      return techInfo ? (
                        <a key={tech} href={techInfo.url} target="_blank" rel="noopener noreferrer"
                          className="neural-pill text-xs sm:text-sm flex items-center gap-1">
                          {techInfo.icon}<span>{tech}</span>
                        </a>
                      ) : (
                        <span key={tech} className="neural-pill text-xs sm:text-sm">{tech}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {project.challenges && (
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Challenges</h4>
                  <ul className="space-y-1">
                    {project.challenges.map((challenge, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>{challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.learnings && (
                <div>
                  <h4 className="font-semibold text-slate-100 mb-2">Key Learnings</h4>
                  <ul className="space-y-1">
                    {project.learnings.map((learning, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>{learning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {project.images && project.images.length > 0 && (
              <div className="mb-6">
                <div
                  className="relative w-full rounded-xl overflow-hidden bg-slate-950/80 border border-slate-700/40 select-none cursor-zoom-in"
                  style={{ minHeight: '280px' }}
                  onClick={() => setImageLightbox(true)}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={carouselIdx}
                      src={project.images[carouselIdx]}
                      alt={`${project.title} screenshot ${carouselIdx + 1}`}
                      className="w-full object-contain max-h-[420px] pointer-events-none"
                      draggable={false}
                      loading="lazy"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.25 }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{ boxShadow: 'inset 0 0 40px 10px rgba(2,6,23,0.6)' }} />
                  {/* Maximize button */}
                  <button
                    className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/80 hover:text-white transition-all"
                    onClick={(e) => { e.stopPropagation(); setImageLightbox(true); }}
                    aria-label="Fullscreen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </button>
                  {project.images.length > 1 && (
                    <>
                      <button className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous image">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next image">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
                        {carouselIdx + 1} / {project.images.length}
                      </div>
                    </>
                  )}
                </div>
                {imageLightbox && (
                  <ImageLightbox images={project.images} startIdx={carouselIdx} onClose={() => setImageLightbox(false)} />
                )}
                {project.images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-3">
                    {project.images.map((_, idx) => (
                      <button key={idx}
                        className={`rounded-full transition-all ${carouselIdx === idx ? 'w-5 h-2 bg-amber-400' : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'}`}
                        onClick={() => setCarouselIdx(idx)}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="neural-pill text-xs sm:text-sm">{tag}</span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void copyToClipboard(shareUrl, 'case-study')}
                className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow">
                <Copy className="h-4 w-4" /><span>Copy Case Study Link</span>
              </button>
              <a
                href={`/projects/brief/${projectSlug(project.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span>One-Page Summary</span>
              </a>
              <a
                href={`/contact?intent=consulting&subject=${encodeURIComponent(`Project walkthrough: ${project.title}`)}&message=${encodeURIComponent(`Hi, I would love to talk through ${project.title}. I am especially interested in ${project.problemAreas?.[0] || 'the architecture and tradeoffs'}.`)}`}
                className="neural-control-btn flex items-center gap-2 px-4 py-2 font-medium shadow"
              >
                <span>Ask About This Project</span>
              </a>
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer"
                  className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow">
                  <GitHubIcon className="h-5 w-5" /><span>View on GitHub</span>
                </a>
              )}
              {project.github && (
                <button type="button" onClick={() => void copyToClipboard(project.github!, 'github')}
                  className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow">
                  <Copy className="h-4 w-4" /><span>Copy GitHub</span>
                </button>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer"
                  className="neural-control-btn-primary flex items-center gap-2 px-4 py-2 font-medium shadow">
                  <ExternalLinkIcon className="h-5 w-5" /><span>Live Demo</span>
                </a>
              )}
              {project.demo && (
                <button type="button" onClick={() => void copyToClipboard(project.demo!, 'link')}
                  className="neural-control-btn-ghost flex items-center gap-2 px-4 py-2 font-medium shadow">
                  <Copy className="h-4 w-4" /><span>Copy Demo</span>
                </button>
              )}
              <button type="button" onClick={readProjectDescription}
                className="neural-control-btn flex items-center gap-2 px-4 py-2 font-medium shadow">
                {isReading ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isReading ? 'Stop Readout' : 'Read Summary'}</span>
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-widest text-amber-300">Related by Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.techStack || project.tags).slice(0, 5).map((entry) => (
                    <a key={entry} href={`/projects?tag=${encodeURIComponent(entry)}`} className="neural-pill-intro text-[11px]">
                      {entry}
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                <p className="text-xs uppercase tracking-widest text-amber-300">Related by Problem Solved</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.problemAreas || project.challenges || []).slice(0, 5).map((entry) => (
                    <span key={entry} className="neural-pill-intro text-[11px]">
                      {entry}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ─── ProjectCard ─────────────────────────────────────────────────────────────
// Defined at module level so React never treats it as a new component type
// when the parent Projects re-renders (e.g. when the modal opens/closes).

function ImageLightbox({ images, startIdx, onClose }: { images: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [images.length, onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
          {idx + 1} / {images.length}
        </span>
      )}
      <div className="relative flex items-center justify-center w-full h-full px-16" onClick={e => e.stopPropagation()}>
        <img
          src={images[idx]}
          alt={`Image ${idx + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          draggable={false}
        />
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
              onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
              onClick={() => setIdx(i => (i + 1) % images.length)}
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function ProjectCard({ project, index, compact, onOpen, onToggleCompare, isCompared }: {
  project: Project;
  index: number;
  compact: boolean;
  onOpen: (p: Project) => void;
  onToggleCompare: (project: Project) => void;
  isCompared: boolean;
}) {
  const [imageIdx, setImageIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const images = project.images ?? [];

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = setInterval(() => {
      setImageIdx((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length, paused]);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
      className={`neural-card-soft rounded-2xl ${compact ? 'p-4' : 'p-6'} flex flex-col justify-between border border-slate-600/55 h-full relative overflow-hidden`}
    >
      {project.featured && (
        <div className="absolute top-4 right-4 z-10">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => onOpen(project)}
          className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-semibold mb-2 text-slate-100 hover:text-amber-300 transition-colors text-left w-full`}
        >
          {project.title}
        </button>
        <div className="mb-4">
          <p className={`neural-statement-chip block ${compact ? 'line-clamp-2 text-xs' : 'line-clamp-3 text-sm'}`}>{project.description}</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.featured && <span className="neural-pill-intro text-[10px]">Production</span>}
          {project.lifecycle?.includes('Maintained') && <span className="neural-pill-intro text-[10px]">Maintained</span>}
          {project.lifecycle?.includes('Building') && <span className="neural-pill-intro text-[10px]">Ongoing</span>}
          {project.tags.includes('Infrastructure') && <span className="neural-pill-intro text-[10px]">Self-Hosted</span>}
        </div>

        {!compact && project.images && project.images.length > 0 && (
          <div
            className="mb-4 relative group/carousel cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-950/60 border border-slate-700/40 select-none" style={{ height: '180px' }}>
              <AnimatePresence>
                <motion.img
                  key={imageIdx}
                  src={project.images[imageIdx]}
                  alt={`${project.title} screenshot ${imageIdx + 1}`}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-500 ease-out group-hover/carousel:scale-[1.035]"
                  draggable={false}
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.16)_100%)] opacity-70 transition-opacity duration-300 group-hover/carousel:opacity-100" />
              <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ boxShadow: 'inset 0 0 30px 8px rgba(2,6,23,0.5)' }} />

              {project.images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImageIdx((imageIdx - 1 + project.images!.length) % project.images!.length); }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setImageIdx((imageIdx + 1) % project.images!.length); }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {project.images.length > 1 && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">
                  {imageIdx + 1} / {project.images.length}
                </div>
              )}
            </div>

            {project.images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {project.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setImageIdx(idx); }}
                    className={`rounded-full transition-all ${imageIdx === idx ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'}`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
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
                className="neural-pill text-xs sm:text-sm flex items-center gap-1"
                title={`Learn more about ${techInfo.label}`}
              >
                {techInfo.icon}
                <span>{tag}</span>
              </a>
            ) : (
              <span key={tag} className="neural-pill neural-pill-static text-xs sm:text-sm">
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/70">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleCompare(project); }}
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition ${
              isCompared
                ? 'border-amber-400/70 bg-amber-500/15 text-amber-200'
                : 'border-slate-600/60 text-slate-400 hover:border-amber-400/40 hover:text-amber-300'
            }`}
            aria-label={isCompared ? `Remove ${project.title} from compare` : `Compare ${project.title}`}
          >
            <Scale className="h-3 w-3" />
            {isCompared ? 'Compared' : 'Compare'}
          </button>
          <span className="text-sm text-slate-500">{project.year}</span>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
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
      <button
        type="button"
        onClick={() => onOpen(project)}
        className={`mt-3 w-full neural-control-btn-primary text-xs font-semibold py-2 rounded-xl transition-all ${compact ? 'hidden sm:block' : ''}`}
      >
        View Full Case Study →
      </button>

      {lightboxOpen && images.length > 0 && (
        <ImageLightbox images={images} startIdx={imageIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </motion.div>
  );
}

// ─── Projects (main section) ──────────────────────────────────────────────────

export default function Projects({ projects, className = '' }: ProjectsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get('tag'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [modalImageIdx, setModalImageIdx] = useState(Math.max(0, Number(searchParams.get('image') ?? '0') || 0));
  const [sortMode, setSortMode] = useState<'featured' | 'latest' | 'alphabetical'>(
    (searchParams.get('sort') as 'featured' | 'latest' | 'alphabetical') ?? 'featured'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>(
    (searchParams.get('view') as 'grid' | 'compact') ?? 'grid'
  );
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === '1');
  const [spotlightId, setSpotlightId] = useState<string | null>(searchParams.get('spotlight'));
  const [compareIds, setCompareIds] = useState<string[]>(
    (searchParams.get('compare') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 2)
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const projectParam = searchParams.get('project');
    setSelectedTag(searchParams.get('tag'));
    setSearchQuery(searchParams.get('q') ?? '');
    setSortMode((searchParams.get('sort') as 'featured' | 'latest' | 'alphabetical') ?? 'featured');
    setViewMode((searchParams.get('view') as 'grid' | 'compact') ?? 'grid');
    setFeaturedOnly(searchParams.get('featured') === '1');
    setSpotlightId(searchParams.get('spotlight'));
    setModalImageIdx(Math.max(0, Number(searchParams.get('image') ?? '0') || 0));
    setCompareIds(
      (searchParams.get('compare') ?? '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .slice(0, 2)
    );
    if (!projectParam) {
      setModalProject(null);
      return;
    }

    const match = projects.find((project) => projectSlug(project.title) === projectParam);
    if (match) {
      setModalProject(match);
    }
  }, [projects, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedTag) {
      params.set('tag', selectedTag);
    } else {
      params.delete('tag');
    }

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }

    if (sortMode !== 'featured') {
      params.set('sort', sortMode);
    } else {
      params.delete('sort');
    }

    if (viewMode !== 'grid') {
      params.set('view', viewMode);
    } else {
      params.delete('view');
    }

    if (featuredOnly) {
      params.set('featured', '1');
    } else {
      params.delete('featured');
    }

    if (spotlightId) {
      params.set('spotlight', spotlightId);
    } else {
      params.delete('spotlight');
    }

    if (compareIds.length > 0) {
      params.set('compare', compareIds.join(','));
    } else {
      params.delete('compare');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareIds, featuredOnly, pathname, searchQuery, selectedTag, sortMode, spotlightId, viewMode]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }

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

    if (spotlightId) {
      filtered = filtered.filter((project) => projectSlug(project.title) === spotlightId);
    }

    if (sortMode === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'latest') {
      filtered = [...filtered].sort((a, b) => Number(b.year) - Number(a.year));
    } else {
      filtered = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return filtered;
  }, [featuredOnly, projects, searchQuery, selectedTag, sortMode, spotlightId]);

  const orderedProjects = filteredProjects;
  const activeModalIndex = modalProject
    ? orderedProjects.findIndex((project) => project.title === modalProject.title)
    : -1;

  const syncModalUrl = useCallback(
    (project: Project | null, imageIndex: number, compare: string[] = compareIds) => {
      const params = new URLSearchParams(searchParams.toString());
      if (project) {
        params.set('project', projectSlug(project.title));
        if (imageIndex > 0) {
          params.set('image', String(imageIndex));
        } else {
          params.delete('image');
        }
      } else {
        params.delete('project');
        params.delete('image');
      }

      if (compare.length > 0) {
        params.set('compare', compare.join(','));
      } else {
        params.delete('compare');
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [compareIds, pathname, router, searchParams]
  );

  const openModal = useCallback(
    (project: Project) => {
      setModalProject(project);
      setModalImageIdx(0);
      recordRecentView({
        id: `project:${projectSlug(project.title)}`,
        title: project.title,
        href: `/projects?project=${projectSlug(project.title)}`,
        kind: 'project',
        description: project.description,
      });
      syncModalUrl(project, 0);
    },
    [syncModalUrl]
  );

  const closeModal = useCallback(() => {
    setModalProject(null);
    setModalImageIdx(0);
    syncModalUrl(null, 0);
  }, [syncModalUrl]);

  const shareUrl = useMemo(() => {
    if (!modalProject || typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectSlug(modalProject.title));
    if (modalImageIdx > 0) {
      url.searchParams.set('image', String(modalImageIdx));
    } else {
      url.searchParams.delete('image');
    }
    return url.toString();
  }, [modalImageIdx, modalProject]);

  const handleModalImageChange = useCallback(
    (index: number) => {
      setModalImageIdx(index);
      if (modalProject) {
        syncModalUrl(modalProject, index);
      }
    },
    [modalProject, syncModalUrl]
  );

  const handlePrevProject = useCallback(() => {
    if (!modalProject || orderedProjects.length === 0) return;
    const nextIndex = (activeModalIndex - 1 + orderedProjects.length) % orderedProjects.length;
    const nextProject = orderedProjects[nextIndex];
    setModalProject(nextProject);
    setModalImageIdx(0);
    syncModalUrl(nextProject, 0);
  }, [activeModalIndex, modalProject, orderedProjects, syncModalUrl]);

  const handleNextProject = useCallback(() => {
    if (!modalProject || orderedProjects.length === 0) return;
    const nextIndex = (activeModalIndex + 1) % orderedProjects.length;
    const nextProject = orderedProjects[nextIndex];
    setModalProject(nextProject);
    setModalImageIdx(0);
    syncModalUrl(nextProject, 0);
  }, [activeModalIndex, modalProject, orderedProjects, syncModalUrl]);

  const toggleCompare = (project: Project) => {
    const slug = projectSlug(project.title);
    setCompareIds((prev) => {
      if (prev.includes(slug)) {
        pushSiteFeedback(`Removed ${project.title} from compare.`, 'info');
        return prev.filter((entry) => entry !== slug);
      }
      const next = [...prev, slug];
      pushSiteFeedback(next.length >= 2 ? 'Project compare tray is ready.' : `Added ${project.title} to compare.`, 'success');
      return next.slice(-2);
    });
  };

  const compareProjects = compareIds
    .map((id) => projects.find((project) => projectSlug(project.title) === id))
    .filter(Boolean) as Project[];

  return (
    <>
    <section className={`relative w-full ${className}`}>
      <div className="relative w-full neural-card neural-glow-border p-4 sm:p-8">
        <OnboardingHint
          storageKey="projects_compare_hint_v1"
          title="Projects compare mode"
          body="Use Compare on up to two projects, then open a case study for deeper proof points, timeline stages, and shareable project links."
        />
        <div className="flex items-center gap-2 mb-8">
          <FaBriefcase className="text-2xl text-amber-400" />
          <motion.h2
            className="neural-section-title"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h2>
        </div>
        <motion.p
          className="neural-section-copy max-w-2xl mb-8"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Selected builds across AI, full-stack engineering, and self-hosted systems.
        </motion.p>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Total</p>
            <p className="mt-1 text-xl font-bold text-amber-200">{projects.length}</p>
          </div>
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Featured</p>
            <p className="mt-1 text-xl font-bold text-orange-200">{projects.filter((project) => project.featured).length}</p>
          </div>
          <div className="neural-telemetry-card">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Tags</p>
            <p className="mt-1 text-xl font-bold text-amber-200">{allTags.length}</p>
          </div>
        </div>

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
                  onClick={() => setSpotlightId((prev) => (prev ? null : projectSlug(projects[0].title)))}
                  className={`neural-pill-intro text-[11px] ${spotlightId ? 'is-active' : ''}`}
                >
                  {spotlightId ? 'Spotlight: ON' : 'Spotlight'}
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((prev) => !prev)}
                  className={`neural-pill-intro text-[11px] ${featuredOnly ? 'is-active' : ''}`}
                >
                  {featuredOnly ? 'Featured: ON' : 'Featured: OFF'}
                </button>
                {(selectedTag || searchQuery || featuredOnly || spotlightId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                      setFeaturedOnly(false);
                      setSpotlightId(null);
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

        <div className="mb-6 text-sm text-slate-400">
          Showing {filteredProjects.length} of {projects.length} projects in this view.
          {selectedTag && <span className="ml-2 text-amber-300">Tag: {selectedTag}</span>}
        </div>

        {compareProjects.length === 0 && (
          <div className="mb-6 rounded-2xl border border-dashed border-slate-700/60 bg-slate-950/20 p-4 text-sm text-slate-400">
            Compare mode is ready. Pin any two projects to inspect stack, scope, and delivery focus side by side.
          </div>
        )}

        {compareProjects.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="neural-kicker mb-1">Compare Mode</p>
                <h3 className="text-lg font-semibold text-slate-100">
                  {compareProjects.length === 1
                    ? 'Select one more project to compare'
                    : `${compareProjects[0].title}  vs  ${compareProjects[1].title}`}
                </h3>
              </div>
              <div className="flex gap-2">
                {compareProjects.map((p) => (
                  <button key={p.title} type="button" onClick={() => toggleCompare(p)}
                    className="neural-control-btn-ghost text-[11px]">
                    Remove "{p.title.split(' ').slice(0, 2).join(' ')}"
                  </button>
                ))}
                <button type="button" onClick={() => setCompareIds([])} className="neural-control-btn-ghost text-[11px]">
                  Clear all
                </button>
              </div>
            </div>

            {compareProjects.length === 1 && (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 text-sm text-slate-400">
                Click <span className="text-amber-300 font-medium">Compare</span> on another project card to start the comparison.
              </div>
            )}

            {compareProjects.length === 2 && (() => {
              const [a, b] = compareProjects;
              const stackA = new Set((a.techStack ?? a.tags).map(t => t.toLowerCase()));
              const stackB = new Set((b.techStack ?? b.tags).map(t => t.toLowerCase()));
              const rawA = a.techStack ?? a.tags;
              const rawB = b.techStack ?? b.tags;
              const shared = rawA.filter(t => stackB.has(t.toLowerCase()));
              const onlyA = rawA.filter(t => !stackB.has(t.toLowerCase()));
              const onlyB = rawB.filter(t => !stackA.has(t.toLowerCase()));

              const rows: { label: string; a: React.ReactNode; b: React.ReactNode; highlight?: boolean }[] = [
                {
                  label: 'Year',
                  a: <span>{a.year ?? '—'}</span>,
                  b: <span>{b.year ?? '—'}</span>,
                  highlight: String(a.year) !== String(b.year),
                },
                {
                  label: 'Category',
                  a: <span>{a.tags[0] ?? '—'}</span>,
                  b: <span>{b.tags[0] ?? '—'}</span>,
                  highlight: a.tags[0] !== b.tags[0],
                },
                {
                  label: 'Featured',
                  a: a.featured ? <span className="text-yellow-400">★ Yes</span> : <span className="text-slate-500">No</span>,
                  b: b.featured ? <span className="text-yellow-400">★ Yes</span> : <span className="text-slate-500">No</span>,
                  highlight: !!a.featured !== !!b.featured,
                },
                {
                  label: 'Stack size',
                  a: <span>{rawA.length} technologies</span>,
                  b: <span>{rawB.length} technologies</span>,
                  highlight: rawA.length !== rawB.length,
                },
                {
                  label: 'Challenges',
                  a: <span>{a.challenges?.length ?? 0} documented</span>,
                  b: <span>{b.challenges?.length ?? 0} documented</span>,
                  highlight: (a.challenges?.length ?? 0) !== (b.challenges?.length ?? 0),
                },
                {
                  label: 'Learnings',
                  a: <span>{a.learnings?.length ?? 0} documented</span>,
                  b: <span>{b.learnings?.length ?? 0} documented</span>,
                  highlight: (a.learnings?.length ?? 0) !== (b.learnings?.length ?? 0),
                },
                {
                  label: 'GitHub',
                  a: a.github ? <a href={a.github} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">View repo</a> : <span className="text-slate-500">—</span>,
                  b: b.github ? <a href={b.github} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">View repo</a> : <span className="text-slate-500">—</span>,
                  highlight: !!a.github !== !!b.github,
                },
                {
                  label: 'Live demo',
                  a: a.demo ? <a href={a.demo} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">Open</a> : <span className="text-slate-500">—</span>,
                  b: b.demo ? <a href={b.demo} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:underline">Open</a> : <span className="text-slate-500">—</span>,
                  highlight: !!a.demo !== !!b.demo,
                },
              ];

              return (
                <div className="space-y-4">
                  {/* Column headers */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 text-xs font-semibold text-slate-400 px-1">
                    <span />
                    <span className="text-amber-200 truncate">{a.title}</span>
                    <span className="text-sky-200 truncate">{b.title}</span>
                  </div>

                  {/* Comparison rows */}
                  {rows.map(row => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[120px_1fr_1fr] gap-3 rounded-xl px-3 py-2.5 text-sm items-start ${
                        row.highlight
                          ? 'bg-amber-500/8 border border-amber-400/20'
                          : 'bg-slate-900/40 border border-slate-700/40'
                      }`}
                    >
                      <span className="text-slate-500 text-xs font-medium pt-0.5">{row.label}</span>
                      <span className="text-slate-200">{row.a}</span>
                      <span className="text-slate-200">{row.b}</span>
                    </div>
                  ))}

                  {/* Tech stack diff */}
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tech stack breakdown</p>
                    {shared.length > 0 && (
                      <div>
                        <p className="text-[11px] text-slate-500 mb-1.5">Shared ({shared.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {shared.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[11px]">{t}</span>)}
                        </div>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {onlyA.length > 0 && (
                        <div>
                          <p className="text-[11px] text-amber-400/80 mb-1.5">Only in {a.title.split(' ')[0]} ({onlyA.length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {onlyA.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/25 text-amber-200 text-[11px]">{t}</span>)}
                          </div>
                        </div>
                      )}
                      {onlyB.length > 0 && (
                        <div>
                          <p className="text-[11px] text-sky-400/80 mb-1.5">Only in {b.title.split(' ')[0]} ({onlyB.length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {onlyB.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-200 text-[11px]">{t}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick action */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    {[a, b].map((p, i) => (
                      <button key={p.title} type="button"
                        onClick={() => openModal(p)}
                        className={`neural-control-btn text-xs py-2 ${i === 0 ? 'border-amber-400/30' : 'border-sky-400/30'}`}>
                        Open full case study: {p.title.split(' ').slice(0, 3).join(' ')}…
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <motion.div
          className={`grid gap-6 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
          variants={containerVariants}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              compact={viewMode === 'compact'}
              onOpen={openModal}
              onToggleCompare={toggleCompare}
              isCompared={compareIds.includes(projectSlug(project.title))}
            />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
            <GuidedEmptyState
              title="No projects match this slice"
              description="Try widening the search, clearing spotlight mode, or switching the stack filter to explore a different part of the project graph."
              primaryLabel="Reset project view"
              primaryHref="/projects"
              secondaryLabel="Clear local filters"
              onSecondaryClick={() => {
                setSelectedTag(null);
                setSearchQuery('');
                setFeaturedOnly(false);
                setSpotlightId(null);
              }}
            />
          </motion.div>
        )}

      </div>
    </section>

    <AnimatePresence>
      {modalProject && (
        <ProjectModal
          key={modalProject.title}
          project={modalProject}
          onClose={closeModal}
          shareUrl={shareUrl}
          onPrevProject={handlePrevProject}
          onNextProject={handleNextProject}
          initialImageIdx={modalImageIdx}
          onImageChange={handleModalImageChange}
        />
      )}
    </AnimatePresence>
  </>
  );
}
