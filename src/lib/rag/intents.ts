/**
 * Canonical Intent Schema — single source of truth for the RAG pipeline.
 *
 * Drives four things:
 *   1. detectIntent()     — chip lookup + keyword scoring → Intent
 *   2. INTENT_CONFIG      — per-intent thresholds, hybrid weights, fallback policy
 *   3. DOC_INTENT_TAGS    — doc-ID prefix → Intent (used by searchByIntent)
 *   4. docPrefixesForIntent() — helper for retrieval filtering
 *
 * Hybrid scoring formula (Phase 1: alpha=0, Phase 2: alpha from nomic-embed-text):
 *   score = alpha * semanticScore + beta * keywordScore + gamma * metadataPrior
 *
 * Adding a new intent = add it to Intent, CHIP_INTENT, DOC_INTENT_TAGS, INTENT_CONFIG.
 * Adding a new chip   = one line in CHIP_INTENT.
 */

// ─── Core Types ───────────────────────────────────────────────────────────────

export type Intent =
  | 'career'          // timeline, journey, milestones, role progression
  | 'projects'        // case studies, STAR narratives, production outcomes
  | 'infra'           // home server, batcave, devops, ops monitoring
  | 'skills'          // technical stack, explainability, tool radar
  | 'ai-research'     // trends, GenAI, RAG demo, lab console, research pulse
  | 'ux-blog'         // interactive UX, blog articles, guides, accessibility
  | 'general-profile' // catch-all: education, contact, overview, impact metrics
  | 'greeting'        // hi/hello/hey — short-circuits retrieval
  | 'out-of-scope';   // OOS — never reaches retrieval

export type FormatterPolicy =
  | 'structured'   // labelled-line answer: Direct Answer + N details
  | 'extractive'   // pull best sentences, light labelling
  | 'star'         // Situation / Action / Result template
  | 'infra'        // Stack / Services / Reliability template
  | 'ux';          // UX Pattern / Implementation Detail / Product Effect

/**
 * Hybrid retrieval weights.
 * Phase 1 — alpha=0 (no embeddings yet). Only beta+gamma are active.
 * Phase 2 — set alpha>0 once nomic-embed-text embeddings are pre-computed.
 *
 * Weights do NOT need to sum to 1; scores are clamped to [0, 1] after summing.
 * This lets each component contribute without having to fully renormalize.
 */
export type HybridWeights = {
  alpha: number; // semantic similarity  (Phase 2: cosine(queryEmb, docEmb))
  beta:  number; // keyword match score  (matches / queryTerms)
  gamma: number; // metadata prior       (doc-ID prefix aligned to intent)
};

export type FallbackPolicy = {
  /** Returned verbatim when context is below minScore or minChars for this intent. */
  message: string;
  /**
   * When true, retrieval may pull docs from 'general-profile' intent as
   * supplemental context even if they don't match the primary intent.
   * Keep false for focused intents (projects, infra) to prevent cross-intent spillover.
   */
  allowSupplemental: boolean;
};

export type IntentConfig = {
  topK: number;              // max docs returned by searchByIntent
  minScore: number;          // minimum hybrid score to include a doc in context
  minContextChars: number;   // minimum total context chars to attempt formatting
  formatterPolicy: FormatterPolicy;
  fallback: FallbackPolicy;
  hybridWeights: HybridWeights;
};

// ─── Per-Intent Configuration (the "schema") ─────────────────────────────────
//
// Phase 1: alpha=0 everywhere. Only beta (keyword) and gamma (metadata) are live.
// Phase 2 target weights are documented inline — flip alpha when embeddings land.

