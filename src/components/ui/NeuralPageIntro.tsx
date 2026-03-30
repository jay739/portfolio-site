'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useState } from 'react';

interface NeuralPageIntroProps {
  title: string;
  subtitle: string;
  chips?: string[];
  kicker?: string;
}

function buildChipPrompt(chip: string, pageTitle: string): string {
  const normalized = chip.toLowerCase();
  const directPrompts: Record<string, string> = {
    nlp: "What NLP projects and production use-cases has Jayakrishna Konda built? Include models, deployment, and measurable outcomes from his projects and experience.",
    genai: "Which GenAI systems has Jayakrishna Konda implemented and deployed? Summarize the tools, workflows, and project impact.",
    'full-stack': "What full-stack applications has Jayakrishna Konda built from frontend to backend and deployment? Include notable project examples.",
    devops: "What DevOps and MLOps practices does Jayakrishna Konda use in production systems and home server operations?",
    milestones: "List the key career milestones in Jayakrishna Konda's timeline, including major roles, transitions, and impact.",
    'journey map': "Summarize Jayakrishna Konda's career journey and major transitions across Infosys, Cognizant, R/SEEK UMBC, and Enigma Technologies.",
    'narrative flow': "How does Jayakrishna Konda's experience progress from technical skills to project execution and measurable impact?",
    'neural radar': "Which technical strengths stand out most in Jayakrishna Konda's skills graph and project portfolio?",
    explainability: "How does Jayakrishna Konda explain, validate, and monitor ML/AI systems in production?",
    interaction: "How does Jayakrishna Konda design interactive user experiences across projects and product interfaces?",
    metrics: "What measurable metrics does Jayakrishna Konda highlight across delivery, ML impact, and engineering outcomes?",
    outcomes: "What concrete outcomes and impact has Jayakrishna Konda delivered across his projects and roles?",
    'signal view': "Give a concise signal view of Jayakrishna Konda's impact metrics, outcomes, and engineering performance.",
    'live feed': "How does Jayakrishna Konda stay current with AI news and apply research trends in practical projects?",
    'trend signals': "Which AI trend signals are most relevant to Jayakrishna Konda's current skills, projects, and tooling choices?",
    'research pulse': "How does Jayakrishna Konda connect new AI research to practical implementation and production use-cases?",
    'fast response': "What channels and workflow does Jayakrishna Konda provide for quick professional contact and collaboration?",
    'secure form': "How does Jayakrishna Konda approach secure communication and reliable contact workflows in his portfolio?",
    'clear feedback': "How does Jayakrishna Konda design clear user feedback and interaction quality in portfolio and product UIs?",
    'real-time signals': "What real-time telemetry signals and monitoring metrics does Jayakrishna Konda track in his home server setup?",
    'ops insight': "What operational insights does Jayakrishna Konda derive from infrastructure monitoring and automation?",
    infrastructure: "Summarize Jayakrishna Konda's infrastructure stack, self-hosted services, and operational reliability practices.",
    'lab console': "What tools and workflows are included in Jayakrishna Konda's AI Tools Lab, and what are they used for?",
    'rag demo': "How does Jayakrishna Konda implement and demonstrate RAG workflows in his projects?",
    'interactive ux': "How does Jayakrishna Konda apply interactive UX patterns in AI tools and portfolio experiences?",
    'case studies': "What are Jayakrishna Konda's strongest project case studies and why are they impactful?",
    'interactive cards': "What project stories are highlighted in Jayakrishna Konda's interactive project cards?",
    'production focus': "Which projects from Jayakrishna Konda show production-ready engineering and deployment quality?",
    articles: "What technical article themes does Jayakrishna Konda write about in his knowledge graph?",
    guides: "What practical guides and tutorials has Jayakrishna Konda published?",
    systems: "What systems design and engineering topics does Jayakrishna Konda cover in his blog content?",
    ai: "What AI-focused topics does Jayakrishna Konda cover across his blog and project portfolio?",
    longform: "Summarize Jayakrishna Konda's longform writing style and deep-dive technical themes.",
    share: "How does Jayakrishna Konda enable knowledge sharing and content distribution in his blog?",
    'read aloud': "How does Jayakrishna Konda improve article accessibility and reader experience, including read-aloud support?",
  };
  if (directPrompts[normalized]) {
    return directPrompts[normalized];
  }
  if (normalized.includes('milestone') || normalized.includes('journey') || normalized.includes('timeline')) {
    return "Summarize Jayakrishna Konda's timeline highlights, role progression, and key achievements across Infosys, Cognizant, R/SEEK UMBC, and Enigma Technologies.";
  }
  if (normalized.includes('impact') || normalized.includes('metric') || normalized.includes('outcome')) {
    return `What measurable outcomes or impact does Jayakrishna Konda show for "${chip}" across projects, delivery, and engineering performance?`;
  }
  if (normalized.includes('tool') || normalized.includes('lab') || normalized.includes('rag')) {
    return `How has Jayakrishna Konda implemented "${chip}" in real projects and production workflows?`;
  }
  if (normalized.includes('news') || normalized.includes('research') || normalized.includes('trend')) {
    return `How does "${chip}" connect to Jayakrishna Konda's AI/ML work, projects, and experience?`;
  }
  return `In the context of ${pageTitle}, how does Jayakrishna Konda demonstrate "${chip}" through projects, skills, experience timeline, and measurable impact?`;
}

export default function NeuralPageIntro({
  title,
  subtitle,
  chips = [],
  kicker = 'Neural Experience Layer',
}: NeuralPageIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const onChipClick = (chip: string) => {
    setActiveChip(chip);
    const message = buildChipPrompt(chip, title);
    window.dispatchEvent(new CustomEvent('chatbot:open'));
    window.dispatchEvent(new CustomEvent('chatbot:ask', { detail: { message } }));
  };

  return (
    <motion.header
      className="neural-intro-panel neural-card-soft mb-6 sm:mb-8 p-4 sm:p-6"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <p className="neural-kicker mb-2">{kicker}</p>
      <h1 className="neural-title text-2xl sm:text-3xl md:text-4xl">{title}</h1>
      <p className="neural-subtitle mt-2 max-w-3xl text-sm sm:text-base">{subtitle}</p>
      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip, index) => (
            <motion.button
              key={chip}
              type="button"
              className={`neural-pill-intro ${
                activeChip === chip ? 'is-active ring-1 ring-violet-300/70' : ''
              }`}
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : index * 0.05 }}
              onClick={() => onChipClick(chip)}
              title={`Ask assistant about ${chip}`}
              aria-label={`Ask assistant about ${chip}`}
            >
              {chip}
            </motion.button>
          ))}
        </div>
      )}
    </motion.header>
  );
}
