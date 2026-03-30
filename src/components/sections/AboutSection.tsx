import Image from 'next/image';
import { motion } from 'framer-motion';

const expertiseSignals = [
  { label: 'Production AI', value: '4+ yrs', icon: '🧠' },
  { label: 'MLOps + DevOps', value: 'End-to-End', icon: '⚙️' },
  { label: 'Self-Hosting', value: '24/7 Ops', icon: '🛰️' },
  { label: 'Full-Stack Delivery', value: 'Idea to Deploy', icon: '🚀' },
];

const focusTracks = [
  {
    title: 'Experience Highlights',
    icon: '📈',
    marker: '▶',
    items: [
      '4+ years of experience in data science, AI/ML, and software engineering',
      'Expert in Python, deep learning, NLP, and data visualization',
      'Extensive Android ROM development and embedded systems experience',
      'Cloud, MLOps, and self-hosting advocate',
      'Open-source contributor and lifelong learner',
    ],
  },
  {
    title: 'Data Science Highlights',
    icon: '🎯',
    marker: '●',
    items: [
      'Developed end-to-end ML pipelines for NLP, computer vision, and time series forecasting',
      'Experience with TensorFlow, PyTorch, Scikit-learn, Pandas, and data wrangling',
      'Built dashboards and analytics tools for actionable business insights',
      'Deployed AI models to production using Docker, FastAPI, and cloud platforms',
    ],
  },
  {
    title: 'Android & Embedded Systems',
    icon: '💻',
    marker: '◆',
    items: [
      'Built custom Android ROMs and kernels for Motorola devices (MSM8953 platform)',
      'Contributed to LineageOS and PixelExperience projects with device trees and vendor blobs',
      'Experience with AOSP development, kernel compilation, and embedded systems programming',
      'Hardware-software integration and low-level system optimization',
    ],
  },
  {
    title: 'Featured Projects & Achievements',
    icon: '🌟',
    marker: '★',
    items: [
      'Top 5% in multiple Kaggle competitions',
      'Published research on AI/ML applications in real-world domains',
      'Open-source contributor to data science libraries and datasets',
      'Led projects in NLP, Computer Vision, and Time Series Analysis',
    ],
  },
];

export default function AboutSection() {
  return (
    <section className="relative py-10 sm:py-14 px-2 sm:px-6 w-full overflow-hidden">
      <motion.div
        className="relative w-full neural-card neural-glow-border p-4 sm:p-7 md:p-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center mb-8">
          <motion.div
            className="lg:col-span-2 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-blue-500/70 shadow-2xl">
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
            className="lg:col-span-3 text-center lg:text-left"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs sm:text-sm tracking-widest uppercase text-violet-300">Jayakrishna Konda - Data Scientist</p>
            <h2 className="neural-section-title mt-2">About Me</h2>
            <p className="neural-section-copy mt-3 max-w-3xl">
              Hi! I'm Jayakrishna Konda, a Data Scientist, Full Stack Developer, and DevOps Engineer.
              My passion lies in building intelligent systems, extracting insights from data, and deploying
              scalable AI/ML solutions.
            </p>
            <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
              <span className="neural-kicker">Neural profile</span>
              <span className="neural-pill text-xs">Data Science</span>
              <span className="neural-pill text-xs">Full-Stack Engineering</span>
              <span className="neural-pill text-xs">DevOps + MLOps</span>
              <span className="neural-pill text-xs">AI/ML Systems</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
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
              <h3 className="text-lg sm:text-xl font-semibold text-violet-200 flex items-center gap-2">
                <span>{track.icon}</span>
                <span>{track.title}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {track.items.map((item) => (
                  <li key={item} className="text-sm text-slate-200/95 flex items-start gap-2">
                    <span className="text-violet-300 mt-0.5">{track.marker}</span>
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