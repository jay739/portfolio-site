'use client';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<null | string>(null);
  if (error) {
    return <div className="p-4 text-red-600">Chatbot error: {error}</div>;
  }
  return (
    <React.Suspense fallback={<div>Loading chatbot...</div>}>
      {React.cloneElement(children as any, { setError })}
    </React.Suspense>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! I am your personal assistant. Ask me anything about Jayakrishna Konda, his resume, cover letter, or social links.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    setLoading(true);
    setInput('');
    const botMsg: Message = { sender: 'bot', text: '' };
    setMessages((msgs) => [...msgs, botMsg]);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, stream: true }),
      });
      if (!res.ok || !res.body) throw new Error('Chatbot backend unreachable');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullText = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // Ollama streams NDJSON (one JSON per line)
          const chunk = decoder.decode(value, { stream: true });
          // Split in case multiple JSON objects in one chunk
          for (const line of chunk.split('\n')) {
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
            } catch {}
          }
        }
      }
      if (!fullText) {
        setMessages((msgs) => {
          const updated = [...msgs];
          updated[updated.length - 1] = { sender: 'bot', text: 'Sorry, I could not find an answer.' };
          return updated;
        });
      }
    } catch (e) {
      setMessages((msgs) => {
        const updated = [...msgs];
        updated[updated.length - 1] = { sender: 'bot', text: 'Sorry, there was an error or the backend is unreachable.' };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl focus:outline-none animate-pulse"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[95vw] bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-700 animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-slate-700 bg-blue-600 rounded-t-xl">
            <span className="text-white font-bold">Ask Jayakrishna's AI</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl font-bold">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 320 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-gray-100'}`}>
                  {msg.text}
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
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm bg-white dark:bg-slate-800"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button
              type="submit"
              className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
} 