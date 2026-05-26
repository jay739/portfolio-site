'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaFilePdf, FaMicrophone, FaSpinner, FaExclamationTriangle,
  FaPlay, FaMagic, FaUserCircle, FaLock, FaSave, FaCheckCircle, FaImages,
} from 'react-icons/fa';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useEscapeKey } from '@/hooks/useEscapeKey';

interface Speaker {
  name: string;
  gender: 'female' | 'male';
  tone: string;
}

type TtsEngine = 'piper' | 'kokoro-real' | 'bark';

const TTS_OPTIONS: { key: TtsEngine; label: string; sub: string }[] = [
  { key: 'piper',       label: 'Piper',       sub: 'Fastest · ~30s · clean voices' },
  { key: 'kokoro-real', label: 'Kokoro-82M',  sub: 'Balanced · ~1-2 min · MPS-accelerated' },
  { key: 'bark',        label: 'Bark',        sub: 'Highest quality · ~15-20 min · CPU' },
];

interface JobStatus {
  status: 'queued' | 'running' | 'done' | 'error' | string;
  progress?: number;
  transcript?: string | null;
  audio_url?: string | null;
  error?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const MAX_BYTES = 50 * 1024 * 1024;
const POLL_INTERVAL_MS = 4_000;
const ESTIMATED_MS = 5 * 60_000;

const defaultSpeakers: Speaker[] = [
  { name: 'Jamie', gender: 'female', tone: 'warm' },
  { name: 'Taylor', gender: 'male', tone: 'neutral' },
];

export default function PodcastGeneratorModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [speakers, setSpeakers] = useState<Speaker[]>(defaultSpeakers);
  const [tts, setTts] = useState<TtsEngine>('piper');
  // Save-to-showcase state
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretError, setSecretError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  useScrollLock(open);
  useEscapeKey(() => { if (open) onClose(); }, open);

  const reset = () => {
    setFile(null);
    setTitle('');
    setSpeakers(defaultSpeakers);
    setTts('piper');
    setJobId(null);
    setStatus(null);
    setError(null);
    setProgressPct(0);
    setSubmitting(false);
    setShowSecretModal(false);
    setSecretInput('');
    setSecretError('');
    setSaving(false);
    setSaved(false);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
  };

