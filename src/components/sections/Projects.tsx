'use client';

import { motion } from 'framer-motion';
import { DynamicIcon } from '@/lib/icons';
import type { Project } from '@/types/project';
import { GitHubIcon, ExternalLinkIcon } from '@/components/icons/icons';

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

export default function Projects({ projects, className = '' }: ProjectsProps) {
  return (
    <section className={`relative py-16 px-2 sm:px-6 w-full overflow-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
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

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project, index) => {
            const link = project.github || project.demo;
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.15, delay: 0 } }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white dark:bg-slate-700 rounded-2xl p-6 flex flex-col justify-between border border-gray-200 dark:border-slate-700 h-full relative overflow-hidden fade-in tilt glow-hover"
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => {
                      const techInfo = techIconMap[tag];
                      return techInfo ? (
                        <a
                          key={tag}
                          href={techInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
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
                  <div className="flex items-center space-x-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        aria-label={`View ${project.title} source code on GitHub`}
                      >
                        <GitHubIcon className="h-5 w-5" />
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        aria-label={`View ${project.title} live demo`}
                      >
                        <ExternalLinkIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {project.year}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
} 