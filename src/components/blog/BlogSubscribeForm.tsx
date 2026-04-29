'use client';

import React, { useEffect, useState } from 'react';
import { useCsrf } from '@/hooks/useCsrf';

const BLOG_SUBSCRIPTION_SUCCESS_KEY = 'blog_subscription_success_v1';

export default function BlogSubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribedAt, setSubscribedAt] = useState<number | null>(null);
  const { csrfToken, fetchWithCsrf } = useCsrf();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(BLOG_SUBSCRIPTION_SUCCESS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { email?: string; subscribedAt?: number };
      if (parsed.subscribedAt && Date.now() - parsed.subscribedAt < 7 * 24 * 60 * 60 * 1000) {
        setSubscribed(true);
        setSubscribedAt(parsed.subscribedAt);
        setEmail(parsed.email ?? '');
      } else {
        window.localStorage.removeItem(BLOG_SUBSCRIPTION_SUCCESS_KEY);
      }
    } catch {
      window.localStorage.removeItem(BLOG_SUBSCRIPTION_SUCCESS_KEY);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithCsrf('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || 'Failed to subscribe. Please try again.');
        return;
      }

      setSubscribed(true);
      const successAt = Date.now();
      setSubscribedAt(successAt);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          BLOG_SUBSCRIPTION_SUCCESS_KEY,
          JSON.stringify({ email, subscribedAt: successAt })
        );
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubscribe}>
      <input
        type="email"
        placeholder="Email address"
        className="neural-input flex-1 px-4 py-3"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={subscribed || loading}
      />
      <button
        type="submit"
        className="neural-control-btn-primary px-6 py-3 disabled:opacity-70"
        disabled={subscribed || loading || !csrfToken}
      >
        {subscribed ? 'Subscribed' : loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <div className="mt-2 text-red-600 dark:text-red-400 text-sm w-full">{error}</div>}
      {subscribed && (
        <div className="mt-2 text-green-600 dark:text-green-400 text-sm w-full">
          You are subscribed. Thanks for joining.
          {subscribedAt && <span className="ml-1 opacity-80">Saved on this device at {new Date(subscribedAt).toLocaleTimeString()}.</span>}
        </div>
      )}
    </form>
  );
}
