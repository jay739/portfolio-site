'use client';
import { useState, useRef, useEffect, useMemo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import chatAnim from '../../../public/lottie-chat.json';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface AskContext {
  source?: string;
  chip?: string;
  pageTitle?: string;
}

const OOS_PREFIX =
  'I am confined to answer details about Jayakrishna; such questions are out of my scope of answering.';
const REQUEST_TIMEOUT_MS = 25000;
const MIN_THINKING_MS = 1400;
const MIN_TYPE_MS = 1600;
const MAX_TYPE_MS = 4600;

/* ---------- sub-components ---------- */

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-black"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.72,
            repeat: Infinity,
            delay: i * 0.17,
            ease: 'easeInOut',
          }}
        />
      ))}
      <motion.span
        className="ml-1 text-xs font-semibold tracking-wide text-amber-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        Thinking
      </motion.span>
    </span>
  );
}

/* ---------- animation variants ---------- */

const panelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.88,
    y: 24,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28, mass: 0.75 },
  },
  exit: {
    opacity: 0,
    scale: 0.86,
    y: 18,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  },
};

const msgVariants = {
  hidden: (sender: 'user' | 'bot') => ({
    opacity: 0,
    x: sender === 'user' ? 20 : -20,
    y: 8,
    scale: 0.93,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 460, damping: 34, mass: 0.5 },
  },
};

