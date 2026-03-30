'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Category colors ─────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { base: string; glow: string; r: number; g: number; b: number }> = {
  genai:    { base: '#8B5CF6', glow: '#A78BFA', r: 139, g: 92,  b: 246 },
  devops:   { base: '#3B82F6', glow: '#60A5FA', r: 59,  g: 130, b: 246 },
  frontend: { base: '#06B6D4', glow: '#22D3EE', r: 6,   g: 182, b: 212 },
  backend:  { base: '#10B981', glow: '#34D399', r: 16,  g: 185, b: 129 },
  database: { base: '#F59E0B', glow: '#FCD34D', r: 245, g: 158, b: 11  },
  cloud:    { base: '#6366F1', glow: '#818CF8', r: 99,  g: 102, b: 241 },
  project:  { base: '#EC4899', glow: '#F472B6', r: 236, g: 72,  b: 153 },
  outcome:  { base: '#14B8A6', glow: '#2DD4BF', r: 20,  g: 184, b: 166 },
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
  // Layer 0 — Input Skills
  { id: 'python',     label: 'Python',      category: 'backend',  icon: 'PY', layer: 0,
    tooltip: { title: 'Python', desc: 'Primary language for AI/ML, automation & scripting', tags: ['ML', 'Automation', 'Data'] } },
  { id: 'typescript', label: 'TypeScript',  category: 'frontend', icon: 'TS', layer: 0,
    tooltip: { title: 'TypeScript', desc: 'Type-safe full-stack web development', tags: ['Next.js', 'React'] } },
  { id: 'docker',     label: 'Docker',      category: 'devops',   icon: 'DK', layer: 0,
    tooltip: { title: 'Docker', desc: '56+ container orchestration on personal ML cloud', tags: ['Containers', 'CI/CD'] } },
  { id: 'tensorflow', label: 'TensorFlow',  category: 'genai',    icon: 'TF', layer: 0,
    tooltip: { title: 'TensorFlow', desc: 'Deep learning for computer vision & NLP models', tags: ['CNN', 'Deep Learning'] } },
  { id: 'langchain',  label: 'LangChain',   category: 'genai',    icon: 'LC', layer: 0,
    tooltip: { title: 'LangChain', desc: 'LLM orchestration & FAISS-backed RAG pipelines', tags: ['RAG', 'LLM', 'Agents'] } },
  { id: 'postgres',   label: 'PostgreSQL',  category: 'database', icon: 'PG', layer: 0,
    tooltip: { title: 'PostgreSQL', desc: 'Production SQL with 177GB multi-DB architecture', tags: ['SQL', 'FAISS', 'Redis'] } },
  { id: 'nextjs',     label: 'Next.js',     category: 'frontend', icon: 'NX', layer: 0,
    tooltip: { title: 'Next.js', desc: 'Full-stack React framework for production apps', tags: ['SSR', 'API Routes'] } },
  { id: 'aws',        label: 'AWS / GCP',   category: 'cloud',    icon: 'CL', layer: 0,
    tooltip: { title: 'Cloud Platforms', desc: 'Multi-cloud deployment and ML infrastructure', tags: ['EC2', 'GCS', 'Lambda'] } },

  // Layer 1 — Hidden: Tech capabilities
  { id: 'nlp',     label: 'NLP',        category: 'genai',    icon: 'NLP', layer: 1,
    tooltip: { title: 'NLP', desc: 'Natural language processing & text classification', tags: ['Transformers', 'FinBERT'] } },
  { id: 'mlops',   label: 'MLOps',      category: 'genai',    icon: 'OPS', layer: 1,
    tooltip: { title: 'MLOps', desc: 'End-to-end ML pipelines, monitoring & deployment', tags: ['Netdata', 'GitHub Actions'] } },
  { id: 'k8s',     label: 'Kubernetes', category: 'devops',   icon: 'K8', layer: 1,
    tooltip: { title: 'Kubernetes', desc: 'Container orchestration & service scaling', tags: ['Helm', 'Portainer'] } },
  { id: 'nginx',   label: 'Nginx',      category: 'devops',   icon: 'NG', layer: 1,
    tooltip: { title: 'Nginx', desc: 'Reverse proxy, SSL termination & load balancing', tags: ['SSL/TLS', 'Proxy'] } },
  { id: 'react',   label: 'React',      category: 'frontend', icon: 'RX', layer: 1,
    tooltip: { title: 'React', desc: 'Component-driven UI with Framer Motion animations', tags: ['Tailwind', 'Framer Motion'] } },
  { id: 'redis',   label: 'Redis',      category: 'database', icon: 'RD', layer: 1,
    tooltip: { title: 'Redis', desc: 'In-memory cache, session store & message broker', tags: ['Cache', 'Pub/Sub'] } },

  // Layer 2 — Projects
  { id: 'batcave',    label: 'Batcave Cloud', category: 'project', icon: 'BC', layer: 2,
    tooltip: { title: 'AI Platform "Batcave"', desc: 'Personal ML cloud · 56 containers · 99.9% uptime · LLaMA, Mistral, RAG pipelines', tags: ['Docker', 'LLM', 'RAG', 'Authentik', 'Tailscale'] } },
  { id: 'forestfire', label: 'Forest Fire CNN', category: 'project', icon: 'FF', layer: 2,
    tooltip: { title: 'Forest Fire Detection', desc: 'CNN on Sentinel-2 satellite imagery · 91% accuracy · 88% F1-score', tags: ['CNN', 'NDVI', 'NBR', 'TensorFlow'] } },
  { id: 'ragpodcast', label: 'RAG Podcast',     category: 'project', icon: 'RP', layer: 2,
    tooltip: { title: 'RAG Podcast Generator', desc: 'Converts book PDFs to AI-narrated podcasts with character voices', tags: ['RAG', 'TTS', 'OCR', 'LangChain'] } },
  { id: 'portfolio',  label: 'Portfolio Site',  category: 'project', icon: 'PF', layer: 2,
    tooltip: { title: 'Portfolio Site', desc: 'This site · Next.js · AI chatbot · Sentry monitoring · Google Analytics', tags: ['Next.js', 'TypeScript', 'AI Chatbot'] } },

  // Layer 3 — Outcomes
  { id: 'aiplatform',     label: 'AI Platform',  category: 'outcome', icon: 'AI', layer: 3,
    tooltip: { title: 'Production AI Systems', desc: 'End-to-end ML platforms deployed at scale with real-world impact', tags: ['LLM', 'RAG', 'MLOps'] } },
  { id: 'devopsplatform', label: 'DevOps Infra', category: 'outcome', icon: 'DV', layer: 3,
    tooltip: { title: 'DevOps Infrastructure', desc: 'Automated, zero-downtime deployment pipelines & monitoring', tags: ['CI/CD', 'Docker', 'Kubernetes'] } },
  { id: 'datascience',    label: 'Data Science', category: 'outcome', icon: 'DS', layer: 3,
    tooltip: { title: 'Data Science Solutions', desc: 'ML models, visualizations & analytics for real datasets', tags: ['ML', 'CV', 'NLP'] } },
  { id: 'fullstack',      label: 'Full Stack',   category: 'outcome', icon: 'FS', layer: 3,
    tooltip: { title: 'Full-Stack Apps', desc: 'End-to-end web applications from API to UI', tags: ['React', 'Next.js', 'REST'] } },
];