  useEffect(() => {
    if (!open) reset();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onFile = (f: File | null) => {
    setError(null);
    if (!f) { setFile(null); return; }
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }
    if (f.size === 0 || f.size > MAX_BYTES) {
      setError('PDF must be larger than 0 and at most 50 MB.');
      return;
    }
    setFile(f);
  };

  const updateSpeaker = (idx: number, patch: Partial<Speaker>) => {
    setSpeakers((cur) => cur.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const startPolling = (id: string) => {
    startedAtRef.current = performance.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = performance.now() - startedAtRef.current;
      // Asymptote to 92% — the upstream pushes us to 100 when truly done.
      setProgressPct((p) => Math.max(p, Math.min(92, (elapsed / ESTIMATED_MS) * 100)));
    }, 250);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate-podcast?id=${encodeURIComponent(id)}`);
        const data: JobStatus = await res.json();
        setStatus(data);
        if (data.status === 'done') {
          setProgressPct(100);
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
        } else if (data.status === 'error') {
          setError(data.error || 'Generation failed.');
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
          if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
        }
      } catch {
        // Transient — keep polling. The cleanup elsewhere handles permanent failure.
      }
    }, POLL_INTERVAL_MS);
  };

  const submitSave = async () => {
    if (!jobId || !secretInput.trim() || saving) return;
    setSaving(true);
    setSecretError('');
    try {
      const res = await fetch('/api/gallery/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretInput,
          jobId,
          title: title.trim() || 'Generated Podcast',
          transcript: status?.transcript ?? '',
          speakers,
          ttsModel: tts,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        setShowSecretModal(false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gallery:refresh'));
        }
      } else {
        setSecretError(data.error || 'Failed to save');
      }
    } catch {
      setSecretError('Network error. Try again.');
    }
    setSaving(false);
  };

  const onSubmit = async () => {
    if (!file || submitting) return;
    setError(null);
    setSubmitting(true);
    setProgressPct(0);
    setStatus({ status: 'queued' });

    const fd = new FormData();
    fd.append('file', file);
    fd.append('config', JSON.stringify({
      title: title.trim() || 'Generated Podcast',
      speakers,
      tts_model: tts,
    }));

    try {
      const res = await fetch('/api/generate-podcast', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not start generation.');
        setSubmitting(false);
        return;
      }
      const id = data.jobId as string;
      setJobId(id);
      startPolling(id);
    } catch {
      setError('Network error contacting the podcast service.');
      setSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const isRunning = !!jobId && status?.status !== 'done' && status?.status !== 'error';
  const isDone = status?.status === 'done' && !!status.audio_url;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="podcast-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/55 backdrop-blur-md p-3 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="neural-card w-full max-w-4xl rounded-2xl border border-slate-600/55 relative flex flex-col max-h-[92vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                  <FaMicrophone className="text-amber-400" /> PDF to Podcast
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ollama + MARS5-TTS · Apple M4 Metal · Self-hosted (PodcastAI backend)
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
                aria-label="Close (Esc)"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
              {/* Left: form */}
              <div className="lg:w-[420px] shrink-0 overflow-y-auto p-5 border-b lg:border-b-0 lg:border-r border-slate-700/50 space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">PDF source</label>
                  <label className="block">
                    <span className="sr-only">Choose PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                      disabled={isRunning}
                      className="hidden"
                      id="podcast-pdf-input"
                    />
                    <span
                      className={`flex items-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer transition ${
                        file ? 'border-amber-500/60 bg-amber-500/5' : 'border-slate-600 hover:border-amber-500/40 bg-slate-800/40'
                      } ${isRunning ? 'opacity-60 pointer-events-none' : ''}`}
                      onClick={() => document.getElementById('podcast-pdf-input')?.click()}
                    >
                      <FaFilePdf className="text-amber-400 text-xl" />
                      <span className="flex-1 text-sm text-slate-200 truncate">
                        {file ? file.name : 'Click to select a PDF (≤ 50 MB)'}
                      </span>
                      {file && (
                        <span className="text-[10px] text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Episode title (optional)</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    placeholder="Generated Podcast"
                    disabled={isRunning}
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm p-2.5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Voice engine</label>
                  <div className="grid grid-cols-1 gap-2">
                    {TTS_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setTts(opt.key)}
                        disabled={isRunning}
                        className={`rounded-lg border p-2.5 text-left text-xs transition ${
                          tts === opt.key
                            ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                            : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Hosts</label>
                  <div className="space-y-2">
                    {speakers.map((s, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <FaUserCircle className="text-amber-400" />
                          <input
                            value={s.name}
                            onChange={(e) => updateSpeaker(idx, { name: e.target.value.slice(0, 24) })}
                            disabled={isRunning}
                            className="flex-1 rounded-md bg-slate-800 border border-slate-600 text-slate-100 text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            aria-label={`Host ${idx + 1} name`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <select
                            value={s.gender}
                            onChange={(e) => updateSpeaker(idx, { gender: e.target.value as Speaker['gender'] })}
                            disabled={isRunning}
                            className="rounded-md bg-slate-800 border border-slate-600 text-slate-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="female">female</option>
                            <option value="male">male</option>
                          </select>
                          <select
                            value={s.tone}
                            onChange={(e) => updateSpeaker(idx, { tone: e.target.value })}
                            disabled={isRunning}
                            className="rounded-md bg-slate-800 border border-slate-600 text-slate-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="neutral">neutral</option>
                            <option value="warm">warm</option>
                            <option value="curious">curious</option>
                            <option value="skeptical">skeptical</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!file || isRunning || submitting}
                  className="neural-pill w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRunning
                    ? <><FaSpinner className="inline animate-spin text-amber-400 mr-1.5" />Generating…</>
                    : <><FaMagic className="inline text-amber-400 mr-1.5" />Generate podcast</>}
                </button>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Generation runs on the Mac Mini M4 (Metal GPU). One job at a time across the whole site —
                  if it&apos;s busy, please come back later. Pick <strong>Piper</strong> for the fastest
                  turnaround; <strong>Kokoro-82M</strong> for nicer voices at near-realtime;
                  <strong> Bark</strong> when audio quality matters more than speed.
                </p>

                {error && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 flex items-start gap-2">
                    <FaExclamationTriangle className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{error}</p>
                  </div>
                )}
              </div>

              {/* Right: progress / result */}
              <div className="flex-1 flex flex-col p-5 min-h-[280px]">
                {!jobId && !error && (
                  <div className="m-auto flex flex-col items-center text-center opacity-50 select-none">
                    <FaMicrophone className="text-5xl text-amber-400/40 mb-3" />
                    <p className="text-sm text-slate-400">Pick a PDF and hit Generate</p>
                    <p className="text-xs text-slate-500 mt-1">The transcript and audio will appear here</p>
                  </div>
                )}

                {isRunning && (
                  <div className="m-auto flex flex-col items-center gap-4 w-full max-w-xs text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                    <div className="w-full">
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-150"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 animate-pulse">
                        {status?.status === 'queued' ? 'Queued…' : 'Running on Apple M4 Metal…'}
                        {' '}{Math.round(progressPct)}%
                      </p>
                    </div>
                  </div>
                )}

                {isDone && status?.audio_url && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-2">
                        <FaPlay className="text-amber-400" /> Listen
                      </h4>
                      <audio src={status.audio_url} controls className="w-full" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={status.audio_url}
                        download={`podcast-${jobId ?? 'audio'}.mp3`}
                        className="neural-pill text-sm"
                      >
                        Download MP3
                      </a>
                      <button
                        type="button"
                        onClick={() => { setSecretInput(''); setSecretError(''); setShowSecretModal(true); }}
                        disabled={saved}
                        className={`neural-pill text-sm ${saved ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {saved
                          ? <><FaCheckCircle className="inline text-amber-400 mr-1" />Saved!</>
                          : <><FaImages className="inline text-amber-400 mr-1" />Save to Showcase</>}
                      </button>
                    </div>
                    {status.transcript && (
                      <div>
                        <h4 className="text-sm font-semibold text-amber-300 mb-2">Transcript</h4>
                        <pre className="rounded-lg bg-slate-900/60 border border-slate-700 p-3 text-xs text-slate-300 whitespace-pre-wrap max-h-[40vh] overflow-y-auto">
                          {status.transcript}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-2 border-t border-slate-700/50 shrink-0 text-[10px] text-slate-500 text-right">
              Press <kbd className="bg-slate-700 px-1 rounded text-slate-400">Esc</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}

      {showSecretModal && (
        <motion.div
          key="podcast-secret-modal"
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
              <p className="text-xs text-slate-400 mt-1">Enter the showcase password to save this podcast.</p>
            </div>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSave(); }}
              placeholder="Showcase password"
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
                onClick={submitSave}
                disabled={!secretInput.trim() || saving}
                className="flex-1 neural-control-btn-primary text-sm py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? <><FaSave className="inline mr-1" />Saving…</> : <><FaImages className="inline mr-1" />Save</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