export const INTENT_CONFIG: Record<Intent, IntentConfig> = {
  career: {
    topK: 5,
    minScore: 0.10,
    minContextChars: 80,
    formatterPolicy: 'structured',
    fallback: {
      message:
        "I don't have enough detail on that career aspect. The Timeline section of the portfolio has the full journey.",
      allowSupplemental: false,
    },
    // Phase 2 target: { alpha: 0.3, beta: 0.5, gamma: 0.2 }
    // Keyword matters for exact company names; gamma anchors timeline docs.
    hybridWeights: { alpha: 0, beta: 0.65, gamma: 0.35 },
  },

  projects: {
    topK: 4,
    minScore: 0.12,
    minContextChars: 100,
    formatterPolicy: 'star',
    fallback: {
      message:
        "I don't have a documented story for that project. The Projects section has full case studies.",
      allowSupplemental: false, // never mix infra/blog docs into STAR answers
    },
    // Phase 2 target: { alpha: 0.25, beta: 0.55, gamma: 0.20 }
    // Exact term matching critical for STAR docs; no semantic drift.
    hybridWeights: { alpha: 0, beta: 0.70, gamma: 0.30 },
  },

  infra: {
    topK: 4,
    minScore: 0.10,
    minContextChars: 80,
    formatterPolicy: 'infra',
    fallback: {
      message:
        "I don't have live metrics for that service. The Home Server section shows real-time stats.",
      allowSupplemental: false,
    },
    // Phase 2 target: { alpha: 0.15, beta: 0.65, gamma: 0.20 }
    // High beta — infra questions use exact service/container names.
    hybridWeights: { alpha: 0, beta: 0.70, gamma: 0.30 },
  },

  skills: {
    topK: 5,
    minScore: 0.08,
    minContextChars: 60,
    formatterPolicy: 'structured',
    fallback: {
      message:
        "I don't have a breakdown for that skill. The Skills section has the full neural radar.",
      allowSupplemental: false,
    },
    // Phase 2 target: { alpha: 0.40, beta: 0.40, gamma: 0.20 }
    // Higher alpha — skills benefit from semantic (pytorch ≈ deep learning).
    hybridWeights: { alpha: 0, beta: 0.65, gamma: 0.35 },
  },

  'ai-research': {
    topK: 4,
    minScore: 0.10,
    minContextChars: 80,
    formatterPolicy: 'structured',
    fallback: {
      message:
        "I don't have research context on that topic. The AI Tools Lab section demonstrates applied workflows.",
      allowSupplemental: false,
    },
    // Phase 2 target: { alpha: 0.50, beta: 0.30, gamma: 0.20 }
    // Semantic-heavy — research terms are paraphrase-heavy (LLM ≈ large language model).
    hybridWeights: { alpha: 0, beta: 0.65, gamma: 0.35 },
  },

  'ux-blog': {
    topK: 3,
    minScore: 0.10,
    minContextChars: 60,
    formatterPolicy: 'ux',
    fallback: {
      message:
        "I don't have content details on that. The Blog section has articles, guides, and interactive patterns.",
      allowSupplemental: false,
    },
    // Phase 2 target: { alpha: 0.35, beta: 0.45, gamma: 0.20 }
    hybridWeights: { alpha: 0, beta: 0.65, gamma: 0.35 },
  },

  'general-profile': {
    topK: 5,
    minScore: 0.08,
    minContextChars: 60,
    formatterPolicy: 'extractive',
    fallback: {
      message:
        "I don't have that specific detail in the profile documents. Contact Jayakrishna directly for more information.",
      allowSupplemental: true, // general profile may draw from any intent's docs
    },
    // Phase 2 target: { alpha: 0.35, beta: 0.45, gamma: 0.20 }
    hybridWeights: { alpha: 0, beta: 0.65, gamma: 0.35 },
  },

  greeting: {
    topK: 0,
    minScore: 0,
    minContextChars: 0,
    formatterPolicy: 'extractive',
    fallback: {
      message:
        "Hi! I can answer questions about Jayakrishna Konda's profile, resume, projects, skills, and related documents.",
      allowSupplemental: false,
    },
    hybridWeights: { alpha: 0, beta: 0, gamma: 0 },
  },

  'out-of-scope': {
    topK: 0,
    minScore: 1.1, // unreachable — always falls through to fallback
    minContextChars: 9999,
    formatterPolicy: 'extractive',
    fallback: {
      message:
        'I am confined to answer details about Jayakrishna; such questions are out of my scope of answering.',
      allowSupplemental: false,
    },
    hybridWeights: { alpha: 0, beta: 0, gamma: 0 },
  },
};

// ─── Chip → Intent Lookup ─────────────────────────────────────────────────────
//
// O(1) resolution. Add one line here to support a new chip.

export const CHIP_INTENT: Record<string, Intent> = {
  // Career / timeline
  'milestones':        'career',
  'journey map':       'career',
  'narrative flow':    'career',

  // Skills radar
  'neural radar':      'skills',
  'explainability':    'skills',
  'nlp':               'skills',
  'devops':            'skills',
  'full-stack':        'skills',

  // Infra / ops
  'real-time signals': 'infra',
  'ops insight':       'infra',
  'infrastructure':    'infra',

  // AI research / lab
  'live feed':         'ai-research',
  'trend signals':     'ai-research',
  'research pulse':    'ai-research',
  'genai':             'ai-research',
  'rag demo':          'ai-research',
  'lab console':       'ai-research',

  // Projects / case studies
  'case studies':      'projects',
  'production focus':  'projects',
  'interactive cards': 'projects',

  // UX / blog
  'interaction':       'ux-blog',
  'interactive ux':    'ux-blog',
  'clear feedback':    'ux-blog',
  'articles':          'ux-blog',
  'guides':            'ux-blog',
  'systems':           'ux-blog',
  'ai':                'ux-blog',
  'longform':          'ux-blog',
  'share':             'ux-blog',
  'read aloud':        'ux-blog',

  // General profile
  'metrics':           'general-profile',
  'outcomes':          'general-profile',
  'signal view':       'general-profile',
  'fast response':     'general-profile',
  'secure form':       'general-profile',
};

