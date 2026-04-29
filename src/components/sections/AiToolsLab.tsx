'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import OnboardingHint from '@/components/ui/OnboardingHint';
import {
  FaBolt, FaBalanceScale, FaGem, FaFlask, FaTimes, FaPalette,
  FaCamera, FaFilm, FaStar, FaBuilding, FaGamepad,
  FaSpinner, FaExclamationTriangle, FaSearch, FaDownload,
  FaCheckCircle, FaSave, FaImages, FaLock, FaMagic
} from 'react-icons/fa';

interface Tool {
  title: string;
  description: string;
  action: 'coming-soon' | 'open-chatbot' | 'open-image-generator';
  enabled: boolean;
}

const tools: Tool[] = [
  {
    title: 'PDF to Podcast',
    description: 'Convert PDFs into audio podcasts using LLMs and TTS models. (Coming soon)',
    action: 'coming-soon',
    enabled: false,
  },
  {
    title: 'RAG Chatbot',
    description: 'Chatbot with retrieval-augmented generation, trained on my docs.',
    action: 'open-chatbot',
    enabled: true,
  },
  {
    title: 'AI Image Generator',
    description: 'Generate images from text prompts using Stable Diffusion running on Apple M4.',
    action: 'open-image-generator',
    enabled: true,
  },
];

const morphPaths = [
  "M0,200 Q175,100 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,100 350,200 T700,200 V300 H0 Z",
];

const AI_PRESETS_KEY = 'ai-image-generator-presets-v1';
const FEATURED_PRESETS = [
  { name: 'Cinematic City', speedMode: 'balanced', quality: 'high', aspect: 'landscape', style: 'cinematic', advanced: true, negativePrompt: 'blurry, flat lighting', seed: '' },
  { name: 'Portrait Photoreal', speedMode: 'quality', quality: 'high', aspect: 'portrait', style: 'photorealistic', advanced: false, negativePrompt: '', seed: '' },
  { name: 'Retro Pixel Scene', speedMode: 'fast', quality: 'medium', aspect: 'square', style: 'pixel-art', advanced: false, negativePrompt: '', seed: '' },
] as const;

interface SavedImagePreset {
  id: string;
  name: string;
  speedMode: 'fast' | 'balanced' | 'quality';
  quality: 'low' | 'medium' | 'high';
  aspect: 'square' | 'portrait' | 'landscape';
  style: 'none' | 'anime' | 'cinematic' | 'pixel-art' | 'cyberpunk' | 'photorealistic';
  advanced: boolean;
  negativePrompt: string;
  seed: string;
  savedAt: string;
}

