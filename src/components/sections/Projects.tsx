'use client';

import { motion } from 'framer-motion';
import { FaAws, FaChartBar, FaCogs, FaDatabase, FaDocker, FaGithub, FaHtml5, FaJava, FaJs, FaLinux, FaNodeJs, FaPython, FaReact, FaRegFileCode, FaRegQuestionCircle, FaRobot, FaServer } from 'react-icons/fa';
import { SiAstro, SiDjango, SiFastapi, SiHomeassistant, SiKubernetes, SiLangchain, SiMongodb, SiMysql, SiNextdotjs, SiOllama, SiPandas, SiPostgresql, SiPytorch, SiQbittorrent, SiScikitlearn, SiStreamlit, SiTailwindcss, SiTensorflow, SiTypescript, SiUptimekuma, SiVault, SiWatchtower } from 'react-icons/si';
import type { Project } from '@/types/project';

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
  'Python': { icon: <FaPython />, url: 'https://www.python.org/', label: 'Python' },
  'JavaScript': { icon: <FaJs />, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', label: 'JavaScript' },
  'TypeScript': { icon: <SiTypescript />, url: 'https://www.typescriptlang.org/', label: 'TypeScript' },
  'React': { icon: <FaReact />, url: 'https://react.dev/', label: 'React' },
  'Next.js': { icon: <SiNextdotjs />, url: 'https://nextjs.org/', label: 'Next.js' },
  'Astro': { icon: <SiAstro />, url: 'https://astro.build/', label: 'Astro' },
  'Node.js': { icon: <FaNodeJs />, url: 'https://nodejs.org/', label: 'Node.js' },
  'Docker': { icon: <FaDocker />, url: 'https://www.docker.com/', label: 'Docker' },
  'Kubernetes': { icon: <SiKubernetes />, url: 'https://kubernetes.io/', label: 'Kubernetes' },
  'Linux': { icon: <FaLinux />, url: 'https://www.linux.org/', label: 'Linux' },
  'CI/CD': { icon: <FaCogs />, url: 'https://en.wikipedia.org/wiki/CI/CD', label: 'CI/CD' },
  'Portainer': { icon: <FaServer />, url: 'https://www.portainer.io/', label: 'Portainer' },
  'Nginx': { icon: <FaServer />, url: 'https://nginx.org', label: 'Nginx' },
  'Uptime Kuma': { icon: <SiUptimekuma />, url: 'https://github.com/louislam/uptime-kuma', label: 'Uptime Kuma' },
  'TensorFlow': { icon: <SiTensorflow />, url: 'https://www.tensorflow.org/', label: 'TensorFlow' },
  'PyTorch': { icon: <SiPytorch />, url: 'https://pytorch.org/', label: 'PyTorch' },
  'NLP': { icon: <FaRobot />, url: 'https://en.wikipedia.org/wiki/Natural_language_processing', label: 'NLP' },
  'Computer Vision': { icon: <FaRegFileCode />, url: 'https://en.wikipedia.org/wiki/Computer_vision', label: 'Computer Vision' },
  'MLOps': { icon: <FaCogs />, url: 'https://en.wikipedia.org/wiki/MLOps', label: 'MLOps' },
  'Pandas': { icon: <SiPandas />, url: 'https://pandas.pydata.org/', label: 'Pandas' },
  'Scikit-learn': { icon: <SiScikitlearn />, url: 'https://scikit-learn.org/', label: 'Scikit-learn' },
  'LangChain': { icon: <SiLangchain />, url: 'https://www.langchain.com/', label: 'LangChain' },
  'Ollama': { icon: <SiOllama />, url: 'https://ollama.com/', label: 'Ollama' },
  'AWS': { icon: <FaAws />, url: 'https://aws.amazon.com/', label: 'AWS' },
  'GCP': { icon: <FaAws />, url: 'https://cloud.google.com/', label: 'GCP' },
  'GitHub Actions': { icon: <FaGithub />, url: 'https://github.com/features/actions', label: 'GitHub Actions' },
  'Watchtower': { icon: <SiWatchtower />, url: 'https://containrrr.dev/watchtower/', label: 'Watchtower' },
  'Vaultwarden': { icon: <SiVault />, url: 'https://vaultwarden.dev/', label: 'Vaultwarden' },
  'HTML/CSS': { icon: <FaHtml5 />, url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', label: 'HTML/CSS' },
  'Tailwind CSS': { icon: <SiTailwindcss />, url: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
  'Tkinter': { icon: <FaPython />, url: 'https://wiki.python.org/moin/TkInter', label: 'Tkinter' },
  'Django': { icon: <SiDjango />, url: 'https://www.djangoproject.com/', label: 'Django' },
  'FastAPI': { icon: <SiFastapi />, url: 'https://fastapi.tiangolo.com/', label: 'FastAPI' },
  'REST APIs': { icon: <FaRegFileCode />, url: 'https://restfulapi.net/', label: 'REST APIs' },
  'Express': { icon: <FaNodeJs />, url: 'https://expressjs.com/', label: 'Express' },
  'Java': { icon: <FaJava />, url: 'https://www.java.com/', label: 'Java' },
  'Go': { icon: <FaRegFileCode />, url: 'https://go.dev/', label: 'Go' },
  'Bash': { icon: <FaLinux />, url: 'https://www.gnu.org/software/bash/', label: 'Bash' },
  'SQL': { icon: <FaDatabase />, url: 'https://en.wikipedia.org/wiki/SQL', label: 'SQL' },
  'MySQL': { icon: <SiMysql />, url: 'https://www.mysql.com/', label: 'MySQL' },
  'PostgreSQL': { icon: <SiPostgresql />, url: 'https://www.postgresql.org/', label: 'PostgreSQL' },
  'MongoDB': { icon: <SiMongodb />, url: 'https://www.mongodb.com/', label: 'MongoDB' },
  'Azure': { icon: <FaAws />, url: 'https://azure.microsoft.com', label: 'Azure' },
  'Power BI': { icon: <FaChartBar />, url: 'https://powerbi.microsoft.com/', label: 'Power BI' },
  'Streamlit': { icon: <SiStreamlit />, url: 'https://streamlit.io/', label: 'Streamlit' },
  'XGBoost': { icon: <FaChartBar />, url: 'https://xgboost.readthedocs.io', label: 'XGBoost' },
  'Home Assistant': { icon: <SiHomeassistant />, url: 'https://www.home-assistant.io/', label: 'Home Assistant' },
  'qBittorrent': { icon: <SiQbittorrent />, url: 'https://www.qbittorrent.org/', label: 'qBittorrent' },
};

export default function Projects({ projects, className = '' }: ProjectsProps) {
  return (
    <section className={`relative py-16 px-6 bg-background overflow-hidden ${className}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
      </div>

      <div className="container mx-auto relative">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            My recent work and personal projects
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                whileHover={{ scale: 1.03 }}
                className="bg-card rounded-xl shadow-md p-6 flex flex-col justify-between border border-gray-200 dark:border-slate-700 h-full cursor-pointer"
                onClick={() => link && window.open(link, '_blank', 'noopener noreferrer')}
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-800 dark:text-gray-200 mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap mb-2">
                    {project.tags?.map((tag) => {
                      const iconData = techIconMap[tag] || { icon: <FaRegQuestionCircle />, url: '#', label: tag };
                      return (
                        <a
                          key={tag}
                          href={iconData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={iconData.label}
                          className="project-tag flex items-center gap-1 hover:text-blue-500 transition-colors"
                          style={{ textDecoration: 'none' }}
                        >
                          {iconData.icon}
                          <span>{tag}</span>
                        </a>
                      );
                    })}
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