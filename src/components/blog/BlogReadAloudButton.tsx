'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, Volume2 } from 'lucide-react';

interface BlogReadAloudButtonProps {
  title: string;
  excerpt: string;
}

const VOICE_STORAGE_KEY = 'blog_tts_voice_v2';
const RATE_STORAGE_KEY = 'blog_tts_rate_v2';

function removeEmojis(str: string) {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
}

function extractReadableText(element: Element): string {
  let result = '';
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      result += child.textContent ?? '';
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;

    if (el.tagName === 'PRE' || el.tagName === 'CODE') {
      result += ' Code example omitted from narration. ';
      continue;
    }

    if (el.tagName === 'TABLE') {
      result += ' Table omitted from narration. ';
      continue;
    }

    if (el.tagName === 'LI') {
      result += ' ';
    }

    result += extractReadableText(el);

    if (['P', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'LI'].includes(el.tagName)) {
      result += ' ';
    }
  }
  return result;
}

function normalizeNarrationText(title: string, excerpt: string, articleText: string) {
  return removeEmojis(`${title}. ${excerpt}. ${articleText}`)
    .replace(/\s+/g, ' ')
    .replace(/\bAI\b/g, 'A I')
    .replace(/\bML\b/g, 'M L')
    .replace(/\bLLM\b/g, 'L L M')
    .replace(/\bRAG\b/g, 'R A G')
    .replace(/\bNLP\b/g, 'N L P')
    .replace(/\bGPU\b/g, 'G P U')
    .replace(/\bUI\b/g, 'U I')
    .replace(/\bUX\b/g, 'U X')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

function splitIntoChunks(text: string, maxLength = 260) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (sentence.length <= maxLength) {
      current = sentence;
      continue;
    }

    const parts =
      sentence.match(new RegExp(`.{1,${maxLength}}(\\s|$)`, 'g'))?.map((part) => part.trim()).filter(Boolean) ?? [sentence];
    chunks.push(...parts.slice(0, -1));
    current = parts[parts.length - 1] ?? '';
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function choosePreferredVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  const preferredNames = [
    'Google US English',
    'Samantha',
    'Microsoft Aria',
    'Microsoft Jenny',
    'Daniel',
    'Karen',
    'Moira',
  ];

  for (const name of preferredNames) {
    const match = englishVoices.find((voice) => voice.name.includes(name));
    if (match) return match;
  }

  return englishVoices.find((voice) => voice.localService) || englishVoices[0] || voices[0] || null;
}

