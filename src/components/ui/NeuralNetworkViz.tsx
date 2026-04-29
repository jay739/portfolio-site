'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCompass } from 'react-icons/fa';

// ─── Category colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { base: string; glow: string; r: number; g: number; b: number }> = {
  genai:    { base: '#F97316', glow: '#FDBA74', r: 249, g: 115, b: 22  },
  devops:   { base: '#FB923C', glow: '#FED7AA', r: 251, g: 146, b: 60  },
  frontend: { base: '#F59E0B', glow: '#FCD34D', r: 245, g: 158, b: 11  },
  backend:  { base: '#D97706', glow: '#FBBF24', r: 217, g: 119, b: 6   },
  database: { base: '#FBBF24', glow: '#FDE68A', r: 251, g: 191, b: 36  },
  cloud:    { base: '#C2410C', glow: '#FDBA74', r: 194, g: 65,  b: 12  },
  project:  { base: '#EA580C', glow: '#FDBA74', r: 234, g: 88,  b: 12  },
  outcome:  { base: '#FED7AA', glow: '#FFEDD5', r: 254, g: 215, b: 170 },
};

// ─── Node definitions ─────────────────────────────────────────────────────────
interface NodeDef {
  id: string;
  label: string;
  category: keyof typeof CATEGORY_COLORS;
  icon: string;
  layer: number; // 0=input, 1=hidden1, 2=hidden2(projects), 3=output
  tooltip: { title: string; desc: string; tags?: string[] };
}

