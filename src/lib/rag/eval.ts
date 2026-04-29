/**
 * Offline Eval Set — ground truth for the intent-driven RAG pipeline.
 *
 * Each case specifies:
 *   - input:    the raw message + optional chip/source
 *   - expected: intent, formatter policy, scope, and content assertions
 *
 * Running the eval (manual for now):
 *   POST /api/chatbot with each case's input, check intent via debug logs,
 *   check reply against mustContain/mustNotContain.
 *
 * Phase 2: wire this into a Jest test or a CLI script that calls the pipeline
 * directly (bypassing HTTP) and asserts on the output.
 *
 * Case IDs follow the pattern: <set>_<index>_<short-label>
 *   chip_*   = triggered from NeuralPageIntro chip click
 *   nat_*    = natural-language question (no chip)
 *   oos_*    = out-of-scope (should be rejected)
 *   edge_*   = edge cases (greetings, ambiguous, pronoun-only)
 */

import type { Intent, FormatterPolicy } from './intents';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EvalInput = {
  message: string;
  chip?: string;
  source?: 'intro-chip' | 'chat';
};

export type EvalExpected = {
  intent: Intent;
  formatterPolicy: FormatterPolicy;
  inScope: boolean;
  /** At least one of these must match in the final reply (case-insensitive). */
  mustContain?: RegExp[];
  /** None of these may appear in the reply. */
  mustNotContain?: RegExp[];
};

export type EvalCase = {
  id: string;
  description: string;
  input: EvalInput;
  expected: EvalExpected;
};

// ─── Chip Eval Cases ──────────────────────────────────────────────────────────
// One case per chip in NeuralPageIntro. These are the highest-priority cases
// because every chip click is a guaranteed user interaction.