// ─── Doc-ID Prefix → Intent ───────────────────────────────────────────────────
//
// Used by searchByIntent() to compute the metadata prior (gamma component).
// Key = lowercase doc-ID prefix. Longer/more-specific prefixes win via startsWith order.

export const DOC_INTENT_TAGS: Record<string, Intent> = {
  // Career
  chip_timeline:                  'career',
  chip_career:                    'career',
  chip_internship:                'career',
  chip_cognizant_ml:              'career',
  chip_enigma_genai:              'career',

  // Projects / STAR
  chip_star_:                     'projects',
  chip_enigma_projects:           'projects',
  chip_cognizant_projects:        'projects',
  chip_projects:                  'projects',
  chip_umbc_capstones:            'projects',

  // Infra / Ops
  chip_homeserver:                'infra',
  chip_production_mlops:          'infra',

  // Skills
  chip_skills:                    'skills',
  chip_technical_stack:           'skills',
  chip_domain_impact:             'skills',
  chip_stakeholder:               'skills',
  chip_career_impact:             'skills',
  chip_career_turning:            'skills',

  // AI Research
  chip_ai_trend:                  'ai-research',
  chip_research_to_production:    'ai-research',

  // UX / Blog
  chip_blog:                      'ux-blog',
  chip_interactive_ux:            'ux-blog',

  // General Profile (supplemental for any intent)
  chip_impact_signal:             'general-profile',
  chip_contact:                   'general-profile',
  profile:                        'general-profile',
  resume_jayakrishna:             'general-profile', // lowercased prefix match
  text:                           'general-profile',
};

// ─── Intent Detection ─────────────────────────────────────────────────────────

type IntentSignal = { intent: Intent; pattern: RegExp };

const INTENT_SIGNALS: IntentSignal[] = [
  {
    intent: 'career',
    pattern: /timeline|journey|milestone|transition|progression|career|role|company|employer|infosys|cognizant|enigma|umbc|r\/seek|promotion|background/i,
  },
  {
    intent: 'projects',
    pattern: /project|case study|star|situation|task|action|result|incident|debug|architecture|decision|built|implemented|production|delivery|outcome/i,
  },
  {
    intent: 'infra',
    pattern: /home.?server|batcave|infrastructure|self.host|docker|container|kubernetes|monitoring|telemetry|uptime|services|devops|ops|reliability/i,
  },
  {
    intent: 'skills',
    pattern: /skill|technical|stack|tool|language|framework|python|pytorch|react|next\.?js|ml|model|explainab|radar|tech|expertise|profici/i,
  },
  {
    intent: 'ai-research',
    pattern: /trend|research|genai|llm|rag|retrieval|vector|embedding|semantic search|ai news|lab|paper|publication/i,
  },
  {
    intent: 'ux-blog',
    pattern: /ux|ui|interactive|chatbot|article|blog|guide|longform|accessibility|reader|read aloud|share|feedback|chip prompt/i,
  },
  {
    intent: 'general-profile',
    pattern: /education|university|degree|gpa|master|graduate|contact|email|linkedin|github|metric|impact|signal view|measurable|outcomes/i,
  },
];

/**
 * Resolves the intent for a (query, chip) pair.
 *
 * Priority:
 *   1. Chip-name exact lookup in CHIP_INTENT (O(1))
 *   2. Keyword scoring across INTENT_SIGNALS (returns highest match count)
 *   3. 'general-profile' as safe default for in-scope queries
 */
export function detectIntent(query: string, chip?: string): Intent {
  // 1. Chip lookup
  if (chip) {
    const key = chip.toLowerCase().trim();
    if (key in CHIP_INTENT) return CHIP_INTENT[key];
  }

  // 2. Keyword scoring (count matches per intent, pick winner)
  let best: Intent | null = null;
  let bestCount = 0;
  for (const { intent, pattern } of INTENT_SIGNALS) {
    const matches = query.match(new RegExp(pattern.source, 'gi'));
    if (matches && matches.length > bestCount) {
      bestCount = matches.length;
      best = intent;
    }
  }
  if (best) return best;

  return 'general-profile';
}

/**
 * Returns doc-ID prefixes whose metadata prior (gamma) should be boosted
 * for a given intent. Supplemental docs (general-profile) are included
 * only when the intent's FallbackPolicy allows it.
 */
export function docPrefixesForIntent(intent: Intent): { primary: string[]; supplemental: string[] } {
  const primary = Object.entries(DOC_INTENT_TAGS)
    .filter(([, v]) => v === intent)
    .map(([k]) => k.toLowerCase());

  const supplemental = INTENT_CONFIG[intent].fallback.allowSupplemental
    ? Object.entries(DOC_INTENT_TAGS)
        .filter(([, v]) => v === 'general-profile')
        .map(([k]) => k.toLowerCase())
    : [];

  return { primary, supplemental };
}
