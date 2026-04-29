'use client';

import ImpactStats from '@/components/sections/ImpactStats';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RecentViewTracker from '@/components/ui/RecentViewTracker';
import SectionDeepLink from '@/components/ui/SectionDeepLink';
import RouteNextSteps from '@/components/layout/RouteNextSteps';
import { motion } from 'framer-motion';
import {
  FaBrain, FaDocker, FaFire, FaRobot, FaServer, FaShieldAlt,
} from 'react-icons/fa';

const highlights = [
  {
    role: 'Data Scientist — GenAI & ML',
    org: 'Enigma Technologies',
    period: 'Jun 2025 – Present',
    icon: <FaBrain className="text-amber-400" />,
    color: 'amber',
    points: [
      '30%+ analyst review time saved via multi-stage RAG pipeline (OCR → retrieval → extraction → routing)',
      '20% scoring precision gain — regression, classification & clustering on 10 M+ customer records',
      'LLM cost optimization via model routing (small vs premium) and semantic caching at equivalent quality',
      'Cloud-native ML platform on AWS: Docker, Kubernetes, GitHub Actions CI/CD, MLflow, drift detection',
    ],
  },
  {
    role: 'Machine Learning Engineer',
    org: 'Cognizant',
    period: 'Jun 2019 – Jul 2023',
    icon: <FaServer className="text-amber-400" />,
    color: 'orange',
    points: [
      '35% reduction in manual legal & compliance review — Contract Intelligence NLP pipeline across 10 M+ records',
      'NLP latency cut from 450 ms to under 90 ms through batch inference and model optimization',
      '25% monthly AWS cost reduction via Lambda & SageMaker autoscaling; p99 latency down 40%',
      '30% faster ML release cycles — Jenkins CI/CD with automated retraining, versioning & drift alerting',
      'PySpark fault-tolerant pipeline processing 1 M+ text records/day at consistent throughput',
    ],
  },
  {
    role: 'AI/ML Programming Intern',
    org: 'R/SEEK — UMBC',
    period: 'Jan 2025 – Jun 2025',
    icon: <FaRobot className="text-amber-400" />,
    color: 'amber',
    points: [
      '95% YOLOv8 object detection accuracy for autonomous RC car navigation across dynamic environments',
      'TensorFlow Lite deployed on ESP32 microcontrollers for real-time edge inference — zero cloud dependency',
      'Aruco marker-based positioning integrated into autonomous navigation stack',
    ],
  },
  {
    role: 'Batcave — Private AI Cloud',
    org: 'Personal Infrastructure',
    period: '2023 – Present',
    icon: <FaDocker className="text-amber-400" />,
    color: 'orange',
    points: [
      '56-container production platform: LLMs (LLaMA, Mistral, Phi, DeepSeek via Ollama), RAG pipelines, media, monitoring',
      '177 GB multi-database data layer — PostgreSQL, MariaDB, Redis, SQLite, Meilisearch',
      '99.9% uptime; Authentik SSO, Tailscale VPN, Netdata + Telegram real-time alerting',
      'Immich ML photo platform (401 GB, face recognition + object detection), Paperless-NGX OCR',
    ],
  },
  {
    role: 'Wildfire Detection CNN',
    org: 'Academic Project — UMBC',
    period: '2024',
    icon: <FaFire className="text-amber-400" />,
    color: 'amber',
    points: [
      '91% accuracy and 88% F1-score — AllCNN on Sentinel-2 multispectral satellite imagery',
      '2,400+ image patches processed with NDVI and NBR spectral indices for burn severity quantification',
      'Ablation studies and k-fold cross-validation for rigorous model evaluation',
    ],
  },
  {
    role: 'Infrastructure Security Audit',
    org: 'Personal Project',
    period: '2026',
    icon: <FaShieldAlt className="text-amber-400" />,
    color: 'orange',
    points: [
      'Automated security scanner across 56-container production stack using Python & Docker SDK',
      '27 hardcoded credential exposures identified and remediated across services',
      'CWE/CVE-aligned reporting with severity scoring and automated remediation recommendations',
    ],
  },
];

export default function ImpactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <RecentViewTracker item={{ id: 'page:impact', title: 'Impact Signals', href: '/impact', kind: 'page', description: 'Measured AI, infra, and engineering outcomes' }} />
      <NeuralPageIntro
        title="Impact Signals"
        subtitle="Evidence-driven outcomes across production ML delivery, infrastructure engineering, and applied AI research — measured, not estimated."
        chips={['Production Results', 'Real Metrics', 'Verified Outcomes']}
        theme="impact"
      />

      {/* ── Career highlights ── */}
      <section id="impact-highlights" className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8 bg-gradient-to-br from-amber-950/25 via-slate-950/70 to-slate-950/80">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="impact-highlights" title="Impact highlights" />
        </div>
        <p className="neural-kicker mb-2">Career Impact</p>
        <h2 className="neural-section-title mb-1">Highlights by Role</h2>
        <p className="neural-section-copy mb-6 max-w-2xl">
          Specific, verifiable outcomes from each position and project — numbers pulled directly from deliverables.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {highlights.map((h, i) => (
            <motion.article
              key={h.role}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="neural-card-soft rounded-2xl border border-slate-600/55 p-5"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="mt-0.5 text-lg shrink-0">{h.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-200 leading-tight">{h.role}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{h.org} · {h.period}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {h.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2 text-xs text-slate-200/90 leading-relaxed">
                    <span className="text-amber-400 mt-1 shrink-0">▶</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Metric counters ── */}
      <section id="impact" className="w-full">
        <div className="mb-3 flex justify-end">
          <SectionDeepLink id="impact" title="Impact metrics" />
        </div>
        <ImpactStats />
      </section>
      <RouteNextSteps
        items={[
          { href: '/projects', label: 'See the projects behind the numbers', note: 'Move from outcomes into case studies and systems.' },
          { href: '/timeline', label: 'Follow the career timeline', note: 'See how the results built up over time.' },
          { href: '/contact?intent=hiring', label: 'Start a hiring conversation', note: 'Use the fastest route if you are reaching out about roles.' },
        ]}
      />
    </main>
  );
}