export const CHIP_CASES: EvalCase[] = [
  {
    id: 'chip_01_milestones',
    description: 'Timeline chip — should return career stage summary',
    input: {
      message: 'List the key career milestones in Jayakrishna Konda\'s timeline, including major roles, transitions, and impact.',
      chip: 'milestones',
      source: 'intro-chip',
    },
    expected: {
      intent: 'career',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/infosys|cognizant|enigma|umbc/i, /milestone|stage|transition|progression/i],
      mustNotContain: [/out of my scope/i, /google\.com\/search/i],
    },
  },
  {
    id: 'chip_02_journey_map',
    description: 'Journey map chip — career transitions narrative',
    input: {
      message: 'Summarize Jayakrishna Konda\'s career journey and major transitions across Infosys, Cognizant, R/SEEK UMBC, and Enigma Technologies.',
      chip: 'journey map',
      source: 'intro-chip',
    },
    expected: {
      intent: 'career',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/cognizant|enigma|umbc|infosys/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_03_neural_radar',
    description: 'Neural Radar chip — skills/tech strengths',
    input: {
      message: 'Which technical strengths stand out most in Jayakrishna Konda\'s skills graph and project portfolio?',
      chip: 'neural radar',
      source: 'intro-chip',
    },
    expected: {
      intent: 'skills',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/ml|nlp|genai|rag|python|pytorch|skills/i],
      mustNotContain: [/out of my scope/i, /batcave|56-container/i],
    },
  },
  {
    id: 'chip_04_real_time_signals',
    description: 'Real-time signals chip — infra monitoring',
    input: {
      message: 'What real-time telemetry signals and monitoring metrics does Jayakrishna Konda track in his home server setup?',
      chip: 'real-time signals',
      source: 'intro-chip',
    },
    expected: {
      intent: 'infra',
      formatterPolicy: 'infra',
      inScope: true,
      mustContain: [/batcave|container|monitor|infrastructure|service|docker/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_05_live_feed',
    description: 'Live feed chip — AI research currency',
    input: {
      message: 'How does Jayakrishna Konda stay current with AI news and apply research trends in practical projects?',
      chip: 'live feed',
      source: 'intro-chip',
    },
    expected: {
      intent: 'ai-research',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/research|trend|genai|llm|rag|applied|practical/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_06_rag_demo',
    description: 'RAG Demo chip — RAG workflow explanation',
    input: {
      message: 'How does Jayakrishna Konda implement and demonstrate RAG workflows in his projects?',
      chip: 'rag demo',
      source: 'intro-chip',
    },
    expected: {
      intent: 'ai-research',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/rag|retrieval|embedding|vector|pipeline/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_07_case_studies',
    description: 'Case Studies chip — STAR project stories',
    input: {
      message: 'What are Jayakrishna Konda\'s strongest project case studies and why are they impactful?',
      chip: 'case studies',
      source: 'intro-chip',
    },
    expected: {
      intent: 'projects',
      formatterPolicy: 'star',
      inScope: true,
      mustContain: [/project|case study|pipeline|outcome|improv|built|deploy/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_08_interactive_ux',
    description: 'Interactive UX chip — UX pattern answer',
    input: {
      message: 'How does Jayakrishna Konda apply interactive UX patterns in AI tools and portfolio experiences?',
      chip: 'interactive ux',
      source: 'intro-chip',
    },
    expected: {
      intent: 'ux-blog',
      formatterPolicy: 'ux',
      inScope: true,
      mustContain: [/ux|interactive|feedback|chatbot|chip|interface/i],
      mustNotContain: [/out of my scope/i, /batcave|56-container/i],
    },
  },
  {
    id: 'chip_09_articles',
    description: 'Articles chip — blog content themes',
    input: {
      message: 'What technical article themes does Jayakrishna Konda write about in his knowledge graph?',
      chip: 'articles',
      source: 'intro-chip',
    },
    expected: {
      intent: 'ux-blog',
      formatterPolicy: 'ux',
      inScope: true,
      mustContain: [/article|blog|guide|engineering|systems|rag|ml/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'chip_10_metrics',
    description: 'Metrics chip — measurable outcomes',
    input: {
      message: 'What measurable metrics does Jayakrishna Konda highlight across delivery, ML impact, and engineering outcomes?',
      chip: 'metrics',
      source: 'intro-chip',
    },
    expected: {
      intent: 'general-profile',
      formatterPolicy: 'extractive',
      inScope: true,
      mustContain: [/metric|outcome|improv|reduction|latency|efficiency|throughput/i],
      mustNotContain: [/out of my scope/i],
    },
  },
];

// ─── Natural Language Eval Cases ──────────────────────────────────────────────
// Common questions a visitor might type without clicking a chip.

export const NATURAL_CASES: EvalCase[] = [
  {
    id: 'nat_01_education',
    description: 'Education question — must return UMBC/GPA, not infra content',
    input: { message: 'What is his educational background?', source: 'chat' },
    expected: {
      intent: 'general-profile',
      formatterPolicy: 'extractive',
      inScope: true,
      mustContain: [/umbc|master|m\.s\.|data science|gpa/i],
      mustNotContain: [/batcave|56-container|docker|out of my scope/i],
    },
  },
  {
    id: 'nat_02_home_server',
    description: 'Home server question — must return infra content',
    input: { message: 'Tell me about his home server setup.', source: 'chat' },
    expected: {
      intent: 'infra',
      formatterPolicy: 'infra',
      inScope: true,
      mustContain: [/batcave|container|infrastructure|services|docker/i],
      mustNotContain: [/out of my scope/i, /umbc|degree/i],
    },
  },
  {
    id: 'nat_03_companies',
    description: 'Employer question — career intent',
    input: { message: 'Which companies has he worked at?', source: 'chat' },
    expected: {
      intent: 'career',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/infosys|cognizant|enigma|umbc/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'nat_04_python_skills',
    description: 'Python skills question — skills intent',
    input: { message: 'Does he know Python and machine learning frameworks?', source: 'chat' },
    expected: {
      intent: 'skills',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/python|pytorch|tensorflow|sklearn|framework|ml/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'nat_05_star_incident',
    description: 'STAR incident question — projects intent with star formatter',
    input: { message: 'Describe a production incident he debugged and resolved.', source: 'chat' },
    expected: {
      intent: 'projects',
      formatterPolicy: 'star',
      inScope: true,
      mustContain: [/situation|action|result|incident|debug|root cause|mitigation/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'nat_06_aws_cloud',
    description: 'Cloud skills question',
    input: { message: 'What cloud platforms does he use?', source: 'chat' },
    expected: {
      intent: 'skills',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/aws|gcp|azure|cloud|kubernetes|docker/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'nat_07_rag_implementation',
    description: 'RAG implementation question — ai-research intent',
    input: { message: 'How does he build RAG pipelines?', source: 'chat' },
    expected: {
      intent: 'ai-research',
      formatterPolicy: 'structured',
      inScope: true,
      mustContain: [/rag|retrieval|embedding|vector|chunk|pipeline/i],
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'nat_08_latency_improvement',
    description: 'Specific metric question — pronouns sufficient for scope',
    input: { message: 'What latency improvements has he achieved?', source: 'chat' },
    expected: {
      intent: 'general-profile',
      formatterPolicy: 'extractive',
      inScope: true,
      mustContain: [/latency|ms|improv|throughput|optim/i],
      mustNotContain: [/out of my scope/i],
    },
  },
];

// ─── Out-of-Scope Eval Cases ──────────────────────────────────────────────────
// These must be rejected. If any returns in-scope content, it's a regression.

export const OOS_CASES: EvalCase[] = [
  {
    id: 'oos_01_weather',
    description: 'Weather question — pure OOS',
    input: { message: "What's the weather in Baltimore?", source: 'chat' },
    expected: {
      intent: 'out-of-scope',
      formatterPolicy: 'extractive',
      inScope: false,
      mustContain: [/out of my scope|google\.com\/search/i],
    },
  },
  {
    id: 'oos_02_recipe',
    description: 'Recipe question — pure OOS',
    input: { message: 'Give me a recipe for pasta.', source: 'chat' },
    expected: {
      intent: 'out-of-scope',
      formatterPolicy: 'extractive',
      inScope: false,
      mustContain: [/out of my scope|google\.com\/search/i],
    },
  },
  {
    id: 'oos_03_stock_price',
    description: 'Stock price — OOS even though tech-adjacent',
    input: { message: "What's the current NVIDIA stock price?", source: 'chat' },
    expected: {
      intent: 'out-of-scope',
      formatterPolicy: 'extractive',
      inScope: false,
      mustContain: [/out of my scope|google\.com\/search/i],
    },
  },
  {
    id: 'oos_04_another_person',
    description: 'Another person — must not hallucinate Jayakrishna profile',
    input: { message: "What is Andrej Karpathy's experience?", source: 'chat' },
    expected: {
      intent: 'out-of-scope',
      formatterPolicy: 'extractive',
      inScope: false,
      mustContain: [/out of my scope|google\.com\/search/i],
      mustNotContain: [/enigma|cognizant|umbc|jayakrishna/i],
    },
  },
];

// ─── Edge Eval Cases ──────────────────────────────────────────────────────────

export const EDGE_CASES: EvalCase[] = [
  {
    id: 'edge_01_greeting',
    description: 'Greeting — short-circuits to greeting fallback',
    input: { message: 'Hi', source: 'chat' },
    expected: {
      intent: 'greeting',
      formatterPolicy: 'extractive',
      inScope: true,
      mustContain: [/hi|hello|jayakrishna|profile|resume/i],
    },
  },
  {
    id: 'edge_02_ambiguous_pronoun',
    description: 'Pronoun-only question — in-scope via pronoun reference rule',
    input: { message: 'What has he built recently?', source: 'chat' },
    expected: {
      intent: 'projects',
      formatterPolicy: 'star',
      inScope: true,
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'edge_03_chip_not_in_lookup',
    description: 'Unknown chip name — falls through to keyword scoring',
    input: {
      message: 'In the context of AI Tools Lab, how does Jayakrishna demonstrate interactive UX through projects?',
      chip: 'unknown-chip-xyz',
      source: 'intro-chip',
    },
    expected: {
      intent: 'ux-blog', // keyword scoring should pick ux from "interactive UX"
      formatterPolicy: 'ux',
      inScope: true,
      mustNotContain: [/out of my scope/i],
    },
  },
  {
    id: 'edge_04_cross_intent_bleed',
    description: 'Education answer must not bleed batcave/infra content',
    input: { message: 'Where did he study and what was his GPA?', source: 'chat' },
    expected: {
      intent: 'general-profile',
      formatterPolicy: 'extractive',
      inScope: true,
      mustContain: [/umbc|gpa|3\.91|master|data science/i],
      mustNotContain: [/batcave|56-container|docker|container/i],
    },
  },
  {
    id: 'edge_05_no_cross_intent_projects',
    description: 'Projects answer must not leak infra/batcave heavy content',
    input: {
      message: 'Tell me about a challenging ML project he delivered.',
      source: 'chat',
    },
    expected: {
      intent: 'projects',
      formatterPolicy: 'star',
      inScope: true,
      mustContain: [/project|pipeline|result|outcome|improv|deploy/i],
      mustNotContain: [/batcave|56-container|177gb|hybrid-cloud/i],
    },
  },
];

// ─── Full Eval Suite ──────────────────────────────────────────────────────────

export const ALL_EVAL_CASES: EvalCase[] = [
  ...CHIP_CASES,
  ...NATURAL_CASES,
  ...OOS_CASES,
  ...EDGE_CASES,
];

/**
 * Quick summary of the eval suite for logging / CI output.
 */
export function evalSummary(): string {
  const counts = {
    chip:    CHIP_CASES.length,
    natural: NATURAL_CASES.length,
    oos:     OOS_CASES.length,
    edge:    EDGE_CASES.length,
    total:   ALL_EVAL_CASES.length,
  };
  return JSON.stringify(counts, null, 2);
}
