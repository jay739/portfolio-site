'use client';
import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const OOS_PREFIX =
  'I am confined to answer details about Jayakrishna; such questions are out of my scope of answering.';
const REQUEST_TIMEOUT_MS = 25000;

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi, I am Jayakrishna\'s assistant. Ask about his profile, resume, experience, projects, or social links.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onAsk = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message?.trim();
      setOpen(true);
      if (message) {
        setInput(message);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
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

  const sendMessage = async () => {
    const currentInput = input.trim();
    if (!currentInput || loading) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: currentInput }]);
    setLoading(true);
    setInput('');
    const botMsg: Message = { sender: 'bot', text: '' };
    setMessages((msgs) => [...msgs, botMsg]);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, stream: true }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        let message = 'Chatbot backend unreachable';
        try {
          const payload = await res.json();
          if (payload?.error) message = payload.error;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await res.json();
        const fallback =
          payload?.reply ||
          payload?.response ||
          payload?.error ||
          'Sorry, I could not find an answer.';
        const normalized = normalizeReply(currentInput, String(fallback));
        setMessages((msgs) => {
          const updated = [...msgs];
          updated[updated.length - 1] = { sender: 'bot', text: normalized };
          return updated;
        });
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
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                fullText += json.response;
                setMessages((msgs) => {
                  // Update the last bot message
                  const updated = [...msgs];
                  updated[updated.length - 1] = { sender: 'bot', text: fullText };
                  return updated;
                });
              }
            } catch {
              // ignore malformed partial line; buffer handles incomplete JSON
            }
          }
        }
      }

      if (pending.trim()) {
        try {
          const json = JSON.parse(pending.trim());
          if (json.response) {
            fullText += json.response;
          } else if (json.reply && !fullText) {
            fullText = json.reply;
          }
        } catch {
          // ignore trailing partial JSON
        }
      }

      if (!fullText) {
        setMessages((msgs) => {
          const updated = [...msgs];
          updated[updated.length - 1] = { sender: 'bot', text: 'Sorry, I could not find an answer.' };
          return updated;
        });
      } else {
        const normalized = normalizeReply(currentInput, fullText);
        if (normalized !== fullText) {
          setMessages((msgs) => {
            const updated = [...msgs];
            updated[updated.length - 1] = { sender: 'bot', text: normalized };
            return updated;
          });
        }
      }
    } catch (e) {
      const message = e instanceof Error
        ? (e.name === 'AbortError'
          ? 'The assistant timed out. Please try again.'
          : e.message)
        : 'Sorry, there was an error or the backend is unreachable.';
      setMessages((msgs) => {
        const updated = [...msgs];
        updated[updated.length - 1] = { sender: 'bot', text: message };
        return updated;
      });
    } finally {
      setLoading(false);
    }
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

  const panelClass = `neural-card neural-glow-border rounded-xl shadow-2xl flex flex-col transform transition-all duration-400 ease-out ${
    open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
  }`;

  const normalizeReply = (query: string, text: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith(OOS_PREFIX) && !/https?:\/\//.test(trimmed)) {
      return `${OOS_PREFIX} But here's the Google search results of what you asked for:\nhttps://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    return text;
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = text.split(urlRegex);

    return segments.map((segment, index) => {
      if (/^https?:\/\//.test(segment)) {
        return (
          <a
            key={`${segment}-${index}`}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-300 break-all"
          >
            {segment}
          </a>
        );
      }
      return <span key={`${segment}-${index}`}>{segment}</span>;
    });
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        className="neural-control-btn-primary rounded-full shadow-lg w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl focus:outline-none animate-pulse"
        style={floatingBubbleStyle}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
        aria-expanded={open}
        aria-controls="chatbot-panel"
      >
        💬
      </button>
      <div className={panelClass} style={floatingPanelStyle} id="chatbot-panel" role="dialog" aria-label="Chatbot assistant panel" aria-busy={loading}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-violet-400/30 bg-gradient-to-r from-violet-600/90 to-blue-600/90 rounded-t-xl">
          <span className="text-white font-bold tracking-wide">Jayakrishna Assistant</span>
          <button
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white text-xl font-bold transition-colors hover:bg-white/20 hover:text-violet-50"
            aria-label="Close chatbot"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 340 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                  : 'bg-white/70 dark:bg-slate-700/70 text-gray-900 dark:text-gray-100 border border-violet-300/20'
              }`}>
                {msg.text ? (
                  renderMessageText(msg.text)
                ) : (
                  <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-300">
                    <span className="inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                    <span className="text-xs font-semibold tracking-wide">Thinking...</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="flex items-center border-t border-gray-200 dark:border-slate-700 p-2"
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <input
            ref={inputRef}
            className="neural-input flex-1 px-3 py-2"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={loading ? 'Keep typing while I respond...' : 'Ask about Jayakrishna...'}
          />
          <button
            type="submit"
            className="ml-2 neural-control-btn-primary px-3 py-2 text-sm disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? 'Waiting...' : 'Send'}
          </button>
        </form>
      </div>
    </>
    ,
    document.body
  );
} 