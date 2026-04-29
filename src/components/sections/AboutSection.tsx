'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FaBrain, FaCogs, FaSatelliteDish, FaRocket,
  FaChartLine, FaBullseye, FaLaptopCode, FaStar
} from 'react-icons/fa';

const expertiseSignals = [
  { label: 'Production AI', value: '5+ yrs', icon: <FaBrain className="text-amber-400" /> },
  { label: 'MLOps + DevOps', value: 'End-to-End', icon: <FaCogs className="text-amber-400" /> },
  { label: 'Batcave Uptime', value: '99.9%', icon: <FaSatelliteDish className="text-amber-400" /> },
  { label: 'LLMs Self-Hosted', value: '5+ Models', icon: <FaRocket className="text-amber-400" /> },
];

const focusTracks = [
  {
    title: 'Experience Highlights',
    icon: <FaChartLine className="text-amber-400" />,
    marker: '▶',
    items: [
      '5 years delivering production ML/AI systems at Cognizant, UMBC R/SEEK, and Enigma Technologies',
      'Expert in Python, deep learning, NLP, LangChain, RAG pipelines, and GenAI systems',
      'Built and operated Batcave — a solo-managed, 56-container private AI server at 99.9% uptime',
      'End-to-end cloud-native MLOps on AWS (SageMaker, Lambda, S3) and Oracle Cloud (OCI)',
      'Edge AI engineer: TensorFlow Lite on ESP32; custom Android ROM and kernel developer',
    ],
  },
  {
    title: 'Data Science Highlights',
    icon: <FaBullseye className="text-amber-400" />,
    marker: '●',
    items: [
      'Production NLP pipelines across Legal, Healthcare, and Banking domains (Cognizant, 10M+ records)',
      'LLM fine-tuning with LoRA/QLoRA; semantic caching for LLM cost reduction at Enigma Technologies',
      'Wildfire detection: AllCNN on Sentinel-2 satellite imagery, 91% accuracy and 88% F1-score',
      'Financial risk suite: FinBERT classifier (87% accuracy) + 1,000+ Monte Carlo simulations',
    ],
  },
  {
    title: 'Infrastructure & Edge Systems',
    icon: <FaLaptopCode className="text-amber-400" />,
    marker: '◆',
    items: [
      'Repurposed Android device as low-power edge node with kernel-level CPU tuning (custom ROM)',
      'Built a fallback control plane: DDNS updater, Wake-on-LAN trigger, and Telegram webhook notifier',
      'Immich ML photo platform (401 GB, face recognition + object detection) and Paperless-NGX OCR',
      '177 GB multi-database data layer: PostgreSQL, MariaDB, Redis, SQLite, and Meilisearch',
    ],
  },
  {
    title: 'Featured Projects',
    icon: <FaStar className="text-amber-400" />,
    marker: '★',
    items: [
      'Batcave: solo-built 56-container AI platform — LLMs, RAG, ML inference, 99.9% uptime (5-part blog series)',
      'RAG Podcast Generator: PDF → LLM → TTS pipeline, 98% OCR accuracy, 4× throughput via LoRA fine-tuning',
      'Autonomous RC car: YOLOv8 object detection (95% accuracy) + TFLite on ESP32 — no cloud dependency',
      'Infrastructure Security Audit: automated scanner across 56 containers, identified 27 credential exposures',
    ],
  },
];

export default function AboutSection() {
  return (
    <section className="relative py-10 sm:py-14 px-2 sm:px-6 w-full overflow-hidden">
      <motion.div
        className="relative w-full neural-card neural-card-no-orb neural-glow-border p-4 sm:p-7 md:p-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center mb-8">
          <motion.div
            className="sm:col-span-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-amber-500/70 shadow-2xl">
              <Image
                src="/images/profile/profile.jpg"
                alt="Jayakrishna Konda - Data Scientist"
                width={208}
                height={208}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            className="sm:col-span-3 text-center sm:text-left"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs sm:text-sm tracking-widest uppercase text-amber-300">Jayakrishna Konda — ML/AI Engineer</p>
            <h2 className="neural-section-title mt-2">About Me</h2>
            <p className="neural-section-copy mt-3 max-w-3xl">
              I'm Jayakrishna Konda — an ML/AI Engineer and Data Scientist with 5 years building production
              ML systems, RAG pipelines, and self-hosted AI infrastructure. I design end-to-end solutions:
              from model training and LLM fine-tuning to cloud deployment and real-time monitoring.
              When I'm not shipping ML features at work, I'm operating Batcave — my 56-container private AI
              server running LLMs, RAG, and ML inference 24/7.
            </p>
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="neural-kicker">Neural profile</span>
              <span className="neural-pill text-xs">ML/AI Engineering</span>
              <span className="neural-pill text-xs">GenAI & RAG</span>
              <span className="neural-pill text-xs">MLOps + DevOps</span>
              <span className="neural-pill text-xs">Self-Hosted AI</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {expertiseSignals.map((signal) => (
            <motion.div
              key={signal.label}
              className="neural-card-soft rounded-xl border border-slate-600/60 p-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span>{signal.icon}</span>
                <span>{signal.label}</span>
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{signal.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {focusTracks.map((track, index) => (
            <motion.article
              key={track.title}
              className="neural-card-soft rounded-xl border border-slate-600/55 p-5"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-amber-200 flex items-center gap-2">
                <span>{track.icon}</span>
                <span>{track.title}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {track.items.map((item) => (
                  <li key={item} className="text-sm text-slate-200/95 flex items-start gap-2">
                    <span className="text-amber-300 mt-0.5">{track.marker}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
