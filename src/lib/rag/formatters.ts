/**
 * Intent-family formatters.
 *
 * Each export formats a structured answer for one intent family using
 * extracted sentences from RAG context. Formatters never call Ollama —
 * they compose answers from the retrieved document text.
 *
 * Pattern: selectEvidence(contextText, regex, max) → top sentences → labelled lines.
 */

import { Intent } from './intents';

// ─── Shared Helpers ───────────────────────────────────────────────────────────

const NOISE_REGEX = /^(technical skills|professional summary|education|certifications)\b/i;
const HEADER_RATIO_THRESHOLD = 0.45;

function isNoisy(s: string): boolean {
  if (s.length < 35) return true;
  if (NOISE_REGEX.test(s)) return true;
  const alpha = s.replace(/[^A-Za-z]/g, '');
  const upper = s.replace(/[^A-Z]/g, '');
  if (alpha.length > 60 && upper.length / alpha.length > HEADER_RATIO_THRESHOLD) return true;
  return false;
}

function splitSentences(contextText: string): string[] {
  return contextText
    .split(/[\n\r]+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+|\s+[-•]\s+/))
    .map((s) =>
      s
        .replace(/^[-•\d.);\s]+/, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((s) => s.length >= 35 && s.length <= 260)
    .filter((s) => !isNoisy(s));
}