// ─── Edge definitions ─────────────────────────────────────────────────────────
const EDGE_DEFS: [string, string][] = [
  // Skills → Capabilities
  ['python', 'nlp'], ['python', 'mlops'],
  ['tensorflow', 'nlp'], ['tensorflow', 'mlops'],
  ['langchain', 'nlp'], ['langchain', 'mlops'],
  ['docker', 'k8s'], ['docker', 'nginx'],
  ['typescript', 'react'], ['nextjs', 'react'],
  ['postgres', 'redis'],
  ['aws', 'k8s'], ['aws', 'mlops'],
  // Capabilities → Projects
  ['nlp', 'batcave'], ['nlp', 'ragpodcast'], ['nlp', 'forestfire'],
  ['mlops', 'batcave'], ['mlops', 'forestfire'],
  ['k8s', 'batcave'],
  ['nginx', 'batcave'], ['nginx', 'portfolio'],
  ['react', 'portfolio'],
  ['redis', 'batcave'],
  // Projects → Outcomes
  ['batcave', 'aiplatform'], ['batcave', 'devopsplatform'],
  ['forestfire', 'aiplatform'], ['forestfire', 'datascience'],
  ['ragpodcast', 'aiplatform'], ['ragpodcast', 'datascience'],
  ['portfolio', 'fullstack'], ['portfolio', 'datascience'],
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
  batcave: '/projects', forestfire: '/projects', ragpodcast: '/projects', portfolio: '/projects',
  python: '/skills', typescript: '/skills', docker: '/skills', tensorflow: '/skills',
  langchain: '/skills', postgres: '/skills', nextjs: '/skills', aws: '/skills',
  nlp: '/skills', mlops: '/skills', k8s: '/skills', nginx: '/skills', react: '/skills', redis: '/skills',
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
  const [isExploreOpen, setIsExploreOpen] = useState(false);
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
        // Background gradient
        const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
        if (isDark) {
          bg.addColorStop(0, 'rgba(15, 10, 35, 0.95)');
          bg.addColorStop(1, 'rgba(5, 5, 20, 0.98)');
        } else {
          bg.addColorStop(0, 'rgba(245, 247, 255, 0.95)');
          bg.addColorStop(1, 'rgba(232, 236, 247, 0.98)');
        }
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Subtle grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.04)';
        ctx.lineWidth = 0.5;
        const gridStep = 40;
        for (let gx = 0; gx < w; gx += gridStep) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
        }
        for (let gy = 0; gy < h; gy += gridStep) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }
      }

      // Build node lookup
      const nodeMap = new Map(nodesRef.current.map(n => [n.id, n]));

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
        const alpha = (isClicked ? 0.95 : isActive ? 0.85 : 0.18) * (srcVisible || dstVisible ? 1 : 0.14);

        // Gradient line
        const grad = ctx.createLinearGradient(src.x, src.y, dst.x, dst.y);
        grad.addColorStop(0, `rgba(${cat.r},${cat.g},${cat.b},${alpha})`);
        grad.addColorStop(1, `rgba(${CATEGORY_COLORS[dst.category].r},${CATEGORY_COLORS[dst.category].g},${CATEGORY_COLORS[dst.category].b},${alpha})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = isClicked ? 2.6 : isActive ? 2 : 0.8;
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(dst.x, dst.y);
        ctx.stroke();

        // Flowing signal dot
        const speed = 0.4 + (src.layer * 0.1);
        const phase = (t * speed + (src.pulsePhase * 0.3)) % 1;
        const dotX = src.x + (dst.x - src.x) * phase;
        const dotY = src.y + (dst.y - src.y) * phase;
        const dotAlpha = (isActive ? 0.95 : 0.55) * (srcVisible || dstVisible ? 1 : 0.2);
        ctx.beginPath();
        ctx.arc(dotX, dotY, isActive ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cat.r},${cat.g},${cat.b},${dotAlpha})`;
        ctx.fill();
      });

      // ── Draw nodes ────────────────────────────────────────────────────────
      nodesRef.current.forEach(node => {
        const cat = CATEGORY_COLORS[node.category];
        const categoryVisible = isNodeEmphasized(node);
        const pulse = Math.sin(node.pulsePhase) * 0.12 + 1;
        const r = node.baseRadius * (node.hovered ? 1.25 : pulse) * (categoryVisible ? 1 : 0.93);

        // Outer glow rings
        const glowLayers = node.hovered ? 4 : 2;
        for (let g = glowLayers; g >= 1; g--) {
          const glowR = r * (1 + g * 0.55);
          const glowAlpha = (node.hovered ? 0.18 / g : 0.08 / g) * (categoryVisible ? 1 : 0.2);
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cat.r},${cat.g},${cat.b},${glowAlpha})`;
          ctx.fill();
        }

        // Pulse ring
        const ringZ = (node.pulsePhase % (Math.PI * 2)) / (Math.PI * 2);
        const ringR = r * (1 + ringZ * 1.8);
        const ringAlpha = (1 - ringZ) * 0.35 * (categoryVisible ? 1 : 0.22);
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cat.r},${cat.g},${cat.b},${ringAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node fill — radial gradient
        const nodeFill = ctx.createRadialGradient(
          node.x - r * 0.3, node.y - r * 0.3, 0,
          node.x, node.y, r
        );
        nodeFill.addColorStop(0, `rgba(${cat.r},${cat.g},${cat.b},0.95)`);
        nodeFill.addColorStop(0.6, `rgba(${cat.r},${cat.g},${cat.b},0.7)`);
        nodeFill.addColorStop(1, `rgba(${Math.floor(cat.r * 0.4)},${Math.floor(cat.g * 0.4)},${Math.floor(cat.b * 0.4)},0.8)`);

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeFill;
        ctx.fill();

        // Node border
        ctx.strokeStyle = `rgba(${cat.r},${cat.g},${cat.b},${(node.hovered ? 1 : 0.6) * (categoryVisible ? 1 : 0.35)})`;
        ctx.lineWidth = node.hovered ? 2.5 : 1.5;
        ctx.stroke();

        // Icon text (dark for contrast)
        const iconSize = Math.max(9, node.baseRadius * 0.55);
        ctx.font = `700 ${iconSize}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(8, 12, 24, 0.9)';
        ctx.fillText(node.icon, node.x, node.y - 1);

        // Label below node
        const labelR = r + 8;
        ctx.font = `bold ${node.hovered ? 12 : 10}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = node.hovered
          ? `rgba(${cat.r},${cat.g},${cat.b},${categoryVisible ? 1 : 0.45})`
          : `rgba(203,213,225,${categoryVisible ? 0.85 : 0.4})`;
        ctx.fillText(node.label, node.x, node.y + labelR);

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

      // ── Layer labels (map mode only) ─────────────────────────────────────
      if (modeRef.current === 'map' && scrollRef.current < 0.3) {
        const layerLabels = ['INPUT\nSkills', 'HIDDEN\nCapabilities', 'HIDDEN\nProjects', 'OUTPUT\nImpact'];
        [0, 1, 2, 3].forEach(li => {
          const layerNodes = nodesRef.current.filter(n => n.layer === li);
          if (!layerNodes.length) return;
          const avgX = layerNodes.reduce((s, n) => s + n.x, 0) / layerNodes.length;
          const fade = Math.max(0, 1 - scrollRef.current * 4);
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = `rgba(100,116,139,${0.6 * fade})`;
          const lines = layerLabels[li].split('\n');
          lines.forEach((line, i) => {
            ctx.fillText(line, avgX, 18 + i * 12);
          });
        });
      }

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

  return (
    <div
      className="relative w-full h-full"
      style={{ opacity: isActive ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: interactive ? (isHoveringNode ? 'pointer' : 'crosshair') : 'default' }}
        onMouseMove={interactive ? handleMouseMove : undefined}
        onMouseLeave={interactive ? handleMouseLeave : undefined}
        onClick={interactive ? (e) => handleClick(e as unknown as React.MouseEvent) : undefined}
        onDoubleClick={interactive ? handleDoubleClick : undefined}
        aria-label="Interactive neural network visualization - hover nodes for details, click to pin, double-click to navigate"
      />

      {/* Tooltip */}
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
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', color: CATEGORY_COLORS[tooltip.node.category].glow }}
              >
                {tooltip.node.icon}
              </span>
              <span
                className="font-bold text-sm"
                style={{ color: CATEGORY_COLORS[tooltip.node.category].glow }}
              >
                {tooltip.node.tooltip.title}
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              {tooltip.node.tooltip.desc}
            </p>
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

      {/* Interaction controls */}
      {showControls && (
        <>
          <button
            type="button"
            onClick={() => setIsExploreOpen((open) => !open)}
            className="absolute top-4 right-4 z-20 h-9 w-9 rounded-full neural-control-btn-ghost shadow-lg backdrop-blur-sm"
            aria-label={isExploreOpen ? 'Hide explore map controls' : 'Show explore map controls'}
            aria-expanded={isExploreOpen}
            aria-controls="neural-explore-panel"
            title={isExploreOpen ? 'Hide controls' : 'Show controls'}
          >
            🧭
          </button>
          {isExploreOpen && (
            <div
              id="neural-explore-panel"
              className="absolute top-14 right-4 z-20 w-[min(300px,calc(100%-2rem))] rounded-xl neural-card-soft border border-slate-600/60 backdrop-blur-sm p-2.5 max-h-[45%] overflow-y-auto"
            >
              <p className="text-[10px] text-slate-300 font-semibold tracking-wide uppercase mb-2">Explore Map</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="neural-input w-full text-xs px-2.5 py-1.5"
                  placeholder="Search node, skill, project, or tag"
                  aria-label="Search neural map nodes"
                />
                <div className="flex items-center gap-2 flex-wrap">
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
                      onClick={() => {
                        setSearchQuery('');
                        setFocusLinkedOnly(false);
                      }}
                      className="text-[10px] text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                    >
                      Clear view aids
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Tip: click to pin, double-click to navigate, then enable linked focus to isolate neighbors.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Live stats */}
      {showControls && (
      <div className="absolute top-4 left-4 z-20 rounded-xl neural-card-soft border border-slate-600/60 backdrop-blur-sm px-3 py-2.5">
        <p className="text-[10px] text-slate-300 font-semibold tracking-wide uppercase mb-2">Map Stats</p>
        <div className="space-y-1.5 text-[10px] text-slate-300">
          <p><span className="text-slate-500">Visible nodes:</span> {emphasizedNodeCount}/{NODE_DEFS.length}</p>
          <p><span className="text-slate-500">Visible links:</span> {emphasizedEdgeCount}/{EDGE_DEFS.length}</p>
          <p><span className="text-slate-500">Search matches:</span> {searchMatchCount}</p>
          {pinnedNodeId && (
            <p>
              <span className="text-slate-500">Pinned:</span> {NODE_LOOKUP[pinnedNodeId]?.label ?? pinnedNodeId}
            </p>
          )}
        </div>
      </div>
      )}

      {/* Legend & filters */}
      {showControls && (
      <div className="absolute bottom-4 left-4 z-20 max-w-xs rounded-xl neural-card-soft border border-slate-600/60 backdrop-blur-sm p-2.5">
        <p className="text-[10px] text-slate-300 font-semibold tracking-wide uppercase mb-2">Filter Domains</p>
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
                className={`inline-flex items-center gap-1 neural-pill-intro px-2 py-1 text-[10px] transition-all duration-200 ${selected ? 'is-active' : ''}`}
                style={{
                  background: emphasized ? `${val.base}20` : 'rgba(15,23,42,0.45)',
                  color: emphasized ? val.glow : 'rgb(148, 163, 184)',
                }}
                aria-pressed={selected}
                aria-label={`Filter ${key} nodes`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: val.base, boxShadow: `0 0 6px ${val.base}` }}
                />
                <span className="capitalize">{key}</span>
                <span className="opacity-80">{CATEGORY_NODE_COUNTS[key]}</span>
              </button>
            );
          })}
        </div>
        {activeCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveCategories([])}
            className="mt-2 text-[10px] text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
          >
            Reset filters
          </button>
        )}
      </div>
      )}
    </div>
  );
}