/* ---------- main component ---------- */

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi, I am Jayakrishna's assistant. Ask about his profile, resume, experience, projects, or social links.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingContext, setPendingContext] = useState<AskContext | null>(null);
  const [activeContext, setActiveContext] = useState<AskContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingAnimRef = useRef<number>(0);

  const autoResizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const animateInputText = (text: string) => {
    typingAnimRef.current += 1;
    const runId = typingAnimRef.current;
    setInput('');
    const chars = Array.from(text);
    const total = chars.length;
    if (total === 0) return;
    const stepMs = Math.max(20, Math.min(45, Math.floor(1800 / total)));
    let i = 0;
    const tick = () => {
      if (typingAnimRef.current !== runId) return;
      i += 1;
      setInput(chars.slice(0, i).join(''));
      if (i < total) setTimeout(tick, stepMs);
    };
    tick();
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onAsk = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message?: string; source?: string; chip?: string; pageTitle?: string;
      }>;
      const message = customEvent.detail?.message?.trim();
      setOpen(true);
      if (message) animateInputText(message);
      const context: AskContext = {
        source: customEvent.detail?.source,
        chip: customEvent.detail?.chip,
        pageTitle: customEvent.detail?.pageTitle,
      };
      setPendingContext(context);
      setActiveContext(context);
      setTimeout(() => { inputRef.current?.focus(); autoResizeInput(); }, 0);
    };
    window.addEventListener('chatbot:open', onOpen as EventListener);
    window.addEventListener('chatbot:ask', onAsk as EventListener);
    return () => {
      window.removeEventListener('chatbot:open', onOpen as EventListener);
      window.removeEventListener('chatbot:ask', onAsk as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  useEffect(() => { autoResizeInput(); }, [input, open]);

  const sendMessage = async () => {
    const currentInput = input.trim();
    if (!currentInput || loading) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: currentInput }]);
    setLoading(true);
    typingAnimRef.current += 1;
    setInput('');
    const botMsg: Message = { sender: 'bot', text: '' };
    setMessages((msgs) => [...msgs, botMsg]);
    const requestStartedAt = Date.now();

    const setLastBotMessage = (text: string) => {
      setMessages((msgs) => {
        const updated = [...msgs];
        updated[updated.length - 1] = { sender: 'bot', text };
        return updated;
      });
    };

    const ensureMinThinking = async () => {
      const elapsed = Date.now() - requestStartedAt;
      if (elapsed < MIN_THINKING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_THINKING_MS - elapsed));
      }
    };

    const animateReply = async (fullText: string) => {
      const tokens = fullText.match(/\S+\s*/g) || [fullText];
      const stepDelay = Math.max(MIN_TYPE_MS / tokens.length, 16);
      const boundedDelay = Math.min(stepDelay, MAX_TYPE_MS / tokens.length);
      let built = '';
      for (const token of tokens) {
        built += token;
        setLastBotMessage(built);
        await new Promise((resolve) => setTimeout(resolve, boundedDelay));
      }
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          stream: true,
          clientContext: pendingContext ?? activeContext,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let message = 'Chatbot backend unreachable';
        try {
          const payload = await res.json();
          if (payload?.error) message = payload.error;
        } catch { /* no-op */ }
        throw new Error(message);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await res.json();
        const fallback = payload?.reply || payload?.response || payload?.error || 'Sorry, I could not find an answer.';
        const normalized = normalizeReply(currentInput, String(fallback));
        await ensureMinThinking();
        await animateReply(normalized);
        return;
      }

      if (!res.body) throw new Error('No chatbot stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';
      let pending = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          pending += chunk;
          const lines = pending.split('\n');
          pending = lines.pop() || '';
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            const payload = trimmedLine.startsWith('data:') ? trimmedLine.slice(5).trim() : trimmedLine;
            if (!payload || payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              if (json.token) fullText += json.token;
              else if (json.response) fullText += json.response;
            } catch { /* ignore malformed partial line */ }
          }
        }
      }

      if (pending.trim()) {
        const pendingPayload = pending.trim().startsWith('data:') ? pending.trim().slice(5).trim() : pending.trim();
        try {
          if (pendingPayload && pendingPayload !== '[DONE]') {
            const json = JSON.parse(pendingPayload);
            if (json.token) fullText += json.token;
            else if (json.response) fullText += json.response;
            else if (json.reply && !fullText) fullText = json.reply;
          }
        } catch { /* ignore trailing partial JSON */ }
      }

      if (!fullText) {
        await ensureMinThinking();
        await animateReply('I could not stream the response this time. Please click the chip again or retry in a moment.');
      } else {
        const normalized = normalizeReply(currentInput, fullText);
        await ensureMinThinking();
        await animateReply(normalized);
      }
    } catch (e) {
      const message = e instanceof Error
        ? (e.name === 'AbortError' ? 'The assistant timed out. Please try again.' : e.message)
        : 'Sorry, there was an error or the backend is unreachable.';
      setMessages((msgs) => {
        const updated = [...msgs];
        updated[updated.length - 1] = { sender: 'bot', text: message };
        return updated;
      });
    } finally {
      setLoading(false);
      setPendingContext(null);
    }
  };

  const contextLabel = useMemo(() => {
    const chip = activeContext?.chip?.trim();
    const pageTitle = activeContext?.pageTitle?.trim();
    if (!chip && !pageTitle) return null;
    if (chip && pageTitle) return `${pageTitle} • ${chip}`;
    return chip || pageTitle || null;
  }, [activeContext]);

  const normalizeReply = (query: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith(OOS_PREFIX) && !/https?:\/\//.test(trimmed)) {
      return `${OOS_PREFIX} But here's the Google search results of what you asked for:\nhttps://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    return text;
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((segment, index) => {
      if (/^https?:\/\//.test(segment)) {
        return (
          <a
            key={`${segment}-${index}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-amber-300 hover:text-amber-200 break-all"
          >
            {segment}
          </a>
        );
      }
      return <span key={`${segment}-${index}`}>{segment}</span>;
    });
  };

  const floatingPanelStyle: CSSProperties = {
    position: 'fixed',
    right: 'clamp(0.75rem, 2.5vw, 1.5rem)',
    bottom: 'clamp(5rem, 11vh, 6rem)',
    zIndex: 120,
    width: 'min(95vw, 20rem)',
  };

  const floatingBubbleStyle: CSSProperties = {
    position: 'fixed',
    right: 'clamp(0.75rem, 2.5vw, 1.5rem)',
    bottom: 'clamp(1rem, 2.5vh, 1.5rem)',
    zIndex: 120,
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* ── Floating chat button ── */}
      <div style={floatingBubbleStyle}>
        {/* Expanding pulse ring — only when closed */}
        <AnimatePresence>
          {!open && (
            <motion.span
              className="absolute inset-0 rounded-full bg-amber-500/35 pointer-events-none"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.75, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        <motion.button
          className="neural-control-btn-primary rounded-full shadow-xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl focus:outline-none relative"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open chatbot"
          aria-expanded={open}
          aria-controls="chatbot-panel"
          whileHover={{ scale: 1.12, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: open ? 12 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          <Lottie
            animationData={chatAnim}
            loop
            autoplay
            style={{ width: 36, height: 36, pointerEvents: 'none' }}
          />
        </motion.button>
      </div>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="chatbot-panel"
            role="dialog"
            aria-label="Chatbot assistant panel"
            aria-busy={loading}
            className="neural-card neural-glow-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ ...floatingPanelStyle, transformOrigin: 'bottom right' }}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-400/30 bg-gradient-to-r from-orange-700/90 to-amber-500/90">
              <div className="min-w-0">
                <span className="text-white font-bold tracking-wide text-sm">Jayakrishna Assistant</span>
                <AnimatePresence>
                  {contextLabel && (
                    <motion.div
                      className="text-[11px] text-amber-100/90 truncate mt-0.5"
                      title={`Context: ${contextLabel}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      Context: {contextLabel}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white text-xl font-bold hover:bg-white/20 transition-colors"
                aria-label="Close chatbot"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              >
                ×
              </motion.button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none"
              style={{ maxHeight: 340 }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    custom={msg.sender}
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                    layout="position"
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm max-w-[82%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-orange-700 to-amber-500 text-white rounded-br-sm'
                          : 'bg-white/[0.07] text-slate-200 border border-white/10 rounded-bl-sm'
                      } whitespace-pre-wrap`}
                    >
                      {msg.text ? renderMessageText(msg.text) : <ThinkingDots />}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-end border-t border-white/8 p-2 gap-2"
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            >
              <textarea
                ref={inputRef}
                className="neural-input flex-1 px-3 py-2 text-sm resize-none"
                value={input}
                rows={1}
                onChange={(e) => { typingAnimRef.current += 1; setInput(e.target.value); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={loading ? 'Keep typing while I respond…' : 'Ask about Jayakrishna…'}
                style={{ minHeight: 40, maxHeight: 180 }}
              />
              <motion.button
                type="submit"
                className="neural-control-btn-primary px-3 py-2 text-sm disabled:opacity-40 shrink-0"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 460, damping: 24 }}
              >
                {loading ? '…' : '↑'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