function dedup(sentences: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sentences) {
    const key = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function toStandalone(s: string): string {
  return s.replace(/^(he|she|they)\s+/i, (m) => m.charAt(0).toUpperCase() + m.slice(1));
}

function selectEvidence(contextText: string, regex: RegExp, max = 3): string[] {
  return dedup(
    splitSentences(contextText)
      .filter((s) => regex.test(s))
      .map(toStandalone)
  ).slice(0, max);
}

function pick(sentences: string[], regex: RegExp): string | undefined {
  return sentences.find((s) => regex.test(s));
}

// ─── Career / Timeline ────────────────────────────────────────────────────────

export function formatCareerTimeline(contextText: string): string {
  const all = dedup(splitSentences(contextText).map(toStandalone));
  const milestone = pick(all, /(infosys|cognizant|enigma|umbc|r\/seek|internship|milestone|stage|transition)/i)
    ?? all[0]
    ?? 'Career spans software engineering, ML production, graduate research, and GenAI.';

  const progression = pick(all, /(progression|advanced|scale|optimiz|inference|pipeline|mlops|distributed)/i)
    ?? all.find((s) => s !== milestone)
    ?? 'Progressed from NLP pipeline delivery to production GenAI and infrastructure ownership.';

  const current = pick(all, /(current|enigma|genai|rag|llm|data scientist|production)/i)
    ?? all.find((s) => s !== milestone && s !== progression)
    ?? 'Currently at Enigma Technologies building GenAI and RAG production systems.';

  return [
    'Direct Answer: Career spans four stages — software engineering foundation, ML production scale-up, graduate research transition, and GenAI specialization.',
    `Foundation: ${milestone}`,
    `Progression: ${progression}`,
    `Current Stage: ${current}`,
  ].join('\n');
}

// ─── Projects / STAR ─────────────────────────────────────────────────────────

export function formatProjects(contextText: string, isStarQuery = false): string {
  const all = dedup(splitSentences(contextText).map(toStandalone));

  if (isStarQuery) {
    const situation = pick(all, /(situation|context|faced|challenge|problem|volume|bottleneck)/i)
      ?? 'Complex problem requiring a production-quality solution.';
    const action = pick(all, /(implement|design|built|develop|tuned|staged|orchestrat|async|parallel|chunk|retriev)/i)
      ?? 'Designed and implemented a staged, production-ready pipeline.';
    const result = pick(all, /(result|outcome|improv|reduction|faster|throughput|reliabil|deployed)/i)
      ?? 'Delivered measurable improvement in reliability, throughput, or quality.';
    return [
      `Situation: ${situation}`,
      `Action: ${action}`,
      `Result: ${result}`,
    ].join('\n');
  }

  const projectLine = pick(all, /(project|case study|pipeline|platform|workflow|system|api|rag|nlp|document)/i)
    ?? all[0]
    ?? 'Production projects spanning NLP, RAG, document intelligence, and inference optimization.';

  const outcomeLine = pick(all, /(outcome|improv|reduction|efficiency|latency|throughput|cost|deploy|reliabil)/i)
    ?? all.find((s) => s !== projectLine)
    ?? 'Delivered measurable reliability, latency, and workflow efficiency improvements.';

  const techLine = pick(all, /(langchain|langgraph|llamaindex|faiss|vector|embedding|pytorch|fastapi|docker)/i)
    ?? all.find((s) => s !== projectLine && s !== outcomeLine)
    ?? 'Tooling spans LLM orchestration, retrieval, and production serving frameworks.';

  return [
    'Direct Answer: Production-grade projects across RAG pipelines, document intelligence, NLP automation, and inference optimization.',
    `Project: ${projectLine}`,
    `Outcome: ${outcomeLine}`,
    `Tooling: ${techLine}`,
  ].join('\n');
}

// ─── Infrastructure / Ops ─────────────────────────────────────────────────────

export function formatInfraOps(contextText: string): string {
  const all = dedup(splitSentences(contextText).map(toStandalone));

  const stack = pick(all, /(batcave|56-container|hybrid.cloud|platform|infrastructure|docker|kubernetes|container)/i)
    ?? all[0]
    ?? 'Self-hosted, containerized AI platform with hybrid-cloud architecture.';

  const services = pick(all, /(service|database|monitor|observabilit|prometheus|grafana|netdata|llm|rag|inference|automation)/i)
    ?? all.find((s) => s !== stack)
    ?? '36+ services including LLM inference, monitoring, and automation tooling.';

  const reliability = pick(all, /(reliabil|uptime|stable|high.availab|latency|throughput|incident|guardrail|monitor|fallback)/i)
    ?? all.find((s) => s !== stack && s !== services)
    ?? 'Reliability practices include monitoring, fallback handling, and operational discipline.';

  return [
    'Direct Answer: Containerized self-hosted AI and operations platform (Batcave) with 56 containers, 36+ services, and 177 GB data footprint.',
    `Stack: ${stack}`,
    `Services: ${services}`,
    `Reliability: ${reliability}`,
  ].join('\n');
}

// ─── Skills / Tech Radar ──────────────────────────────────────────────────────

export function formatSkills(contextText: string): string {
  const mlEvidence = selectEvidence(contextText, /(ml|machine learning|model|training|inference|pytorch|tensorflow|hugging.?face)/i, 2);
  const genaiEvidence = selectEvidence(contextText, /(genai|llm|rag|langchain|langgraph|llamaindex|embedding|vector|semantic)/i, 2);
  const infraEvidence = selectEvidence(contextText, /(docker|kubernetes|aws|gcp|cloud|ci\/cd|mlops|deployment|pipeline)/i, 2);

  const primary = mlEvidence[0] ?? genaiEvidence[0] ?? 'Strong ML/GenAI skills spanning model development, RAG, and production deployment.';
  const secondary = genaiEvidence[0] !== primary ? genaiEvidence[0] : genaiEvidence[1]
    ?? mlEvidence[1]
    ?? 'GenAI stack includes LLM orchestration, retrieval, embeddings, and semantic search.';
  const infra = infraEvidence[0] ?? 'Infra proficiency: Docker, Kubernetes, AWS, CI/CD, MLOps pipeline design.';

  return [
    'Direct Answer: Skills span ML/NLP engineering, GenAI/RAG production systems, and cloud-native infrastructure.',
    `ML/NLP Core: ${primary}`,
    `GenAI/RAG: ${secondary}`,
    `Infra/MLOps: ${infra}`,
  ].join('\n');
}

// ─── AI Research / Trends ─────────────────────────────────────────────────────

export function formatAIResearch(contextText: string, chip?: string): string {
  const c = (chip ?? '').toLowerCase();

  // Sentences to exclude from ai-research answers
  const isInfraHeavy   = (s: string) => /(batcave|56-container|containerized|hybrid-cloud|177gb|services across|infrastructure stack|home.?server|self.host)/i.test(s);
  const isDanglingRef  = (s: string) => /^this trend|^this signal|^this map/i.test(s.trim());
  const isHeadline     = (s: string) => /\d\+\s*years?\s*of\s*experience\s*building\s*production|^ml engineer|^data scientist/i.test(s.trim());
  const aiFilter       = (s: string) => !isInfraHeavy(s) && !isDanglingRef(s) && !isHeadline(s);

  const trendEvidence = selectEvidence(contextText, /(trend|research|paper|publication|state.of.the.art|sota|recent|emerging|advance)/i, 3).filter(aiFilter);
  const applicationEvidence = selectEvidence(contextText, /(implement|deploy|production|practical|workflow|system|pipeline|applied)/i, 3).filter(aiFilter);
  const toolingEvidence = selectEvidence(contextText, /(rag|langchain|langgraph|llamaindex|faiss|vector|embedding|rerank|chunk)/i, 3).filter(aiFilter);

  if (c === 'rag demo') {
    const toolLine = toolingEvidence[0] ?? 'RAG pipelines built with retrieval, embeddings, and vector-backed search.';
    const workflowLine = applicationEvidence.find((s) => s !== toolLine) ?? 'Chunking, retrieval, extraction, and validation compose staged pipeline execution.';
    const outcomeLine = selectEvidence(contextText, /(outcome|improv|latency|throughput|cost|reliabil)/i, 1)[0]
      ?? 'Tuned for measurable reliability, latency, and workflow efficiency.';
    return [
      'Direct Answer: RAG is demonstrated as a production workflow with retrieval quality, orchestration, and validation layers.',
      `Tooling: ${toolLine}`,
      `Workflow: ${workflowLine}`,
      `Production Outcome: ${outcomeLine}`,
    ].join('\n');
  }

  if (c === 'lab console') {
    const toolLine = toolingEvidence[0] ?? 'Tools span RAG, LLM evaluation, API monitoring, and workflow automation.';
    const workflowLine = applicationEvidence.find((s) => s !== toolLine) ?? 'Tools are organized around build, test, monitor, and iterate loops.';
    return [
      'Direct Answer: The AI Tools Lab bundles practical tooling for building, evaluating, and operating AI workflows in production-like settings.',
      `Tooling: ${toolLine}`,
      `Workflow: ${workflowLine}`,
    ].join('\n');
  }

  const trend = trendEvidence[0] ?? 'Stays current with GenAI/LLM research trends and applies them to practical systems.';
  const applied = applicationEvidence[0] ?? 'Research signals are translated into production implementations and workflow improvements.';
  const detail = trendEvidence[1] ?? applicationEvidence[1] ?? 'Practical focus on RAG, LLM orchestration, and inference optimization.';

  return [
    'Direct Answer: Connects AI/ML research trends to practical production implementation, with applied focus on RAG, LLMs, and NLP.',
    `Research Signal: ${trend}`,
    `Applied: ${applied}`,
    `Detail: ${detail}`,
  ].join('\n');
}

// ─── UX / Blog ───────────────────────────────────────────────────────────────

export function formatUXBlog(contextText: string, chip?: string): string {
  const c = (chip ?? '').toLowerCase();

  const uxEvidence = selectEvidence(
    contextText,
    /(interactive|ux|ui|feedback|accessibility|chatbot|typing|animation|input|responsive|controls|readability|interface)/i,
    3
  );
  const blogEvidence = selectEvidence(
    contextText,
    /(article|blog|guide|tutorial|knowledge|longform|theme|systems|design|engineering)/i,
    3
  );
  const outcomeEvidence = selectEvidence(
    contextText,
    /(outcome|improv|efficiency|latency|reliability|readability|clarity|usability)/i,
    2
  );

  if (['articles', 'guides', 'ai', 'longform', 'systems', 'share', 'read aloud'].includes(c)) {
    const theme = blogEvidence[0] ?? 'Practical, production-oriented engineering content tied to real projects.';
    const detail = blogEvidence[1] ?? outcomeEvidence[0] ?? 'Content emphasizes measurable outcomes and reliable deployment practices.';
    const ux = c === 'read aloud'
      ? (uxEvidence[0] ?? 'Readability and interaction quality are considered in content delivery.')
      : (outcomeEvidence[0] ?? 'Content is structured to be discoverable and reusable.');
    return [
      `Direct Answer: His ${c} content is practical, systems-oriented, and tied to real engineering implementation.`,
      `Theme: ${theme}`,
      `Detail: ${detail}`,
      `UX / Accessibility: ${ux}`,
    ].join('\n');
  }

  const direct = uxEvidence[0] ?? 'Chip-to-chat prompting with context-aware guidance improves navigation and discovery.';
  const detailA = uxEvidence[1] ?? uxEvidence[0] ?? 'Typing-state feedback and progressive response rendering make the assistant feel responsive.';
  const detailB = uxEvidence[2] ?? outcomeEvidence[0] ?? 'Auto-resizing multiline input and clear formatting improve readability and user control.';

  return [
    'Direct Answer: Interactive UX combines clear user feedback, responsive interaction patterns, and production-oriented reliability signals.',
    `UX Pattern: ${direct}`,
    `Implementation Detail: ${detailA}`,
    `Product Effect: ${detailB}`,
  ].join('\n');
}

// ─── General Profile / Education / Contact ────────────────────────────────────

export function formatGeneralProfile(contextText: string, query: string): string {
  const q = query.toLowerCase();

  // Education branch
  if (/(education|university|degree|graduate|gpa|coursework|academic|studied|master|bachelor)/i.test(q)) {
    const degree = selectEvidence(contextText, /(umbc|university|master|m\.s\.|degree|graduate|gpa|coursework|data science)/i, 2);
    const applied = selectEvidence(contextText, /(capstone|research|thesis|internship|project|applied|dissertation)/i, 1);
    if (degree.length === 0) {
      return 'He holds an M.S. in Data Science from UMBC (GPA: 3.91/4.0), with coursework in ML, NLP, deep learning, cloud systems, and statistical learning.';
    }
    return [
      'Direct Answer: He holds an M.S. in Data Science from UMBC (GPA: 3.91/4.0), with coursework in ML, NLP, deep learning, cloud systems, and statistical learning.',
      ...degree.map((s, i) => `${['Academic Background', 'Coursework Focus'][i] ?? 'Detail'}: ${s}`),
      ...(applied[0] ? [`Applied Research: ${applied[0]}`] : []),
    ].join('\n');
  }

  // Impact / metrics branch
  if (/(metric|impact|outcome|signal view|measurable|performance)/i.test(q)) {
    const impact = selectEvidence(contextText, /(outcome|improv|reduction|efficiency|latency|throughput|cost|reliabil|metric)/i, 3);
    const primary = impact[0] ?? 'Improved core inference from ~450ms to <90ms through pipeline optimization.';
    const secondary = impact[1] ?? '30-40% workflow efficiency improvements in NLP/document intelligence contexts.';
    const tertiary = impact[2] ?? 'Measurable delivery velocity and quality improvements across production systems.';
    return [
      'Direct Answer: Quantified impact across inference latency reduction, workflow efficiency, and delivery quality.',
      `Signal 1: ${primary}`,
      `Signal 2: ${secondary}`,
      `Signal 3: ${tertiary}`,
    ].join('\n');
  }

  // Default general profile
  const all = dedup(splitSentences(contextText).map(toStandalone));
  const primary = all[0] ?? 'Data Scientist with 4+ years building production ML/GenAI systems.';
  const secondary = all[1] ?? 'Experience spans NLP, RAG, LLM orchestration, and cloud-native MLOps.';
  const tertiary = all[2] ?? 'Based in Baltimore, MD; open to collaboration and engineering roles.';

  return [
    'Direct Answer: Jayakrishna Konda is a Data Scientist specializing in production GenAI, NLP, and infrastructure.',
    `Overview: ${primary}`,
    `Specialization: ${secondary}`,
    `Background: ${tertiary}`,
  ].join('\n');
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

/**
 * Single entry point: given an intent + context, compose the formatted answer.
 */
export function formatByIntent(
  intent: Intent,
  contextText: string,
  query: string,
  chip?: string,
  isStarQuery = false
): string {
  switch (intent) {
    case 'career':
      return formatCareerTimeline(contextText);
    case 'projects':
      return formatProjects(contextText, isStarQuery);
    case 'infra':
      return formatInfraOps(contextText);
    case 'skills':
      return formatSkills(contextText);
    case 'ai-research':
      return formatAIResearch(contextText, chip);
    case 'ux-blog':
      return formatUXBlog(contextText, chip);
    case 'general-profile':
      return formatGeneralProfile(contextText, query);
    default:
      return formatGeneralProfile(contextText, query);
  }
}
