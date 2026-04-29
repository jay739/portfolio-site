'use client';

import React, { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaServer,
  FaWrench,
  FaLayerGroup,
  FaCopy,
  FaCheck,
  FaShieldAlt,
  FaRandom,
  FaLock,
  FaFont,
  FaHashtag,
  FaPalette,
  FaRuler,
  FaThermometerHalf,
  FaAlignLeft,
} from 'react-icons/fa';
import { useScrollLock } from '@/hooks/useScrollLock';

// ─── Utility helpers ──────────────────────────────────────────────────────────

function uuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): string {
  const sets = [
    opts.upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    opts.lower ? 'abcdefghijklmnopqrstuvwxyz' : '',
    opts.digits ? '0123456789' : '',
    opts.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
  ].filter(Boolean);
  if (!sets.length) return '';
  const pool = sets.join('');
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => pool[b % pool.length]).join('');
}

type TempUnit = 'C' | 'F' | 'K';
function convertTemp(val: number, from: TempUnit, to: TempUnit): number {
  if (from === to) return val;
  let c = from === 'C' ? val : from === 'F' ? (val - 32) * 5 / 9 : val - 273.15;
  return to === 'C' ? c : to === 'F' ? c * 9 / 5 + 32 : c + 273.15;
}

function transformCase(text: string, mode: string): string {
  switch (mode) {
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'title': return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
    case 'camel': return text.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toLowerCase());
    case 'snake': return text.toLowerCase().replace(/\s+/g, '_');
    case 'kebab': return text.toLowerCase().replace(/\s+/g, '-');
    case 'reverse': return text.split('').reverse().join('');
    default: return text;
  }
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [value]);
  return (
    <button
      type="button"
      onClick={copy}
      className="neural-pill py-1 px-3 text-xs flex items-center gap-1.5 shrink-0"
    >
      {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-amber-400" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Individual tool panels ───────────────────────────────────────────────────

function UuidTool() {
  const [uuid, setUuid] = useState(() => uuidV4());
  const [count, setCount] = useState(1);
  const bulk = Array.from({ length: count }, () => uuidV4()).join('\n');
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Generate RFC 4122 v4 UUIDs using the browser's cryptographic PRNG.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="flex-1 min-w-0 truncate text-amber-300 text-sm font-mono bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">{uuid}</code>
        <CopyBtn value={uuid} />
        <button type="button" onClick={() => setUuid(uuidV4())} className="neural-pill py-1 px-3 text-xs flex items-center gap-1.5">
          <FaRandom className="text-amber-400" /> Regenerate
        </button>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <label className="text-xs text-slate-400 shrink-0">Bulk generate:</label>
        <input
          type="range" min={1} max={20} value={count}
          onChange={(e) => setCount(+e.target.value)}
          className="flex-1 accent-amber-400"
        />
        <span className="text-xs text-amber-400 w-6">{count}</span>
      </div>
      {count > 1 && (
        <div className="relative">
          <pre className="text-xs text-slate-300 font-mono bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 whitespace-pre-wrap">{bulk}</pre>
          <div className="absolute top-2 right-2"><CopyBtn value={bulk} /></div>
        </div>
      )}
    </div>
  );
}

function HashTool() {
  const [input, setInput] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    const h = await sha256(input);
    setHash(h);
    setLoading(false);
  }, [input]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">SHA-256 hash computation — same cryptographic functions powering Batcave's internal services.</p>
      <textarea
        value={input}
        onChange={(e) => { setInput(e.target.value); setHash(''); }}
        placeholder="Enter text to hash..."
        rows={3}
        className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      />
      <button type="button" onClick={compute} disabled={!input || loading} className="neural-pill text-xs flex items-center gap-1.5">
        <FaHashtag className="text-amber-400" /> {loading ? 'Hashing...' : 'Compute SHA-256'}
      </button>
      {hash && (
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 truncate text-amber-300 text-xs font-mono bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">{hash}</code>
          <CopyBtn value={hash} />
        </div>
      )}
    </div>
  );
}