const NODE_DEFS: NodeDef[] = [
  // ── Layer 0 — Input: Core skills & tools ──────────────────────────────────
  { id: 'python',     label: 'Python',      category: 'backend',  icon: 'PY', layer: 0,
    tooltip: { title: 'Python', desc: 'Primary language for AI/ML, automation & scripting', tags: ['ML', 'Automation', 'Data'] } },
  { id: 'pytorch',    label: 'PyTorch',     category: 'genai',    icon: 'PT', layer: 0,
    tooltip: { title: 'PyTorch', desc: 'Deep learning framework for NLP, CV, and fine-tuning (LoRA/QLoRA)', tags: ['Deep Learning', 'LoRA', 'NLP', 'CV'] } },
  { id: 'tensorflow', label: 'TensorFlow',  category: 'genai',    icon: 'TF', layer: 0,
    tooltip: { title: 'TensorFlow', desc: 'CNN training, TFLite for edge inference on ESP32', tags: ['CNN', 'TFLite', 'Edge AI'] } },
  { id: 'langchain',  label: 'LangChain',   category: 'genai',    icon: 'LC', layer: 0,
    tooltip: { title: 'LangChain', desc: 'LLM orchestration, agent graphs & FAISS-backed RAG pipelines', tags: ['RAG', 'LLM', 'Agents', 'LangGraph'] } },
  { id: 'ollama',     label: 'Ollama',      category: 'genai',    icon: 'OL', layer: 0,
    tooltip: { title: 'Ollama', desc: 'Self-hosted LLM inference — LLaMA, Mistral, Phi, DeepSeek on Batcave', tags: ['LLM', 'Self-hosted', 'Inference'] } },
  { id: 'docker',     label: 'Docker',      category: 'devops',   icon: 'DK', layer: 0,
    tooltip: { title: 'Docker', desc: '56-container production orchestration on Batcave ML cloud', tags: ['Containers', 'CI/CD', 'Compose'] } },
  { id: 'linux',      label: 'Linux',       category: 'devops',   icon: 'LX', layer: 0,
    tooltip: { title: 'Linux / Shell', desc: 'Kernel-level tuning, shell automation, and server administration', tags: ['Bash', 'Kernel', 'Server Admin'] } },
  { id: 'postgres',   label: 'PostgreSQL',  category: 'database', icon: 'PG', layer: 0,
    tooltip: { title: 'PostgreSQL', desc: 'Primary production SQL — part of 177 GB multi-DB architecture', tags: ['SQL', 'Vector Store', 'Redis'] } },
  { id: 'typescript', label: 'TypeScript',  category: 'frontend', icon: 'TS', layer: 0,
    tooltip: { title: 'TypeScript', desc: 'Type-safe full-stack web development', tags: ['Next.js', 'React'] } },
  { id: 'nextjs',     label: 'Next.js',     category: 'frontend', icon: 'NX', layer: 0,
    tooltip: { title: 'Next.js', desc: 'Full-stack React framework — App Router, Server Components, API routes', tags: ['SSR', 'API Routes', 'RSC'] } },
  { id: 'aws',        label: 'AWS / OCI',   category: 'cloud',    icon: 'CL', layer: 0,
    tooltip: { title: 'Cloud Platforms', desc: 'SageMaker, Lambda, S3, ECR; Oracle Cloud for VPS hosting', tags: ['SageMaker', 'Lambda', 'OCI', 'ECR'] } },

  // ── Layer 1 — Hidden: Derived capabilities ────────────────────────────────
  { id: 'nlp',        label: 'NLP',         category: 'genai',    icon: 'NLP', layer: 1,
    tooltip: { title: 'NLP & Text AI', desc: 'Entity extraction, classification, FinBERT sentiment, legal/healthcare text intelligence', tags: ['Transformers', 'FinBERT', 'SpaCy', 'NLTK'] } },
  { id: 'rag',        label: 'RAG Pipelines', category: 'genai',  icon: 'RAG', layer: 1,
    tooltip: { title: 'RAG Pipelines', desc: 'Retrieval-Augmented Generation — FAISS vector search, semantic chunking, reranking', tags: ['FAISS', 'Embeddings', 'Semantic Search', 'LangChain'] } },
  { id: 'cv',         label: 'Computer Vision', category: 'genai', icon: 'CV', layer: 1,
    tooltip: { title: 'Computer Vision', desc: 'CNN architectures, YOLOv8 object detection, satellite imagery analysis', tags: ['YOLOv8', 'AllCNN', 'Sentinel-2', 'NDVI'] } },
  { id: 'mlops',      label: 'MLOps',       category: 'genai',    icon: 'OPS', layer: 1,
    tooltip: { title: 'MLOps', desc: 'End-to-end ML pipelines — MLflow, GitHub Actions CI/CD, drift detection, model versioning', tags: ['MLflow', 'GitHub Actions', 'Jenkins', 'Drift'] } },
  { id: 'k8s',        label: 'Kubernetes',  category: 'devops',   icon: 'K8', layer: 1,
    tooltip: { title: 'Kubernetes', desc: 'Container orchestration, Portainer management & autoscaling', tags: ['Helm', 'Portainer', 'Autoscaling'] } },
  { id: 'nginx',      label: 'Nginx',       category: 'devops',   icon: 'NG', layer: 1,
    tooltip: { title: 'Nginx', desc: 'Reverse proxy, SSL termination, Authentik SSO integration', tags: ['SSL/TLS', 'Proxy', 'Authentik'] } },
  { id: 'monitoring', label: 'Monitoring',  category: 'devops',   icon: 'MON', layer: 1,
    tooltip: { title: 'Infrastructure Monitoring', desc: 'Real-time observability — Netdata, Uptime Kuma, Telegram alerts, Prometheus metrics', tags: ['Netdata', 'Prometheus', 'Telegram', 'Alerting'] } },
  { id: 'react',      label: 'React',       category: 'frontend', icon: 'RX', layer: 1,
    tooltip: { title: 'React / UI', desc: 'Component-driven interfaces with Framer Motion and Tailwind CSS', tags: ['Tailwind', 'Framer Motion', 'Shadcn'] } },
  { id: 'redis',      label: 'Redis',       category: 'database', icon: 'RD', layer: 1,
    tooltip: { title: 'Redis', desc: 'In-memory cache, session store, LLM semantic cache, and pub/sub', tags: ['Cache', 'Pub/Sub', 'Semantic Cache'] } },

  // ── Layer 2 — Projects ────────────────────────────────────────────────────
  { id: 'batcave',      label: 'Batcave',        category: 'project', icon: 'BC', layer: 2,
    tooltip: { title: 'Batcave AI Platform', desc: 'Solo-built private ML cloud · 56 containers · 99.9% uptime · LLMs, RAG, media, monitoring', tags: ['Docker', 'LLM', 'RAG', 'Authentik', 'Tailscale'] } },
  { id: 'forestfire',   label: 'Wildfire CNN',   category: 'project', icon: 'FF', layer: 2,
    tooltip: { title: 'Wildfire Detection', desc: 'AllCNN on Sentinel-2 satellite imagery · 91% accuracy · 88% F1 · NDVI/NBR spectral indices', tags: ['AllCNN', 'Sentinel-2', 'TensorFlow', 'NDVI'] } },
  { id: 'ragpodcast',   label: 'RAG Podcast',    category: 'project', icon: 'RP', layer: 2,
    tooltip: { title: 'RAG Podcast Generator', desc: 'PDF → LLM → TTS pipeline · 98% OCR accuracy · LoRA fine-tuned · 4× throughput gain', tags: ['RAG', 'TTS', 'OCR', 'LoRA', 'LangChain'] } },
  { id: 'financial-risk', label: 'Fin. Risk Suite', category: 'project', icon: 'FR', layer: 2,
    tooltip: { title: 'Financial Risk & Sentiment Suite', desc: 'FinBERT sentiment (87% acc) · 1,000+ Monte Carlo VaR simulations · CAPM & Sharpe ratio for 50+ stocks', tags: ['FinBERT', 'Monte Carlo', 'CAPM', 'VaR'] } },
  { id: 'edge-node',    label: 'Edge Node',      category: 'project', icon: 'EN', layer: 2,
    tooltip: { title: 'Distributed Edge Automation', desc: 'Android repurposed as low-power edge node · custom ROM + kernel tuning · DDNS, WoL, Telegram webhooks', tags: ['Android ROM', 'Kernel', 'DDNS', 'WoL'] } },
  { id: 'portfolio',    label: 'Portfolio Site', category: 'project', icon: 'PF', layer: 2,
    tooltip: { title: 'Portfolio Site', desc: 'This site · Next.js App Router · neural map · Sentry monitoring · Google Analytics', tags: ['Next.js', 'TypeScript', 'AI Chatbot', 'Sentry'] } },

  // ── Layer 3 — Outcomes ────────────────────────────────────────────────────
  { id: 'aiplatform',     label: 'AI Platform',  category: 'outcome', icon: 'AI', layer: 3,
    tooltip: { title: 'Production AI Systems', desc: 'End-to-end LLM platforms, RAG services, and ML inference at scale', tags: ['LLM', 'RAG', 'MLOps', 'GenAI'] } },
  { id: 'devopsplatform', label: 'DevOps Infra', category: 'outcome', icon: 'DV', layer: 3,
    tooltip: { title: 'DevOps Infrastructure', desc: 'Automated, monitored, zero-downtime deployment pipelines and self-hosted infrastructure', tags: ['CI/CD', 'Docker', 'Kubernetes', 'Monitoring'] } },
  { id: 'datascience',    label: 'Data Science', category: 'outcome', icon: 'DS', layer: 3,
    tooltip: { title: 'Data Science Solutions', desc: 'Production ML models, analytics pipelines, and NLP/CV workflows on real datasets', tags: ['ML', 'CV', 'NLP', 'FinBERT'] } },
  { id: 'fullstack',      label: 'Full Stack',   category: 'outcome', icon: 'FS', layer: 3,
    tooltip: { title: 'Full-Stack Apps', desc: 'End-to-end web applications from database to deployed UI', tags: ['React', 'Next.js', 'REST', 'TypeScript'] } },
];

