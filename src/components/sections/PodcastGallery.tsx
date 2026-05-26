'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FaPlay, FaMicrophone, FaDownload, FaTrash, FaLock } from 'react-icons/fa';

export interface PodcastSpeaker {
  name: string;
  gender: string;
  tone?: string;
}

export interface PodcastItem {
  id: string;
  filename: string;
  title: string;
  transcript: string;
  speakers: PodcastSpeaker[];
  ttsModel: string;
  llmModel?: string;
  bytes: number;
  createdAt: string;
}

interface Props {
  initialItems?: PodcastItem[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PodcastGallery({ initialItems = [] }: Props) {
  const [items, setItems] = useState<PodcastItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gallery/podcast', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.podcasts)) setItems(data.podcasts);
    } catch {
      // keep last good list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => { void refresh(); };
    window.addEventListener('gallery:refresh', handler);
    return () => window.removeEventListener('gallery:refresh', handler);
  }, [refresh]);

  const handleDelete = async () => {
    if (!deleteId || !secret.trim()) return;
    setDeleteError('');
    try {
      const res = await fetch(
        `/api/gallery/podcast?id=${encodeURIComponent(deleteId)}&secret=${encodeURIComponent(secret)}`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        setItems((cur) => cur.filter((i) => i.id !== deleteId));
        setDeleteId(null);
        setSecret('');
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'Failed to delete');
      }
    } catch {
      setDeleteError('Network error');
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="w-full neural-card neural-glow-border p-8 text-center">
        <FaMicrophone className="mx-auto text-4xl text-amber-400/40 mb-3" />
        <h3 className="neural-section-title mb-2">No podcasts yet</h3>
        <p className="neural-section-copy text-sm text-slate-400">
          Generated podcasts saved to the showcase will appear here. Try the{' '}
          <a href="/ai-tools?tool=podcast-generator" className="text-amber-400 underline">PDF to Podcast</a> tool.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full neural-card neural-glow-border p-4 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="neural-section-title flex items-center gap-2">
          <FaMicrophone className="text-amber-400" />
          Generated Podcasts
        </h2>
        <span className="text-xs text-slate-500">
          {items.length} {items.length === 1 ? 'podcast' : 'podcasts'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-600/55 bg-slate-900/40 p-4 flex flex-col gap-3"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-amber-300 truncate">{item.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {formatDate(item.createdAt)} · {item.ttsModel} · {formatBytes(item.bytes)}
                  </p>
                </div>
                <FaPlay className="text-amber-400/60 shrink-0 mt-1" />
              </header>

              <audio
                src={`/api/gallery/podcast/audio/${encodeURIComponent(item.filename)}`}
                controls
                preload="none"
                className="w-full"
              />

              <div className="flex flex-wrap gap-1.5">
                {item.speakers.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] text-slate-300"
                  >
                    {s.name} · {s.gender}
                  </span>
                ))}
                {item.llmModel && (
                  <span className="rounded-full border border-slate-600 px-2 py-0.5 text-[10px] text-slate-300">
                    {item.llmModel}
                  </span>
                )}
              </div>

              {item.transcript && (
                <div>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                    className="text-[11px] text-amber-300 hover:text-amber-200 underline underline-offset-2 cursor-pointer"
                  >
                    {isOpen ? 'Hide transcript' : 'Show transcript'}
                  </button>
                  {isOpen && (
                    <pre className="mt-2 rounded-lg bg-slate-950/60 border border-slate-700 p-3 text-xs text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {item.transcript}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`/api/gallery/podcast/audio/${encodeURIComponent(item.filename)}`}
                  download={item.filename}
                  className="neural-pill text-[11px]"
                >
                  <FaDownload className="inline text-amber-400 mr-1" /> MP3
                </a>
                <button
                  type="button"
                  onClick={() => { setDeleteId(item.id); setSecret(''); setDeleteError(''); }}
                  className="text-[11px] text-slate-500 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <FaTrash /> Delete (admin)
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {deleteId && (
        <div
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/55 backdrop-blur-md p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}
        >
          <div className="neural-card w-full max-w-sm p-6 rounded-2xl border border-red-500/30">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2 flex justify-center"><FaLock className="text-amber-400" /></div>
              <h3 className="text-lg font-semibold text-slate-100">Confirm Delete</h3>
              <p className="text-xs text-slate-400 mt-1">Admin password required to remove this podcast.</p>
            </div>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(); }}
              placeholder="Showcase password"
              autoFocus
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-slate-100 text-sm p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-slate-500"
            />
            {deleteError && <p className="text-red-400 text-xs text-center mb-3">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800/60 text-slate-300 text-sm py-2.5 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!secret.trim()}
                className="flex-1 neural-control-btn-primary text-sm py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaTrash className="inline mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