function Base64Tool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  let output = '';
  let error = '';
  try {
    output = mode === 'encode' ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)));
  } catch {
    if (input) error = mode === 'decode' ? 'Invalid Base64 string' : 'Encoding error';
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Encode or decode Base64 — supports Unicode (UTF-8 safe).</p>
      <div className="flex gap-2">
        {(['encode', 'decode'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setInput(''); }}
            className={`neural-pill py-1 px-3 text-xs capitalize ${mode === m ? 'border-amber-400/80' : 'opacity-60'}`}>
            {m}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
        rows={3}
        className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      />
      {input && !error && (
        <div className="relative">
          <pre className="text-xs text-slate-300 font-mono bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 whitespace-pre-wrap break-all">{output}</pre>
          <div className="absolute top-2 right-2"><CopyBtn value={output} /></div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function PasswordTool() {
  const [len, setLen] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true });
  const [pwd, setPwd] = useState(() => generatePassword(20, { upper: true, lower: true, digits: true, symbols: true }));

  const regen = () => setPwd(generatePassword(len, opts));
  const toggle = (k: keyof typeof opts) => {
    const next = { ...opts, [k]: !opts[k] };
    const active = Object.values(next).filter(Boolean).length;
    if (active === 0) return;
    setOpts(next);
    setPwd(generatePassword(len, next));
  };

  const strength = (() => {
    if (pwd.length >= 20 && Object.values(opts).every(Boolean)) return { label: 'Strong', color: 'text-green-400' };
    if (pwd.length >= 12) return { label: 'Medium', color: 'text-amber-400' };
    return { label: 'Weak', color: 'text-red-400' };
  })();

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Cryptographically random password using <code>crypto.getRandomValues</code>.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="flex-1 min-w-0 truncate text-amber-300 text-sm font-mono bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">{pwd}</code>
        <CopyBtn value={pwd} />
        <button type="button" onClick={regen} className="neural-pill py-1 px-3 text-xs flex items-center gap-1.5">
          <FaRandom className="text-amber-400" /> New
        </button>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400 shrink-0">Length: <span className="text-amber-400">{len}</span></label>
        <input type="range" min={8} max={64} value={len}
          onChange={(e) => { setLen(+e.target.value); setPwd(generatePassword(+e.target.value, opts)); }}
          className="flex-1 accent-amber-400"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {(['upper', 'lower', 'digits', 'symbols'] as const).map((k) => (
          <button key={k} type="button" onClick={() => toggle(k)}
            className={`neural-pill py-1 px-3 text-xs capitalize ${opts[k] ? 'border-amber-400/80' : 'opacity-40'}`}>
            {k}
          </button>
        ))}
        <span className={`ml-auto text-xs font-semibold self-center ${strength.color}`}>{strength.label}</span>
      </div>
    </div>
  );
}

function ColorTool() {
  const [hex, setHex] = useState('#f59e0b');
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Convert color values between HEX, RGB, and HSL formats.</p>
      <div className="flex items-center gap-3">
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)}
          className="w-12 h-10 rounded-lg border border-slate-700/60 cursor-pointer bg-transparent p-0.5" />
        <input type="text" value={hex} onChange={(e) => setHex(e.target.value)}
          className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-2 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50 uppercase"
        />
        <div className="w-10 h-10 rounded-lg border border-slate-700/60 shrink-0" style={{ backgroundColor: hex }} />
      </div>
      {rgb && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: 'HEX', value: hex.toUpperCase() },
            { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: 'HSL', value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-400 shrink-0 w-8">{label}</span>
              <code className="flex-1 text-xs text-amber-300 font-mono truncate">{value}</code>
              <CopyBtn value={value} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseTool() {
  const [input, setInput] = useState('');
  const modes = [
    { key: 'upper', label: 'UPPER' },
    { key: 'lower', label: 'lower' },
    { key: 'title', label: 'Title' },
    { key: 'camel', label: 'camelCase' },
    { key: 'snake', label: 'snake_case' },
    { key: 'kebab', label: 'kebab-case' },
    { key: 'reverse', label: 'esreveR' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Transform text between common case formats instantly.</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to transform..."
        rows={3}
        className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      />
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => {
          const result = input ? transformCase(input, m.key) : '';
          return (
            <div key={m.key} className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/60 rounded-lg pl-3 pr-1.5 py-1">
              <span className="text-xs text-slate-400 shrink-0 w-20 font-mono">{m.label}</span>
              <code className="text-xs text-amber-300 font-mono truncate max-w-[160px]">{result || '…'}</code>
              <CopyBtn value={result} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TempTool() {
  const [value, setValue] = useState('100');
  const [from, setFrom] = useState<TempUnit>('C');
  const units: TempUnit[] = ['C', 'F', 'K'];
  const num = parseFloat(value);
  const valid = !isNaN(num);

  const results = units
    .filter((u) => u !== from)
    .map((u) => ({ unit: u, value: valid ? convertTemp(num, from, u).toFixed(2) : '—' }));

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Convert temperatures between Celsius, Fahrenheit, and Kelvin.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-2 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        <div className="flex gap-1">
          {units.map((u) => (
            <button key={u} type="button" onClick={() => setFrom(u)}
              className={`neural-pill py-1 px-3 text-xs ${from === u ? 'border-amber-400/80' : 'opacity-60'}`}>
              °{u}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {results.map(({ unit, value: v }) => (
          <div key={unit} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-400">°{unit}</span>
            <code className="text-amber-300 text-sm font-mono font-bold">{v}</code>
            {valid && <CopyBtn value={v} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function WordCountTool() {
  const [input, setInput] = useState('');
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const chars = input.length;
  const noSpaces = input.replace(/\s/g, '').length;
  const lines = input.split('\n').length;
  const sentences = input.split(/[.!?]+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Real-time text statistics and readability estimate.</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste or type your text here..."
        rows={5}
        className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Words', value: words },
          { label: 'Chars', value: chars },
          { label: 'No spaces', value: noSpaces },
          { label: 'Lines', value: lines },
          { label: 'Sentences', value: sentences },
          { label: 'Read time', value: `~${readMin}m` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center bg-slate-800/60 border border-slate-700/60 rounded-lg py-2 px-1">
            <span className="text-lg font-bold text-amber-400">{value}</span>
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tool suite definitions ───────────────────────────────────────────────────

interface ToolDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const IT_TOOLS: ToolDef[] = [
  { id: 'uuid',     label: 'UUID Generator',   icon: <FaRandom />,   component: <UuidTool /> },
  { id: 'hash',     label: 'SHA-256 Hash',      icon: <FaHashtag />,  component: <HashTool /> },
  { id: 'base64',   label: 'Base64',            icon: <FaFont />,     component: <Base64Tool /> },
  { id: 'password', label: 'Password Gen',      icon: <FaLock />,     component: <PasswordTool /> },
];

const OMNI_TOOLS: ToolDef[] = [
  { id: 'color',  label: 'Color Converter',  icon: <FaPalette />,         component: <ColorTool /> },
  { id: 'case',   label: 'Case Transform',   icon: <FaAlignLeft />,       component: <CaseTool /> },
  { id: 'temp',   label: 'Temperature',      icon: <FaThermometerHalf />, component: <TempTool /> },
  { id: 'words',  label: 'Word Counter',     icon: <FaRuler />,           component: <WordCountTool /> },
];

// ─── Tool suite panel ─────────────────────────────────────────────────────────

interface SuitePanelProps {
  tools: ToolDef[];
  suiteName: string;
  active: string;
  onChange: (toolId: string) => void;
}

function SuitePanel({ tools, suiteName, active, onChange }: SuitePanelProps) {
  const current = tools.find((t) => t.id === active)!;

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`neural-pill py-1.5 px-3 text-xs flex items-center gap-1.5 ${
              active === t.id ? 'border-amber-400/80' : 'opacity-55'
            }`}
          >
            <span className="text-amber-400 text-[10px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tool */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4"
      >
        {current.component}
      </motion.div>

      {/* Footer */}
      <div className="text-xs text-slate-500">
        Showing {tools.length} of {suiteName === 'IT Tools' ? '60+' : '30+'} tools available on Batcave
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SUITES = [
  {
    id: 'it-tools',
    name: 'IT Tools',
    tagline: '60+ developer & sysadmin utilities',
    description: 'Developer toolkit running on Batcave — UUID generator, Base64, hash functions, password generator, JWT decoder, regex tester, and more. Powered by the same infrastructure behind my self-hosted services.',
    icon: <FaWrench className="text-amber-400" />,
    tools: IT_TOOLS,
    stack: ['Vue.js', 'Docker', 'nginx'],
  },
  {
    id: 'omni-tools',
    name: 'OmniTools',
    tagline: '30+ conversion & utility tools',
    description: 'Multi-format conversion suite on Batcave — color spaces, text case transformers, temperature converter, word counter, and more. Part of my self-hosted utility stack.',
    icon: <FaLayerGroup className="text-amber-400" />,
    tools: OMNI_TOOLS,
    stack: ['React', 'FFmpeg', 'Docker', 'nginx'],
  },
];

export default function BatcaveTools() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeSuite, setActiveSuite] = useState(SUITES[0].id);
  const [activeTool, setActiveTool] = useState(IT_TOOLS[0].id);
  const [urlStateReady, setUrlStateReady] = useState(false);
  const suite = SUITES.find((s) => s.id === activeSuite)!;

  // No modals in this component but keep consistent scroll behaviour
  useScrollLock(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const suiteParam = params.get('suite');
    const toolParam = params.get('utility');
    const nextSuite = SUITES.find((entry) => entry.id === suiteParam);
    if (nextSuite) {
      setActiveSuite(nextSuite.id);
      const hasTool = nextSuite.tools.some((tool) => tool.id === toolParam);
      setActiveTool(hasTool && toolParam ? toolParam : nextSuite.tools[0].id);
    }
    setUrlStateReady(true);
  }, []);

  useEffect(() => {
    const defaultTool = suite.tools[0]?.id;
    if (!suite.tools.some((tool) => tool.id === activeTool) && defaultTool) {
      setActiveTool(defaultTool);
    }
  }, [activeTool, suite.tools]);

  useEffect(() => {
    if (typeof window === 'undefined' || !urlStateReady) return;
    const params = new URLSearchParams(window.location.search);
    params.set('suite', activeSuite);
    if (activeTool !== suite.tools[0]?.id) {
      params.set('utility', activeTool);
    } else {
      params.delete('utility');
    }
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [activeSuite, activeTool, pathname, router, suite.tools, urlStateReady]);

  return (
    <section className="relative pt-4 pb-16 px-2 sm:px-6 w-full">
      <div className="w-full neural-card neural-glow-border p-4 sm:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="neural-section-title flex items-center gap-2">
              <FaServer className="text-amber-400" /> Batcave Toolbox
            </h2>
            <p className="neural-section-copy max-w-2xl mt-1">
              Selected tools from my{' '}
              <span className="text-amber-400 font-semibold">56-container Batcave</span> server —
              a private self-hosted infrastructure stack running 24/7. Processing happens on Batcave.
            </p>
          </div>
          <span className="neural-kicker flex items-center gap-1 shrink-0">
            <FaShieldAlt className="text-amber-400" /> Private Infrastructure
          </span>
        </div>

        {/* Suite selector */}
        <div className="flex flex-wrap gap-3 mb-6">
          {SUITES.map((s) => (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveSuite(s.id);
                setActiveTool(s.tools[0].id);
              }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeSuite === s.id
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                  : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-amber-500/30 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{s.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{s.name}</div>
                <div className="text-[10px] opacity-70">{s.tagline}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Active suite */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuite}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {/* Suite header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4 pb-4 border-b border-slate-700/40">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-lg">
                  {suite.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{suite.name}</h3>
                  <p className="text-sm text-slate-400 max-w-lg mt-0.5">{suite.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {suite.stack.map((s) => (
                  <span key={s} className="neural-pill neural-pill-static text-xs py-0.5 px-2">{s}</span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <SuitePanel tools={suite.tools} suiteName={suite.name} active={activeTool} onChange={setActiveTool} />
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
          <FaShieldAlt className="text-amber-400 mt-0.5 shrink-0" />
          <span>
            These tools are part of a larger self-hosted utility stack running on Batcave —
            a private infrastructure accessible over a secure VPN. The demos above showcase
            a selection of what's available on the server.
          </span>
        </div>
      </div>
    </section>
  );
}