// ─── Edge definitions ─────────────────────────────────────────────────────────
const EDGE_DEFS: [string, string][] = [
  // ── Input → Capabilities ──────────────────────────────────────────────────
  // Python wires into NLP, MLOps
  ['python',     'nlp'],    ['python',     'mlops'],
  // PyTorch → NLP, CV, MLOps (fine-tuning & training)
  ['pytorch',    'nlp'],    ['pytorch',    'cv'],    ['pytorch', 'mlops'],
  // TensorFlow → NLP, CV
  ['tensorflow', 'nlp'],    ['tensorflow', 'cv'],    ['tensorflow', 'mlops'],
  // LangChain → NLP, RAG, MLOps
  ['langchain',  'nlp'],    ['langchain',  'rag'],
  // Ollama → RAG (local LLM inference for RAG), NLP
  ['ollama',     'rag'],    ['ollama',     'nlp'],
  // Docker → Kubernetes, Nginx, MLOps
  ['docker',     'k8s'],    ['docker',     'nginx'], ['docker', 'mlops'],
  // Linux → Kubernetes, Nginx, Monitoring
  ['linux',      'k8s'],    ['linux',      'nginx'], ['linux',  'monitoring'],
  // Postgres → Redis (data layer), NLP (embeddings), RAG (vector store)
  ['postgres',   'redis'],  ['postgres',   'nlp'],   ['postgres', 'rag'],
  // TypeScript / Next.js → React UI capability
  ['typescript', 'react'],  ['nextjs',     'react'],
  // AWS → Kubernetes, MLOps, Nginx
  ['aws',        'k8s'],    ['aws',        'mlops'], ['aws', 'nginx'],

  // ── Capabilities → Projects ───────────────────────────────────────────────
  // NLP powers Batcave (document Q&A), RAG Podcast (text), Wildfire (spectral NLP)
  ['nlp',        'batcave'],       ['nlp',    'ragpodcast'], ['nlp',  'forestfire'],
  // RAG powers Batcave (Q&A over docs) and RAG Podcast (retrieval)
  ['rag',        'batcave'],       ['rag',    'ragpodcast'],
  // Computer Vision powers Wildfire detection
  ['cv',         'forestfire'],
  // MLOps is the backbone of Batcave, Wildfire training pipeline
  ['mlops',      'batcave'],       ['mlops',  'forestfire'], ['mlops', 'financial-risk'],
  // K8s / Nginx / Monitoring all run inside Batcave
  ['k8s',        'batcave'],
  ['nginx',      'batcave'],       ['nginx',  'portfolio'],
  ['monitoring', 'batcave'],
  // React / Redis for Batcave and Portfolio
  ['react',      'portfolio'],
  ['redis',      'batcave'],
  // NLP + MLOps → Financial Risk (FinBERT + pipelines)
  ['nlp',        'financial-risk'],
  // Linux / Nginx / K8s → Edge Node (OS-level automation)
  ['linux',      'edge-node'],     ['nginx', 'edge-node'],
  // Direct skill → project links (tool IS the stack)
  ['typescript', 'portfolio'],     ['nextjs', 'portfolio'],
  ['langchain',  'batcave'],

  // ── Projects → Outcomes ───────────────────────────────────────────────────
  ['batcave',       'aiplatform'], ['batcave',       'devopsplatform'],
  ['forestfire',    'aiplatform'], ['forestfire',    'datascience'],
  ['ragpodcast',    'aiplatform'], ['ragpodcast',    'datascience'],
  ['financial-risk','datascience'],
  ['edge-node',     'devopsplatform'], ['edge-node', 'aiplatform'],
  ['portfolio',     'fullstack'],  ['portfolio',     'datascience'],
];

const CATEGORY_NODE_COUNTS = NODE_DEFS.reduce((acc, node) => {
  acc[node.category] = (acc[node.category] || 0) + 1;
  return acc;
}, {} as Record<keyof typeof CATEGORY_COLORS, number>);

const NODE_LOOKUP = NODE_DEFS.reduce((acc, node) => {
  acc[node.id] = node;
  return acc;
}, {} as Record<string, NodeDef>);

const NEIGHBOR_MAP = EDGE_DEFS.reduce((acc, [src, dst]) => {
  if (!acc[src]) acc[src] = new Set<string>();
  if (!acc[dst]) acc[dst] = new Set<string>();
  acc[src].add(dst);
  acc[dst].add(src);
  return acc;
}, {} as Record<string, Set<string>>);

function nodeMatchesQuery(node: NodeDef, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    node.id,
    node.label,
    node.tooltip.title,
    node.tooltip.desc,
    ...(node.tooltip.tags ?? []),
    node.category,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalized);
}

