'use client';

import { useRef, useState } from 'react';
import { useCsrf } from '@/hooks/useCsrf';

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');
  const { fetchWithCsrf } = useCsrf();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const form = formRef.current;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetchWithCsrf('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Message sent! I will get back to you soon.');
        form.reset();
      } else {
        setStatus('error');
        setMessage('Failed to send. Please try again later.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to send. Please try again later.');
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto my-20 p-8 sm:p-16 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl" id="contact">
      <h2 className="text-4xl font-bold mb-8 text-center">Contact Me</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Contact form">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <input id="name" name="name" type="text" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring" />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input id="email" name="email" type="email" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring" />
        </div>
        <div>
          <label htmlFor="subject" className="block mb-1 font-medium">Subject</label>
          <input id="subject" name="subject" type="text" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring" />
        </div>
        <div>
          <label htmlFor="message" className="block mb-1 font-medium">Message</label>
          <textarea id="message" name="message" required rows={5} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring" />
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50" disabled={status==='loading'}>
          {status === 'loading' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
      {message && (
        <div role="alert" className={`mt-4 text-center ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
      )}
    </section>
  );
} 