export default function BlogReadAloudButton({ title, excerpt }: BlogReadAloudButtonProps) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [rate, setRate] = useState(0.96);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [status, setStatus] = useState('Ready for a more natural read-aloud pass.');

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);

      const savedVoice = window.localStorage.getItem(VOICE_STORAGE_KEY);
      const preferredVoice = availableVoices.find((voice) => voice.voiceURI === savedVoice) || choosePreferredVoice(availableVoices);
      if (preferredVoice) {
        setSelectedVoiceURI(preferredVoice.voiceURI);
      }
    };

    const savedRate = Number(window.localStorage.getItem(RATE_STORAGE_KEY) || '0.96');
    if (!Number.isNaN(savedRate) && savedRate >= 0.85 && savedRate <= 1.1) {
      setRate(savedRate);
    }

    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);

    return () => {
      synth.cancel();
      synth.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedVoiceURI) {
      window.localStorage.setItem(VOICE_STORAGE_KEY, selectedVoiceURI);
    }
  }, [selectedVoiceURI]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RATE_STORAGE_KEY, String(rate));
  }, [rate]);

  useEffect(() => {
    const handleBeforeUnload = () => synthRef.current?.cancel();
    const handleVisibilityChange = () => {
      if (!document.hidden || !synthRef.current) return;
      synthRef.current.pause();
      setIsPaused(true);
      setStatus('Read aloud paused while the tab is in the background.');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.voiceURI === selectedVoiceURI) || choosePreferredVoice(voices),
    [selectedVoiceURI, voices]
  );

  const progress =
    chunksRef.current.length > 0 ? ((currentChunkIndex + (isPlaying || isPaused ? 1 : 0)) / chunksRef.current.length) * 100 : 0;

  const stopReading = (nextStatus = 'Stopped read aloud.') => {
    synthRef.current?.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
    setStatus(nextStatus);
  };

  const speakChunk = (index: number) => {
    const synth = synthRef.current;
    const chunk = chunksRef.current[index];
    if (!synth || !chunk) {
      stopReading('Finished read aloud.');
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current = utterance;
    utterance.voice = selectedVoice ?? null;
    utterance.rate = rate;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentChunkIndex(index);
      setStatus(`Reading section ${index + 1} of ${chunksRef.current.length}.`);
    };

    utterance.onend = () => {
      if (index >= chunksRef.current.length - 1) {
        stopReading('Finished read aloud.');
        return;
      }
      speakChunk(index + 1);
    };

    utterance.onerror = () => {
      stopReading('Read aloud stopped because the browser voice failed.');
    };

    synth.speak(utterance);
  };

  const prepareChunks = () => {
    const articleElement = document.querySelector('.prose');
    if (!articleElement) {
      setStatus('Article text was not ready for narration yet.');
      return [];
    }

    const normalizedText = normalizeNarrationText(title, excerpt, extractReadableText(articleElement));
    return splitIntoChunks(normalizedText);
  };

  const handlePlayPause = () => {
    if (!isSupported || !synthRef.current) return;

    if (isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
      setStatus('Read aloud paused.');
      return;
    }

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setStatus(`Reading section ${currentChunkIndex + 1} of ${chunksRef.current.length}.`);
      return;
    }

    const nextChunks = prepareChunks();
    if (nextChunks.length === 0) return;
    chunksRef.current = nextChunks;
    speakChunk(0);
  };

  const handleSkip = (direction: 'back' | 'forward') => {
    if (!isSupported) return;
    if (chunksRef.current.length === 0) {
      const nextChunks = prepareChunks();
      if (nextChunks.length === 0) return;
      chunksRef.current = nextChunks;
    }

    const delta = direction === 'forward' ? 1 : -1;
    const nextIndex = Math.min(Math.max(currentChunkIndex + delta, 0), Math.max(chunksRef.current.length - 1, 0));
    speakChunk(nextIndex);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-slate-950/35 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/8 px-3 py-1 text-xs text-amber-100">
          <Volume2 className="h-3.5 w-3.5 text-amber-300" />
          Read aloud
        </div>

        <button
          type="button"
          onClick={() => handleSkip('back')}
          disabled={!isSupported}
          className="neural-control-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
          aria-label="Go to previous spoken section"
        >
          <SkipBack className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!isSupported}
          className="neural-control-btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
          aria-label={isPlaying && !isPaused ? 'Pause reading aloud' : 'Start or resume reading aloud'}
        >
          {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play'}
        </button>

        <button
          type="button"
          onClick={() => handleSkip('forward')}
          disabled={!isSupported}
          className="neural-control-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-50"
          aria-label="Go to next spoken section"
        >
          Next
          <SkipForward className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => stopReading()}
          disabled={!isSupported || (!isPlaying && !isPaused)}
          className="neural-control-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs disabled:opacity-40"
          aria-label="Stop reading aloud"
        >
          <Square className="h-3.5 w-3.5" />
          Stop
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr,160px,130px] sm:items-center">
        <label className="flex min-w-0 flex-col gap-1 text-xs text-slate-400">
          <span>Voice</span>
          <select
            value={selectedVoiceURI}
            onChange={(event) => setSelectedVoiceURI(event.target.value)}
            disabled={!isSupported || voices.length === 0}
            className="rounded-xl border border-slate-700/60 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {voices
              .filter((voice) => voice.lang.toLowerCase().startsWith('en'))
              .map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                  {voice.localService ? ' · local' : ''}
                </option>
              ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          <span>Pace</span>
          <select
            value={String(rate)}
            onChange={(event) => setRate(Number(event.target.value))}
            disabled={!isSupported}
            className="rounded-xl border border-slate-700/60 bg-slate-900/65 px-3 py-2 text-sm text-slate-100 outline-none"
          >
            <option value="0.9">Calmer</option>
            <option value="0.96">Natural</option>
            <option value="1.02">Brisk</option>
          </select>
        </label>

        <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
          {selectedVoice ? `${selectedVoice.name} · ${selectedVoice.lang}` : isSupported ? 'Loading voices...' : 'Browser TTS unavailable'}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{status}</span>
          {chunksRef.current.length > 0 && (
            <span>
              Section {Math.min(currentChunkIndex + 1, chunksRef.current.length)} / {chunksRef.current.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