// ─── Runtime node state ───────────────────────────────────────────────────────
interface LiveNode extends NodeDef {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  pulsePhase: number;
  hovered: boolean;
  baseRadius: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ─── Main component ───────────────────────────────────────────────────────────
interface NeuralNetworkVizProps {
  scrollProgress?: number; // 0-1
  isActive?: boolean;
  isDark?: boolean;
  mode?: 'orbit' | 'map';
  showControls?: boolean;
  interactive?: boolean;
  transparentBackground?: boolean;
  orbitRadiusScale?: number;
  orbitCenterYOffset?: number;
  orbitEdgePadding?: number;
}

// Node IDs that link to pages on click
const NODE_LINKS: Record<string, string> = {
  // Layer 0 — skills page
  python: '/skills', pytorch: '/skills', tensorflow: '/skills', langchain: '/skills',
  ollama: '/skills', docker: '/skills', linux: '/skills', postgres: '/skills',
  typescript: '/skills', nextjs: '/skills', aws: '/skills',
  // Layer 1 — skills page
  nlp: '/skills', rag: '/skills', cv: '/skills', mlops: '/skills',
  k8s: '/skills', nginx: '/skills', monitoring: '/skills', react: '/skills', redis: '/skills',
  // Layer 2 — projects page
  batcave: '/projects', forestfire: '/projects', ragpodcast: '/projects',
  'financial-risk': '/projects', 'edge-node': '/projects', portfolio: '/projects',
  // Layer 3 — impact page
  aiplatform: '/impact', devopsplatform: '/impact', datascience: '/impact', fullstack: '/impact',
};

export default function NeuralNetworkViz({
  scrollProgress = 0,
  isActive = true,
  isDark = true,
  mode = 'orbit',
  showControls = true,
  interactive = true,
  transparentBackground = false,
  orbitRadiusScale = 1,
  orbitCenterYOffset = 0,
  orbitEdgePadding = 96,
}: NeuralNetworkVizProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const nodesRef = useRef<LiveNode[]>([]);
  const dimRef = useRef({ w: 0, h: 0, dpr: 1 });
  const [tooltip, setTooltip] = useState<{ node: NodeDef; x: number; y: number } | null>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);
  const [isHoveringNode, setIsHoveringNode] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Array<keyof typeof CATEGORY_COLORS>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusLinkedOnly, setFocusLinkedOnly] = useState(false);
  const lastHoverRef = useRef<string | null>(null);
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);
  const rippleRef = useRef<Array<{ x: number; y: number; start: number; color: string }>>([]);
  const activeCategoriesRef = useRef<Array<keyof typeof CATEGORY_COLORS>>([]);
  const searchQueryRef = useRef('');
  const focusLinkedOnlyRef = useRef(false);
  const pinnedNodeIdRef = useRef<string | null>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;
  const activeRef = useRef(isActive);
  activeRef.current = isActive;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    activeCategoriesRef.current = activeCategories;
  }, [activeCategories]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    focusLinkedOnlyRef.current = focusLinkedOnly;
  }, [focusLinkedOnly]);

  useEffect(() => {
    pinnedNodeIdRef.current = pinnedNodeId;
  }, [pinnedNodeId]);

  useEffect(() => {
    if (!pinnedNodeId || activeCategories.length === 0) return;
    const pinnedNode = NODE_DEFS.find((node) => node.id === pinnedNodeId);
    if (!pinnedNode) return;
    if (!activeCategories.includes(pinnedNode.category)) {
      setPinnedNodeId(null);
      setTooltip(null);
    }
  }, [activeCategories, pinnedNodeId]);

  const isCategoryVisible = useCallback(
    (category: keyof typeof CATEGORY_COLORS) =>
      activeCategoriesRef.current.length === 0 || activeCategoriesRef.current.includes(category),
    []
  );

  const isSearchVisible = useCallback((node: NodeDef) => nodeMatchesQuery(node, searchQueryRef.current), []);

  const isLinkedFocusVisible = useCallback((nodeId: string) => {
    if (!focusLinkedOnlyRef.current) return true;
    const pinned = pinnedNodeIdRef.current;
    if (!pinned) return true;
    if (pinned === nodeId) return true;
    return !!NEIGHBOR_MAP[pinned]?.has(nodeId);
  }, []);

  const isNodeEmphasized = useCallback(
    (node: NodeDef) => isCategoryVisible(node.category) && isSearchVisible(node) && isLinkedFocusVisible(node.id),
    [isCategoryVisible, isLinkedFocusVisible, isSearchVisible]
  );

  const computeTooltipPosition = useCallback((nodeX: number, nodeY: number) => {
    const { w = 1000, h = 700 } = dimRef.current;
    const tooltipWidth = 228;
    const tooltipHeight = 170;
    let x = nodeX + 36;
    let y = nodeY - 90;

    if (x + tooltipWidth > w - 8) {
      x = Math.max(8, nodeX - tooltipWidth - 24);
    }
    if (y + tooltipHeight > h - 8) {
      y = Math.max(8, h - tooltipHeight - 8);
    }
    if (y < 8) {
      y = 8;
    }
    return { x, y };
  }, []);

  const toggleCategory = (category: keyof typeof CATEGORY_COLORS) => {
    setActiveCategories((prev) =>
      prev.includes(category) ? prev.filter((entry) => entry !== category) : [...prev, category]
    );
  };

  // ── Layout computation ──────────────────────────────────────────────────────
  const computeLayout = useCallback((w: number, h: number, scroll: number) => {
    const layers = [0, 1, 2, 3];
    const layerNodes = layers.map(l => NODE_DEFS.filter(n => n.layer === l));
    const colCount = 4;

    // layered layout positions
    const layeredPositions: Record<string, { x: number; y: number }> = {};
    layerNodes.forEach((nodes, li) => {
      const xFraction = (li + 1) / (colCount + 1);
      const x = w * xFraction;
      nodes.forEach((node, ni) => {
        const totalInLayer = nodes.length;
        const spacing = h / (totalInLayer + 1);
        const y = spacing * (ni + 1);
        layeredPositions[node.id] = { x, y };
      });
    });

    // radial layout positions (activated on scroll)
    const radialPositions: Record<string, { x: number; y: number }> = {};
    const cx = w / 2;
    const cy = h / 2;
    const totalNodes = NODE_DEFS.length;
    NODE_DEFS.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / totalNodes - Math.PI / 2;
      const baseR = Math.min(w, h) * 0.35;
      const layerR = baseR * (0.5 + node.layer * 0.17);
      radialPositions[node.id] = {
        x: cx + Math.cos(angle) * layerR,
        y: cy + Math.sin(angle) * layerR,
      };
    });

    // Blend based on scroll
    const t = Math.min(scroll * 2.5, 1);
    const blend = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out

    return NODE_DEFS.reduce((acc, node) => {
      const lp = layeredPositions[node.id];
      const rp = radialPositions[node.id];
      acc[node.id] = {
        x: lp.x * (1 - blend) + rp.x * blend,
        y: lp.y * (1 - blend) + rp.y * blend,
      };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, []);

  const computeOrbitPositions = useCallback((w: number, h: number, t: number) => {
    const cx = w / 2;
    const cy = h / 2 + orbitCenterYOffset;
    const totalNodes = NODE_DEFS.length;
    const desiredRadius = Math.min(w, h) * 0.34 * orbitRadiusScale;
    const edgePadding = orbitEdgePadding;
    const maxRadiusX = Math.max(40, w / 2 - edgePadding);
    const maxRadiusY = Math.max(40, Math.min(cy - edgePadding, h - cy - edgePadding));
    const orbitRadius = Math.min(desiredRadius, maxRadiusX, maxRadiusY);
    return NODE_DEFS.reduce((acc, node, i) => {
      const angle = t * 0.2 + (i / totalNodes) * Math.PI * 2;
      acc[node.id] = {
        x: cx + Math.cos(angle) * orbitRadius,
        y: cy + Math.sin(angle) * orbitRadius,
      };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, [orbitCenterYOffset, orbitEdgePadding, orbitRadiusScale]);

  // ── Init nodes ──────────────────────────────────────────────────────────────
  const initNodes = useCallback((w: number, h: number) => {
    const positions = computeOrbitPositions(w, h, 0);
    nodesRef.current = NODE_DEFS.map(def => ({
      ...def,
      x: positions[def.id].x,
      y: positions[def.id].y,
      targetX: positions[def.id].x,
      targetY: positions[def.id].y,
      pulsePhase: Math.random() * Math.PI * 2,
      hovered: false,
      baseRadius: def.layer === 2 ? 30 : def.layer === 3 ? 26 : 20,
    }));
  }, [computeOrbitPositions]);

  // ── Canvas setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      dimRef.current = { w, h, dpr };
      initNodes(w, h);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, [initNodes]);

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = (timestamp: number) => {
      const dt = Math.min((timestamp - timeRef.current) / 1000, 0.05);
      timeRef.current = timestamp;
      const t = timestamp / 1000;

      const { w, h, dpr } = dimRef.current;
      if (!w || !h) { animRef.current = requestAnimationFrame(draw); return; }

      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Update target positions from mode
      const positions = modeRef.current === 'map'
        ? computeLayout(w, h, scrollRef.current)
        : computeOrbitPositions(w, h, t);
      nodesRef.current.forEach(node => {
        node.targetX = positions[node.id].x;
        node.targetY = positions[node.id].y;
        // Smooth follow
        node.x += (node.targetX - node.x) * Math.min(dt * 4, 1);
        node.y += (node.targetY - node.y) * Math.min(dt * 4, 1);
        node.pulsePhase += dt * 1.8;
      });

      // Clear
      ctx.clearRect(0, 0, w, h);

      const mapOpacity = activeRef.current ? 1 : 0;
      ctx.globalAlpha = mapOpacity;

      if (!transparentBackground) {
        // Pitch black base
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, w, h);

        // Subtle amber-tinted vignette — bright at center, dark at edges
        const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.72);
        if (isDark) {
          vignette.addColorStop(0,   'rgba(30, 12, 0, 0.55)');
          vignette.addColorStop(0.5, 'rgba(10, 5, 0, 0.30)');
          vignette.addColorStop(1,   'rgba(0, 0, 0, 0.88)');
        } else {
          vignette.addColorStop(0, 'rgba(245, 247, 255, 0.92)');
          vignette.addColorStop(1, 'rgba(220, 225, 240, 0.97)');
        }
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);

        // Fine dot-grid for depth
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.055)';
        ctx.lineWidth = 0.5;
        const gridStep = 36;
        for (let gx = 0; gx < w; gx += gridStep) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
        }
        for (let gy = 0; gy < h; gy += gridStep) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        // Scanline overlay (very subtle horizontal bands)
        for (let sy = 0; sy < h; sy += 3) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.fillRect(0, sy, w, 1);
        }
      }

      // Build node lookup
      const nodeMap = new Map(nodesRef.current.map(n => [n.id, n]));

      // ── Layer zone backgrounds (map mode only) ────────────────────────────
      if (modeRef.current === 'map' && scrollRef.current < 0.35) {
        const fade = Math.max(0, 1 - scrollRef.current * 3.5);
        const colCount = 4;
        const zoneData = [
          { label: 'INPUT',    sub: 'Skills',        r: 217, g: 119, b: 6   },
          { label: 'LAYER 1',  sub: 'Capabilities',  r: 249, g: 115, b: 22  },
          { label: 'LAYER 2',  sub: 'Projects',      r: 234, g: 88,  b: 12  },
          { label: 'OUTPUT',   sub: 'Impact',        r: 254, g: 215, b: 170 },
        ];
        [0, 1, 2, 3].forEach(li => {
          const xCenter = w * (li + 1) / (colCount + 1);
          const zoneW = w / (colCount + 1);
          const x0 = xCenter - zoneW / 2;
          const zd = zoneData[li];

          // Faint column background
          ctx.fillStyle = `rgba(${zd.r},${zd.g},${zd.b},${0.045 * fade})`;
          ctx.fillRect(x0, 0, zoneW, h);

          // Vertical separator line
          if (li > 0) {
            ctx.strokeStyle = `rgba(${zd.r},${zd.g},${zd.b},${0.18 * fade})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.beginPath(); ctx.moveTo(x0, 16); ctx.lineTo(x0, h - 16); ctx.stroke();
            ctx.setLineDash([]);
          }

          // Header pill background
          const pillW = 110;
          const pillH = 32;
          const pillX = xCenter - pillW / 2;
          const pillY = 10;
          ctx.fillStyle = `rgba(${zd.r},${zd.g},${zd.b},${0.18 * fade})`;
          ctx.strokeStyle = `rgba(${zd.r},${zd.g},${zd.b},${0.45 * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 8);
          ctx.fill();
          ctx.stroke();

          // Header text
          ctx.textAlign = 'center';
          ctx.fillStyle = `rgba(${zd.r},${zd.g},${zd.b},${0.95 * fade})`;
          ctx.font = `bold 9px Inter, sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.fillText(zd.label, xCenter, pillY + 9);
          ctx.fillStyle = `rgba(255,247,237,${0.75 * fade})`;
          ctx.font = `600 10px Inter, sans-serif`;
          ctx.fillText(zd.sub, xCenter, pillY + 22);
        });

        // Flow arrows between zone headers
        [0, 1, 2].forEach(li => {
          const x1 = w * (li + 1) / (colCount + 1) + 57;
          const x2 = w * (li + 2) / (colCount + 1) - 57;
          const arrowY = 26;
          ctx.strokeStyle = `rgba(245,158,11,${0.4 * fade})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x1, arrowY); ctx.lineTo(x2, arrowY); ctx.stroke();
          // Arrowhead
          ctx.fillStyle = `rgba(245,158,11,${0.5 * fade})`;
          ctx.beginPath();
          ctx.moveTo(x2, arrowY);
          ctx.lineTo(x2 - 7, arrowY - 4);
          ctx.lineTo(x2 - 7, arrowY + 4);
          ctx.closePath(); ctx.fill();
        });
      }

      // ── Draw edges ────────────────────────────────────────────────────────
      EDGE_DEFS.forEach(([srcId, dstId]) => {
        const src = nodeMap.get(srcId);
        const dst = nodeMap.get(dstId);
        if (!src || !dst) return;
        const srcVisible = isNodeEmphasized(src);
        const dstVisible = isNodeEmphasized(dst);

        const isActive = src.hovered || dst.hovered;
        const isClicked = lastClickRef.current &&
          (src.id === lastClickRef.current.id || dst.id === lastClickRef.current.id) &&
          (t - lastClickRef.current.time < 1.2);
        const cat = CATEGORY_COLORS[src.category];
        const alpha = (isClicked ? 1.0 : isActive ? 0.92 : 0.32) * (srcVisible || dstVisible ? 1 : 0.12);

        // Gradient line
        const grad = ctx.createLinearGradient(src.x, src.y, dst.x, dst.y);
        grad.addColorStop(0, `rgba(${cat.r},${cat.g},${cat.b},${alpha})`);
        grad.addColorStop(1, `rgba(${CATEGORY_COLORS[dst.category].r},${CATEGORY_COLORS[dst.category].g},${CATEGORY_COLORS[dst.category].b},${alpha})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = isClicked ? 3 : isActive ? 2.2 : 1.1;
        ctx.shadowBlur = isActive ? 8 : 0;
        ctx.shadowColor = `rgba(${cat.r},${cat.g},${cat.b},0.5)`;
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(dst.x, dst.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Directional arrowhead at destination node edge
        if (alpha > 0.08) {
          const angle = Math.atan2(dst.y - src.y, dst.x - src.x);
          const dstR = dst.baseRadius + 3;
          const ax = dst.x - dstR * Math.cos(angle);
          const ay = dst.y - dstR * Math.sin(angle);
          const headLen = isActive ? 9 : 6;
          const dstCat = CATEGORY_COLORS[dst.category];
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - headLen * Math.cos(angle - Math.PI / 6), ay - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ax - headLen * Math.cos(angle + Math.PI / 6), ay - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fillStyle = `rgba(${dstCat.r},${dstCat.g},${dstCat.b},${Math.min(alpha * 1.4, 0.9)})`;
          ctx.fill();
        }

        // Flowing signal dot
        const speed = 0.4 + (src.layer * 0.1);
        const phase = (t * speed + (src.pulsePhase * 0.3)) % 1;
        const dotX = src.x + (dst.x - src.x) * phase;
        const dotY = src.y + (dst.y - src.y) * phase;
        const dotAlpha = (isActive ? 1.0 : 0.72) * (srcVisible || dstVisible ? 1 : 0.18);
        // Glow behind dot
        ctx.beginPath();
        ctx.arc(dotX, dotY, isActive ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cat.r},${cat.g},${cat.b},${dotAlpha * 0.25})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, isActive ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cat.r},${cat.g},${cat.b},${dotAlpha})`;
        ctx.fill();
      });

      // ── Draw nodes ────────────────────────────────────────────────────────
      nodesRef.current.forEach(node => {
        const cat = CATEGORY_COLORS[node.category];
        const categoryVisible = isNodeEmphasized(node);
        const pulse = Math.sin(node.pulsePhase) * 0.12 + 1;
        const r = node.baseRadius * (node.hovered ? 1.25 : pulse) * (categoryVisible ? 1 : 0.93);

        // Outer glow — large diffuse halo behind node
        const glowLayers = node.hovered ? 5 : 3;
        for (let g = glowLayers; g >= 1; g--) {
          const glowR = r * (1 + g * 0.65);
          const glowAlpha = (node.hovered ? 0.22 / g : 0.12 / g) * (categoryVisible ? 1 : 0.15);
          const glowGrad = ctx.createRadialGradient(node.x, node.y, r * 0.5, node.x, node.y, glowR);
          glowGrad.addColorStop(0, `rgba(${cat.r},${cat.g},${cat.b},${glowAlpha})`);
          glowGrad.addColorStop(1, `rgba(${cat.r},${cat.g},${cat.b},0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Expanding pulse ring
        const ringZ = (node.pulsePhase % (Math.PI * 2)) / (Math.PI * 2);
        const ringR = r * (1 + ringZ * 2.2);
        const ringAlpha = (1 - ringZ) * 0.5 * (categoryVisible ? 1 : 0.18);
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cat.r},${cat.g},${cat.b},${ringAlpha})`;
        ctx.lineWidth = node.hovered ? 2 : 1.2;
        ctx.stroke();

        // Node fill — bright radial gradient, strong at center
        const nodeFill = ctx.createRadialGradient(
          node.x - r * 0.28, node.y - r * 0.28, r * 0.05,
          node.x, node.y, r
        );
        const brightR = Math.min(255, cat.r + 40);
        const brightG = Math.min(255, cat.g + 30);
        const brightB = Math.min(255, cat.b + 10);
        nodeFill.addColorStop(0,   `rgba(${brightR},${brightG},${brightB},1)`);
        nodeFill.addColorStop(0.55, `rgba(${cat.r},${cat.g},${cat.b},0.92)`);
        nodeFill.addColorStop(1,   `rgba(${Math.floor(cat.r * 0.3)},${Math.floor(cat.g * 0.3)},${Math.floor(cat.b * 0.3)},0.85)`);

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeFill;
        ctx.fill();

        // Specular highlight — top-left bright spot
        const specR = r * 0.45;
        const specGrad = ctx.createRadialGradient(
          node.x - r * 0.3, node.y - r * 0.3, 0,
          node.x - r * 0.3, node.y - r * 0.3, specR
        );
        specGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
        specGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = specGrad;
        ctx.fill();

        // Node border with canvas glow
        ctx.shadowBlur = node.hovered ? 18 : 6;
        ctx.shadowColor = `rgba(${cat.r},${cat.g},${cat.b},0.9)`;
        ctx.strokeStyle = `rgba(${brightR},${brightG},${brightB},${(node.hovered ? 1 : 0.75) * (categoryVisible ? 1 : 0.3)})`;
        ctx.lineWidth = node.hovered ? 3 : 1.8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Icon text — dark for contrast against bright node fill
        const iconSize = Math.max(9, node.baseRadius * 0.55);
        ctx.font = `800 ${iconSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(4, 6, 14, 0.92)';
        ctx.fillText(node.icon, node.x, node.y - 1);

        // Label below node — bright on black
        const labelR = r + 9;
        ctx.font = `${node.hovered ? 'bold 13px' : 'bold 10px'} Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        if (node.hovered) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${cat.r},${cat.g},${cat.b},0.9)`;
        }
        ctx.fillStyle = node.hovered
          ? `rgba(${brightR},${brightG},${brightB},${categoryVisible ? 1 : 0.4})`
          : `rgba(220,228,240,${categoryVisible ? 0.92 : 0.35})`;
        ctx.fillText(node.label, node.x, node.y + labelR);
        ctx.shadowBlur = 0;

        // Category badge (for project nodes)
        if (node.layer === 2) {
          const badgeText = node.category.toUpperCase();
          ctx.font = '7px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = `rgba(${cat.r},${cat.g},${cat.b},${categoryVisible ? 0.6 : 0.25})`;
          ctx.fillText(badgeText, node.x, node.y + labelR + 14);
        }
      });

      // Click ripple effects
      rippleRef.current = rippleRef.current.filter((ripple) => {
        const age = t - ripple.start;
        if (age > 1.1) return false;
        const rippleR = 12 + age * 60;
        const alpha = (1 - age / 1.1) * 0.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.color.replace('1)', `${alpha})`);
        ctx.lineWidth = 2;
        ctx.stroke();
        return true;
      });

      // Layer zone headers are drawn before edges above; nothing extra needed here.

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [computeLayout, computeOrbitPositions, isNodeEmphasized]);

  // ── Mouse interactions ──────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found: LiveNode | null = null;
    const hitMultiplier = 2.8; // Larger hit area for easier interaction
    nodesRef.current.forEach(node => {
      node.hovered = false;
      if (!isNodeEmphasized(node)) return;
      const dx = node.x - mx, dy = node.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < node.baseRadius * hitMultiplier) {
        node.hovered = true;
        found = node;
      }
    });

    if (found) {
      setIsHoveringNode(true);
      const fn = found as LiveNode;
      const position = computeTooltipPosition(fn.x, fn.y);
      if (!pinnedNodeId) {
        setTooltip({ node: fn, x: position.x, y: position.y });
      }
      if (lastHoverRef.current !== fn.id) {
        lastHoverRef.current = fn.id;
        window.dispatchEvent(new CustomEvent('neural:node-hover', { detail: { id: fn.id, label: fn.label } }));
      }
    } else {
      setIsHoveringNode(false);
      if (!pinnedNodeId) {
        setTooltip(null);
      }
      lastHoverRef.current = null;
    }
  }, [computeTooltipPosition, isNodeEmphasized, pinnedNodeId]);

  const handleMouseLeave = useCallback(() => {
    setIsHoveringNode(false);
    nodesRef.current.forEach(n => { n.hovered = false; });
    if (!pinnedNodeId) {
      setTooltip(null);
    }
  }, [pinnedNodeId]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const hovered = nodesRef.current.find(n => n.hovered);
    if (hovered) {
      lastClickRef.current = { id: hovered.id, time: timeRef.current / 1000 };
      rippleRef.current.push({
        x: hovered.x,
        y: hovered.y,
        start: timeRef.current / 1000,
        color: `rgba(${CATEGORY_COLORS[hovered.category].r},${CATEGORY_COLORS[hovered.category].g},${CATEGORY_COLORS[hovered.category].b},1)`
      });
      window.dispatchEvent(new CustomEvent('neural:node-click', { detail: { id: hovered.id, label: hovered.label } }));

      if (pinnedNodeId === hovered.id) {
        setPinnedNodeId(null);
        setTooltip(null);
      } else {
        setPinnedNodeId(hovered.id);
        const position = computeTooltipPosition(hovered.x, hovered.y);
        setTooltip({ node: hovered, x: position.x, y: position.y });
      }
    }
  }, [computeTooltipPosition, pinnedNodeId]);

  const handleDoubleClick = useCallback(() => {
    const hovered = nodesRef.current.find(n => n.hovered);
    if (hovered) {
      const link = NODE_LINKS[hovered.id];
      if (link) {
        router.push(link);
      }
    }
  }, [router]);

  const emphasizedNodeCount = NODE_DEFS.filter((node) => isNodeEmphasized(node)).length;
  const emphasizedEdgeCount = EDGE_DEFS.filter(([src, dst]) => {
    const srcNode = NODE_LOOKUP[src];
    const dstNode = NODE_LOOKUP[dst];
    return srcNode && dstNode && isNodeEmphasized(srcNode) && isNodeEmphasized(dstNode);
  }).length;
  const searchMatchCount = searchQuery.trim()
    ? NODE_DEFS.filter((node) => nodeMatchesQuery(node, searchQuery)).length
    : NODE_DEFS.length;

  /* ── When showControls=false (Hero orbit background), use simple full-bleed layout ── */
  if (!showControls) {
    return (
      <div
        className="relative w-full h-full"
        style={{ opacity: isActive ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: isActive ? 'auto' : 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: 'default' }}
          aria-label="Neural network background visualization"
        />
      </div>
    );
  }

  /* ── Full interactive map layout (skills page) ── */
  return (
    <div
      className="flex flex-col w-full"
      style={{ opacity: isActive ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: isActive ? 'auto' : 'none' }}
    >
      {/* ── Canvas area ── */}
      <div className="relative w-full h-[540px] sm:h-[640px] lg:h-[740px] rounded-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: interactive ? (isHoveringNode ? 'pointer' : 'crosshair') : 'default' }}
          onMouseMove={interactive ? handleMouseMove : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
          onClick={interactive ? (e) => handleClick(e as unknown as React.MouseEvent) : undefined}
          onDoubleClick={interactive ? handleDoubleClick : undefined}
          aria-label="Interactive neural network visualization — hover nodes for details, click to pin, double-click to navigate"
        />

        {/* Tooltip — stays as canvas overlay */}
        {interactive && tooltip && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div
              className="bg-slate-900/95 backdrop-blur-sm border rounded-xl p-3 shadow-2xl min-w-[180px] max-w-[220px]"
              style={{ borderColor: CATEGORY_COLORS[tooltip.node.category].base + '60' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(15,23,42,0.6)', color: CATEGORY_COLORS[tooltip.node.category].glow }}
                >
                  {tooltip.node.icon}
                </span>
                <span className="font-bold text-sm" style={{ color: CATEGORY_COLORS[tooltip.node.category].glow }}>
                  {tooltip.node.tooltip.title}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-2">{tooltip.node.tooltip.desc}</p>
              {tooltip.node.tooltip.tags && (
                <div className="flex flex-wrap gap-1">
                  {tooltip.node.tooltip.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-full border"
                      style={{
                        color: CATEGORY_COLORS[tooltip.node.category].glow,
                        borderColor: CATEGORY_COLORS[tooltip.node.category].base + '50',
                        backgroundColor: CATEGORY_COLORS[tooltip.node.category].base + '15',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div
                className="mt-2 text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: CATEGORY_COLORS[tooltip.node.category].base + '99' }}
              >
                {tooltip.node.category}
              </div>
              {NODE_LINKS[tooltip.node.id] && (
                <p className="mt-1.5 text-[9px] text-slate-400">Double-click to open page</p>
              )}
            </div>
          </div>
        )}

        {/* Pinned node badge */}
        {pinnedNodeId && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 backdrop-blur-sm px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-200 font-medium">
              Pinned: {NODE_LOOKUP[pinnedNodeId]?.label ?? pinnedNodeId}
            </span>
            <button
              type="button"
              onClick={() => { setPinnedNodeId(null); setTooltip(null); }}
              className="ml-1 text-[10px] text-slate-400 hover:text-slate-200"
              aria-label="Unpin node"
            >✕</button>
          </div>
        )}
      </div>

      {/* ── Controls row below canvas ── */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Map stats */}
        <div className="rounded-xl neural-card-soft border border-slate-600/60 px-3 py-2.5">
          <p className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase mb-2">Map Stats</p>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Visible nodes</span>
              <span className="font-mono">{emphasizedNodeCount}/{NODE_DEFS.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Visible links</span>
              <span className="font-mono">{emphasizedEdgeCount}/{EDGE_DEFS.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Search matches</span>
              <span className="font-mono">{searchMatchCount}</span>
            </div>
          </div>
          <p className="mt-2.5 text-[9px] text-slate-500 leading-relaxed">
            Click to pin · double-click to navigate
          </p>
        </div>

        {/* Search & linked focus */}
        <div className="rounded-xl neural-card-soft border border-slate-600/60 p-2.5">
          <p className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase mb-2">Search & Focus</p>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="neural-input w-full text-xs px-2.5 py-1.5"
            placeholder="Skill, project, tag…"
            aria-label="Search neural map nodes"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFocusLinkedOnly((value) => !value)}
              className={`neural-pill-intro text-[10px] ${focusLinkedOnly ? 'is-active' : ''}`}
              aria-pressed={focusLinkedOnly}
            >
              {focusLinkedOnly ? 'Linked Focus: ON' : 'Linked Focus: OFF'}
            </button>
            {(searchQuery.trim() || focusLinkedOnly) && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFocusLinkedOnly(false); }}
                className="text-[10px] text-amber-300 hover:text-amber-200 underline underline-offset-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter domains */}
        <div className="rounded-xl neural-card-soft border border-slate-600/60 p-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase">Filter Domains</p>
            {activeCategories.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveCategories([])}
                className="text-[10px] text-slate-400 hover:text-amber-300 underline underline-offset-2"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(CATEGORY_COLORS) as [keyof typeof CATEGORY_COLORS, (typeof CATEGORY_COLORS)[keyof typeof CATEGORY_COLORS]][]).map(([key, val]) => {
              const selected = activeCategories.includes(key);
              const idle = activeCategories.length === 0;
              const emphasized = selected || idle;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  className={`inline-flex items-center gap-1 neural-pill-intro px-2 py-1 text-[10px] ${selected ? 'is-active' : ''}`}
                  style={{
                    background: emphasized ? `${val.base}20` : 'rgba(15,23,42,0.45)',
                    color: emphasized ? val.glow : 'rgb(148,163,184)',
                  }}
                  aria-pressed={selected}
                  aria-label={`Filter ${key} nodes`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: val.base, boxShadow: `0 0 5px ${val.base}` }}
                  />
                  <span className="capitalize">{key}</span>
                  <span className="opacity-70">{CATEGORY_NODE_COUNTS[key]}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