export default function AiToolsLab() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [urlStateReady, setUrlStateReady] = useState(false);
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const animationRef = useRef<number>();
  const morphIdx = useRef(0);
  const morphProgress = useRef(0);
  const lastMorphTime = useRef(performance.now());
  const morphDuration = 4000;
  const [toolFilter, setToolFilter] = useState<'all' | 'live' | 'soon'>('all');

  // Image generator state
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgNegative, setImgNegative] = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgOtherTabBusy, setImgOtherTabBusy] = useState(false);
  const [imgResult, setImgResult] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgModelFamily, setImgModelFamily] = useState<'sd' | 'flux'>('sd');
  const [imgSpeedMode, setImgSpeedMode] = useState<'fast' | 'balanced' | 'quality'>('balanced');
  const [imgQuality, setImgQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [imgAspect, setImgAspect] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [imgStyle, setImgStyle] = useState<'none' | 'anime' | 'cinematic' | 'pixel-art' | 'cyberpunk' | 'photorealistic'>('none');
  const [imgSeed, setImgSeed] = useState<string>('');
  const [imgAdvanced, setImgAdvanced] = useState(false);
  const [imgLightbox, setImgLightbox] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const [imgMeta, setImgMeta] = useState<{ width: number; height: number; steps: number; seed: number; model: string } | null>(null);
  const [imgSaved, setImgSaved] = useState(false);
  const [imgSaving, setImgSaving] = useState(false);
  const [imgPresetName, setImgPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedImagePreset[]>([]);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState('');
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const speedModes: { key: 'fast' | 'balanced' | 'quality'; label: React.ReactNode; desc: string }[] = [
    { key: 'fast', label: <><FaBolt className="inline text-amber-400 mr-1" />Fast</>, desc: 'SD Turbo · ~45–60s · 512px' },
    { key: 'balanced', label: <><FaBalanceScale className="inline text-amber-400 mr-1" />Balanced</>, desc: 'SD 1.5 · ~60–100s · 640px' },
    { key: 'quality', label: <><FaGem className="inline text-amber-400 mr-1" />Quality</>, desc: 'SDXL Turbo · ~2–4 min · 1024px' },
  ];

  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const startProgress = (estMs: number) => {
    stopProgress();
    setImgProgress(0);
    const started = performance.now();
    progressTimer.current = setInterval(() => {
      const elapsed = performance.now() - started;
      // Asymptote to 92% — jump to 100 on completion
      const p = Math.min(92, (elapsed / estMs) * 100);
      setImgProgress(p);
    }, 150);
  };

  useEffect(() => { setMounted(true); }, []);

  // Sync generation state across tabs so each tab knows if another is busy
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('img-gen');
    ch.onmessage = (e) => {
      if (e.data === 'started') setImgOtherTabBusy(true);
      if (e.data === 'done') setImgOtherTabBusy(false);
    };
    return () => ch.close();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(AI_PRESETS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSavedPresets(parsed);
      }
    } catch {
      // Ignore malformed local preset state and continue with an empty list.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('labFilter');
    const tool = params.get('tool');
    const speed = params.get('speed');
    const quality = params.get('quality');
    const aspect = params.get('aspect');
    const style = params.get('style');

    if (filter === 'all' || filter === 'live' || filter === 'soon') {
      setToolFilter(filter);
    }
    if (speed === 'fast' || speed === 'balanced' || speed === 'quality') {
      setImgSpeedMode(speed);
    }
    if (quality === 'low' || quality === 'medium' || quality === 'high') {
      setImgQuality(quality);
    }
    if (aspect === 'square' || aspect === 'portrait' || aspect === 'landscape') {
      setImgAspect(aspect);
    }
    if (style === 'none' || style === 'anime' || style === 'cinematic' || style === 'pixel-art' || style === 'cyberpunk' || style === 'photorealistic') {
      setImgStyle(style);
    }
    if (params.get('advanced') === '1') {
      setImgAdvanced(true);
    }
    if (tool === 'image-generator') {
      setImgModalOpen(true);
    }
    setUrlStateReady(true);
  }, []);

  // Lock body scroll when any modal is open
  useScrollLock(imgModalOpen || imgLightbox || showSecretModal);

  // ESC key: close innermost layer first
  useEscapeKey(() => {
    if (showSecretModal) { setShowSecretModal(false); return; }
    if (imgLightbox) { setImgLightbox(false); return; }
    if (imgModalOpen) { setImgModalOpen(false); }
  }, imgModalOpen || imgLightbox || showSecretModal);

  useEffect(() => {
    if (!mounted) return;

    function lerpPath(a: string, b: string, t: number) {
      const numsA = a.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const numsB = b.match(/-?\d+\.?\d*/g)?.map(Number) || [];
      const nums = numsA.map((v, i) => v + (numsB[i] - v) * t);
      return `M${nums[0]},${nums[1]} Q${nums[2]},${nums[3]} ${nums[4]},${nums[5]} T${nums[6]},${nums[7]} V${nums[8]} H${nums[9]} Z`;
    }

    function animateMorph() {
      const now = performance.now();
      const dt = now - lastMorphTime.current;
      morphProgress.current += dt / morphDuration;
      if (morphProgress.current > 1) {
        morphProgress.current = 0;
        morphIdx.current = (morphIdx.current + 1) % (morphPaths.length - 1);
      }
      if (pathRef.current) {
        const d = lerpPath(morphPaths[morphIdx.current], morphPaths[morphIdx.current + 1], morphProgress.current);
        pathRef.current.setAttribute('d', d);
      }
      lastMorphTime.current = now;
      animationRef.current = requestAnimationFrame(animateMorph);
    }

    animationRef.current = requestAnimationFrame(animateMorph);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [mounted]);

  const handleToolClick = (tool: Tool) => {
    if (!tool.enabled) return;
    if (tool.action === 'open-chatbot' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatbot:open'));
    }
    if (tool.action === 'open-image-generator') {
      setImgResult(null);
      setImgError(null);
      setImgPrompt('');
      setImgMeta(null);
      setImgSaved(false);
      setImgModalOpen(true);
    }
  };

  const handleSaveToGallery = () => {
    if (!imgResult || !imgMeta || imgSaved) return;
    setSecretInput('');
    setSecretError('');
    setShowSecretModal(true);
  };

  const handleSecretSubmit = async () => {
    if (!secretInput.trim() || !imgResult || !imgMeta) return;
    setImgSaving(true);
    setSecretError('');
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretInput,
          image: imgResult,
          prompt: imgPrompt,
          style: imgStyle,
          speedMode: imgSpeedMode,
          width: imgMeta.width,
          height: imgMeta.height,
          seed: imgMeta.seed,
          model: imgMeta.model,
        }),
      });
      if (res.ok) {
        setImgSaved(true);
        setShowSecretModal(false);
        window.dispatchEvent(new CustomEvent('gallery:refresh'));
      } else {
        const data = await res.json().catch(() => ({}));
        setSecretError(data.error || 'Failed to save');
      }
    } catch {
      setSecretError('Network error. Try again.');
    }
    setImgSaving(false);
  };

  const handleGenerate = async () => {
    if (!imgPrompt.trim()) return;
    setImgLoading(true);
    setImgResult(null);
    setImgError(null);
    setImgMeta(null);
    setImgSaved(false);

    // Notify other tabs this tab is now generating
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      new BroadcastChannel('img-gen').postMessage('started');
    }

    const estMs = imgModelFamily === 'flux' ? 600_000 : imgSpeedMode === 'fast' ? 50_000 : imgSpeedMode === 'balanced' ? 90_000 : 180_000;
    startProgress(estMs);

    try {
      const seedNum = imgSeed.trim() === '' ? undefined : Number(imgSeed);
      const postRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imgPrompt,
          negativePrompt: imgNegative,
          modelFamily: imgModelFamily,
          speedMode: imgSpeedMode,
          quality: imgQuality,
          aspect: imgAspect,
          style: imgStyle,
          ...(Number.isFinite(seedNum) ? { seed: seedNum } : {}),
        }),
      });
      const queued = await postRes.json().catch(() => ({ error: 'Non-JSON response' }));
      if (!postRes.ok) throw new Error(queued.error ?? 'Queue failed');
      const { promptId } = queued as { promptId: string };
      if (!promptId) throw new Error('No promptId returned');

      const deadline = Date.now() + 6 * 60_000;
      let notFoundCount = 0;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        let sRes: Response;
        try {
          sRes = await fetch(`/api/generate-image?id=${encodeURIComponent(promptId)}`);
        } catch {
          continue;
        }
        const s = await sRes.json().catch(() => ({ status: 'error', error: 'Non-JSON response' }));
        if (s.status === 'done') {
          setImgResult(s.image);
          setImgMeta({ width: s.width, height: s.height, steps: s.steps, seed: s.seed, model: s.model });
          setImgProgress(100);
          return;
        }
        if (s.status === 'error' && sRes.status === 404) {
          notFoundCount++;
          if (notFoundCount < 5) continue;
          throw new Error('Generation failed — job not found on GPU server. Try again.');
        }
        if (s.status === 'error') {
          throw new Error(s.error ?? 'Generation failed');
        }
      }
      throw new Error('Generation timed out (6 min). The GPU may be busy — try Fast mode.');
    } catch (err: any) {
      const msg = err.message ?? 'Something went wrong';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setImgError('Network error — could not reach the server. Check your connection.');
      } else if (msg.includes('AbortError') || msg.includes('signal')) {
        setImgError('Request timed out — the GPU may be overloaded. Try again in a moment.');
      } else {
        setImgError(msg);
      }
    } finally {
      stopProgress();
      setImgLoading(false);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        new BroadcastChannel('img-gen').postMessage('done');
      }
    }
  };

  useEffect(() => () => stopProgress(), []);

  const persistPresets = (nextPresets: SavedImagePreset[]) => {
    setSavedPresets(nextPresets);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AI_PRESETS_KEY, JSON.stringify(nextPresets));
    }
  };

  const applyPreset = (preset: SavedImagePreset) => {
    setImgSpeedMode(preset.speedMode);
    setImgQuality(preset.quality);
    setImgAspect(preset.aspect);
    setImgStyle(preset.style);
    setImgAdvanced(preset.advanced);
    setImgNegative(preset.negativePrompt);
    setImgSeed(preset.seed);
    setPresetNotice(`Applied preset: ${preset.name}`);
  };

  const applyFeaturedPreset = (preset: typeof FEATURED_PRESETS[number]) => {
    setImgSpeedMode(preset.speedMode);
    setImgQuality(preset.quality);
    setImgAspect(preset.aspect);
    setImgStyle(preset.style);
    setImgAdvanced(preset.advanced);
    setImgNegative(preset.negativePrompt);
    setImgSeed(preset.seed);
    setImgModalOpen(true);
    setPresetNotice(`Loaded preset: ${preset.name}`);
  };

  const saveCurrentPreset = () => {
    const name = imgPresetName.trim();
    if (!name) return;

    const preset: SavedImagePreset = {
      id: `${Date.now()}`,
      name,
      speedMode: imgSpeedMode,
      quality: imgQuality,
      aspect: imgAspect,
      style: imgStyle,
      advanced: imgAdvanced,
      negativePrompt: imgNegative,
      seed: imgSeed,
      savedAt: new Date().toISOString(),
    };

    const deduped = savedPresets.filter((entry) => entry.name.toLowerCase() !== name.toLowerCase());
    persistPresets([preset, ...deduped].slice(0, 6));
    setImgPresetName('');
    setPresetNotice(`Saved preset: ${preset.name}`);
  };

  const deletePreset = (presetId: string) => {
    const nextPresets = savedPresets.filter((preset) => preset.id !== presetId);
    persistPresets(nextPresets);
  };

  const copyPresetLink = async () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('tool', 'image-generator');
    url.searchParams.set('speed', imgSpeedMode);
    url.searchParams.set('quality', imgQuality);
    url.searchParams.set('aspect', imgAspect);
    url.searchParams.set('style', imgStyle);
    if (imgAdvanced) {
      url.searchParams.set('advanced', '1');
    } else {
      url.searchParams.delete('advanced');
    }
    try {
      await navigator.clipboard.writeText(url.toString());
      setPresetNotice('Preset link copied to clipboard');
    } catch {
      setPresetNotice('Unable to copy preset link');
    }
  };

  useEffect(() => {
    if (!presetNotice) return;
    const timer = window.setTimeout(() => setPresetNotice(null), 2500);
    return () => window.clearTimeout(timer);
  }, [presetNotice]);

  useEffect(() => {
    if (typeof window === 'undefined' || !urlStateReady) return;
    const params = new URLSearchParams(window.location.search);

    if (toolFilter !== 'all') {
      params.set('labFilter', toolFilter);
    } else {
      params.delete('labFilter');
    }

    if (imgModalOpen) {
      params.set('tool', 'image-generator');
      params.set('speed', imgSpeedMode);
      params.set('quality', imgQuality);
      params.set('aspect', imgAspect);
      params.set('style', imgStyle);
      if (imgAdvanced) {
        params.set('advanced', '1');
      } else {
        params.delete('advanced');
      }
    } else {
      params.delete('tool');
      params.delete('speed');
      params.delete('quality');
      params.delete('aspect');
      params.delete('style');
      params.delete('advanced');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [imgAdvanced, imgAspect, imgModalOpen, imgQuality, imgSpeedMode, imgStyle, pathname, router, toolFilter, urlStateReady]);

  if (!mounted) return null;

  const filteredTools = tools.filter((tool) => {
    if (toolFilter === 'live') return tool.enabled;
    if (toolFilter === 'soon') return !tool.enabled;
    return true;
  });

  const renderSection = (
    <section className="relative pt-0 pb-16 px-2 sm:px-6 w-full overflow-hidden">
      <svg
        ref={svgRef}
        className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[700px] h-[300px] opacity-20 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ai-gradient-dark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
          <linearGradient id="ai-gradient-light" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={morphPaths[0]}
          fill={`url(#ai-gradient-${theme === 'dark' ? 'dark' : 'light'})`}
        />
      </svg>

      <div className="w-full neural-card neural-glow-border p-4 sm:p-8">
        <OnboardingHint
          storageKey="ai_tools_lab_hint_v1"
          title="Welcome to the AI lab"
          body="The generator settings are shareable by URL, saved presets stay local to this browser, and advanced mode lets you control negatives and seeds."
        />
        <h2 className="neural-section-title mb-3 flex items-center gap-2"><FaFlask className="text-amber-400" /> AI Tools Lab</h2>
        <p className="neural-section-copy max-w-4xl mb-3">
          Experimental AI-powered tools showcasing LLMs, RAG systems, and generative image models — all running
          on self-hosted infrastructure powered by an Apple M4 Mac Mini with Metal GPU acceleration.
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="neural-kicker">Lab channel</span>
          {[
            { key: 'all', label: 'All' },
            { key: 'live', label: 'Live demos' },
            { key: 'soon', label: 'Coming soon' },
          ].map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setToolFilter(filter.key as 'all' | 'live' | 'soon')}
              className={`neural-pill-intro text-xs ${toolFilter === filter.key ? 'is-active ring-2 ring-amber-400/60' : ''}`}
              aria-pressed={toolFilter === filter.key}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="mb-8 text-sm text-slate-300">
          Showing {filteredTools.length} tools. Live: {tools.filter((t) => t.enabled).length} | In progress: {tools.filter((t) => !t.enabled).length}
        </div>
        <div className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
          <p className="text-[11px] uppercase tracking-widest text-slate-500">Preset gallery</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FEATURED_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyFeaturedPreset(preset)}
                className="neural-pill-intro text-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="transform transition-all duration-300 neural-card-soft rounded-2xl p-6 flex flex-col items-center fade-in tilt glow-hover border border-slate-600/55"
              aria-label={tool.title}
            >
              <h3 className="text-xl font-semibold text-amber-400 mb-2">{tool.title}</h3>
              <div className="mb-4 text-center">
                <span className="neural-statement-chip">{tool.description}</span>
              </div>
              <button
                type="button"
                onClick={() => handleToolClick(tool)}
                className={`neural-pill ${tool.enabled ? '' : 'opacity-60 cursor-not-allowed'}`}
                aria-label={`Try ${tool.title} Demo`}
              >
                {tool.enabled ? 'Try Demo' : 'Coming Soon'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  // ── Portalled modals (rendered at document.body to escape stacking contexts) ──
  const modals = typeof document !== 'undefined' ? (
    <AnimatePresence>
      {/* ── Image Generator Modal ── */}
      {imgModalOpen && (
        <motion.div
          key="img-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/55 backdrop-blur-md p-3 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setImgModalOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="neural-card w-full max-w-5xl rounded-2xl border border-slate-600/55 relative flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                  <FaPalette className="text-amber-400" /> AI Image Generator
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">SD · FLUX.1 Schnell · Apple M4 Metal GPU · Self-hosted (ComfyUI)</p>
              </div>
              <button
                type="button"
                onClick={() => setImgModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                aria-label="Close (Esc)"
              >
                <FaTimes />
              </button>
            </div>

            {/* Two-column body */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
              {/* LEFT — settings column */}
              <div className="lg:w-[420px] shrink-0 overflow-y-auto p-5 border-b lg:border-b-0 lg:border-r border-slate-700/50 space-y-4">
                {/* Model family toggle */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'sd', label: 'Stable Diffusion', desc: 'SD 1.5 · Turbo · SDXL' },
                      { key: 'flux', label: 'FLUX.1 Schnell', desc: '4-step · Higher quality' },
                    ] as { key: 'sd' | 'flux'; label: string; desc: string }[]).map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setImgModelFamily(m.key)}
                        disabled={imgLoading}
                        className={`rounded-lg border p-2 text-xs text-left transition cursor-pointer ${
                          imgModelFamily === m.key
                            ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                            : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="font-semibold">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Prompt</label>
                  <textarea
                    value={imgPrompt}
                    onChange={(e) => setImgPrompt(e.target.value)}
                    placeholder="A futuristic city skyline at sunset, digital art, cinematic lighting"
                    rows={3}
                    maxLength={3000}
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="text-[10px] text-slate-500 text-right mt-0.5">{imgPrompt.length}/3000</div>
                </div>

                {imgModelFamily === 'sd' && <div>
                  <label className="block text-sm text-slate-300 mb-2">Speed / Model</label>
                  <div className="grid grid-cols-3 gap-2">
                    {speedModes.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setImgSpeedMode(m.key)}
                        disabled={imgLoading}
                        className={`rounded-lg border p-2 text-xs text-left transition cursor-pointer ${
                          imgSpeedMode === m.key
                            ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                            : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="font-semibold">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Aspect ratio</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['square', 'portrait', 'landscape'] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setImgAspect(a)}
                          disabled={imgLoading}
                          className={`rounded-lg border p-2 text-xs capitalize transition cursor-pointer ${
                            imgAspect === a
                              ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                              : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                          }`}
                        >
                          {a === 'square' ? '▢ 1:1 Square' : a === 'portrait' ? '▯ 3:4 Portrait' : '▭ 4:3 Landscape'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Quality</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['low', 'medium', 'high'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setImgQuality(q)}
                          disabled={imgLoading}
                          className={`rounded-lg border p-2 text-xs capitalize transition cursor-pointer ${
                            imgQuality === q
                              ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                              : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: 'none', label: <span>—</span>, desc: 'No style' },
                      { key: 'photorealistic', label: <FaCamera className="text-amber-400" />, desc: 'Photoreal' },
                      { key: 'cinematic', label: <FaFilm className="text-amber-400" />, desc: 'Cinematic' },
                      { key: 'anime', label: <FaStar className="text-amber-400" />, desc: 'Anime' },
                      { key: 'cyberpunk', label: <FaBuilding className="text-amber-400" />, desc: 'Cyberpunk' },
                      { key: 'pixel-art', label: <FaGamepad className="text-amber-400" />, desc: 'Pixel art' },
                    ] as { key: 'none' | 'anime' | 'cinematic' | 'pixel-art' | 'cyberpunk' | 'photorealistic'; label: React.ReactNode; desc: string }[]).map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setImgStyle(s.key)}
                        disabled={imgLoading}
                        className={`rounded-lg border p-2 text-xs transition cursor-pointer ${
                          imgStyle === s.key
                            ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                            : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="text-base">{s.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setImgAdvanced((v) => !v)}
                    className="text-xs text-slate-400 hover:text-amber-300 mb-2 underline underline-offset-2 cursor-pointer transition-colors"
                  >
                    {imgAdvanced ? '▼ Hide advanced' : '► Show advanced'}
                  </button>

                  {imgAdvanced && (
                    <div className="space-y-3 p-3 rounded-lg border border-slate-700 bg-slate-900/40">
                      {imgModelFamily === 'sd' && <div>
                        <label className="block text-xs text-slate-400 mb-1">Negative prompt</label>
                        <input
                          value={imgNegative}
                          onChange={(e) => setImgNegative(e.target.value)}
                          placeholder="Extra negatives (quality defaults already applied)"
                          className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-xs p-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>}
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Seed (blank = random)</label>
                        <input
                          value={imgSeed}
                          onChange={(e) => setImgSeed(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 42"
                          className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-xs p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-200">Saved presets</p>
                      <p className="text-[11px] text-slate-500">Keep favorite generator setups and share them as links.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyPresetLink()}
                      className="neural-pill text-[11px]"
                    >
                      Copy preset link
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={imgPresetName}
                      onChange={(e) => setImgPresetName(e.target.value)}
                      placeholder="Preset name"
                      className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-xs p-2 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={saveCurrentPreset}
                      disabled={!imgPresetName.trim()}
                      className="neural-control-btn-primary text-xs px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>

                  {presetNotice && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                      {presetNotice}
                    </div>
                  )}

                  {savedPresets.length > 0 ? (
                    <div className="space-y-2">
                      {savedPresets.map((preset) => (
                        <div key={preset.id} className="rounded-lg border border-slate-700/70 bg-slate-950/40 p-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-100">{preset.name}</p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                {preset.speedMode} · {preset.quality} · {preset.aspect} · {preset.style}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deletePreset(preset.id)}
                              className="text-[10px] text-slate-500 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => applyPreset(preset)}
                              className="neural-pill text-[10px]"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">No presets saved yet. Save one to reuse your favorite generation setup.</p>
                  )}
                </div>

                {imgOtherTabBusy && !imgLoading && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-center">
                    Another tab is generating — please wait for it to finish.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={imgLoading || imgOtherTabBusy || !imgPrompt.trim()}
                  className="neural-pill w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imgLoading
                    ? <><FaSpinner className="inline animate-spin text-amber-400 mr-1.5" />Generating on M4...</>
                    : <><FaMagic className="inline text-amber-400 mr-1.5" />Generate Image</>}
                </button>

                {imgLoading && (
                  <div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-150"
                        style={{ width: `${imgProgress}%` }}
                      />
                    </div>
                    <div className="text-center text-xs text-slate-400 mt-1.5 animate-pulse">
                      {imgProgress < 92 ? `Running on Metal GPU… ${Math.round(imgProgress)}%` : 'Finalizing…'}
                    </div>
                  </div>
                )}

                {imgError && (
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
                    <div className="text-red-400 text-sm text-center mb-2 flex items-center justify-center gap-1">
                      <FaExclamationTriangle className="text-amber-400" /> {imgError}
                    </div>
                    <div className="text-[11px] text-slate-400 text-center mb-3">
                      {imgError.includes('timed out') ? 'The GPU took too long. Try "Fast" mode or a simpler prompt.'
                        : imgError.includes('unreachable') || imgError.includes('fetch') ? 'ComfyUI server might be sleeping. Give it a moment and try again.'
                        : imgError.includes('Rate limit') ? 'Too many requests. Wait a minute before trying again.'
                        : imgError.includes('content policy') ? 'This prompt is not allowed. Please try something different.'
                        : 'Something went wrong. Try again or use a different prompt.'}
                    </div>
                    <button type="button" onClick={() => setImgError(null)} className="neural-pill text-xs mx-auto flex items-center gap-1">
                      <FaTimes className="inline text-amber-400 mr-1" /> Dismiss
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT — result column */}
              <div className="flex-1 flex flex-col items-center justify-center p-5 min-h-[280px]">
                {!imgResult && !imgLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 text-center opacity-40 select-none">
                    <FaPalette className="text-5xl text-amber-400/40" />
                    <p className="text-sm text-slate-400">Your generated image will appear here</p>
                    <p className="text-xs text-slate-500">Configure settings on the left and hit Generate</p>
                  </div>
                )}

                {imgLoading && !imgResult && (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                    <p className="text-sm text-slate-400 animate-pulse">Rendering on Apple M4…</p>
                  </div>
                )}

                {imgResult && (
                  <div className="w-full flex flex-col items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setImgLightbox(true)}
                      className="group relative rounded-xl border border-slate-600 overflow-hidden w-full cursor-pointer max-h-[50vh]"
                      aria-label="Open image fullscreen"
                    >
                      <img src={imgResult} alt="Generated" className="w-full object-contain max-h-[50vh]" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-sm flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full">
                          <FaSearch className="text-amber-400" /> Click to enlarge
                        </span>
                      </div>
                    </button>

                    {imgMeta && (
                      <div className="text-[10px] text-slate-500 text-center">
                        {imgMeta.width}×{imgMeta.height} · {imgMeta.steps} steps · seed {imgMeta.seed} · {(imgMeta.model ?? '').replace('.safetensors', '')}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center">
                      <button type="button" onClick={() => setImgLightbox(true)} className="neural-pill text-sm">
                        <FaSearch className="inline text-amber-400 mr-1" /> View
                      </button>
                      <a href={imgResult} target="_blank" rel="noopener noreferrer" className="neural-pill text-sm">
                        ↗ New tab
                      </a>
                      <a href={imgResult} download="generated.png" className="neural-pill text-sm">
                        <FaDownload className="inline text-amber-400 mr-1" /> Download
                      </a>
                      <button
                        type="button"
                        onClick={handleSaveToGallery}
                        disabled={imgSaved || imgSaving || !imgResult || !imgMeta}
                        className={`neural-pill text-sm ${(imgSaved || !imgMeta) ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {imgSaved
                          ? <><FaCheckCircle className="inline text-amber-400 mr-1" />Saved!</>
                          : imgSaving
                          ? <><FaSave className="inline text-amber-400 mr-1" />Saving…</>
                          : <><FaImages className="inline text-amber-400 mr-1" />Save to Showcase</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-6 py-2 border-t border-slate-700/50 shrink-0 text-[10px] text-slate-500 text-right">
              Press <kbd className="bg-slate-700 px-1 rounded text-slate-400">Esc</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Lightbox ── */}
      {imgLightbox && imgResult && (
        <motion.div
          key="img-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[510] bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setImgLightbox(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setImgLightbox(false); }}
            className="absolute top-4 right-4 text-white text-3xl hover:text-slate-300 z-10"
            aria-label="Close fullscreen"
          >
            <FaTimes />
          </button>
          <img
            src={imgResult}
            alt="Generated (fullscreen)"
            className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-2xl cursor-zoom-out"
          />
        </motion.div>
      )}

      {/* ── Save secret modal ── */}
      {showSecretModal && (
        <motion.div
          key="secret-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[520] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSecretModal(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="neural-card w-full max-w-sm p-6 rounded-2xl border border-amber-500/30 relative"
          >
            <button
              type="button"
              onClick={() => setShowSecretModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-lg cursor-pointer"
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2 flex justify-center"><FaLock className="text-amber-400" /></div>
              <h3 className="text-lg font-semibold text-slate-100">Admin Access</h3>
              <p className="text-xs text-slate-400 mt-1">Enter the gallery password to save this image.</p>
            </div>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSecretSubmit(); }}
              placeholder="Gallery password"
              autoFocus
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder:text-slate-500"
            />
            {secretError && <div className="text-red-400 text-xs text-center mb-3">{secretError}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSecretModal(false)}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800/60 text-slate-300 text-sm py-2.5 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSecretSubmit}
                disabled={!secretInput.trim() || imgSaving}
                className="flex-1 neural-control-btn-primary text-sm py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {imgSaving ? <><FaSave className="inline mr-1" />Saving…</> : <><FaImages className="inline mr-1" />Save</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <>
      {renderSection}
      {modals && createPortal(modals, document.body)}
    </>
  );
}
