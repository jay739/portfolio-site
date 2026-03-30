'use client';

import React, { useState } from 'react';

export default function BlogSubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
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
      setEmail('');
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
        disabled={subscribed || loading}
      >
        {subscribed ? 'Subscribed' : loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <div className="mt-2 text-red-600 dark:text-red-400 text-sm w-full">{error}</div>}
      {subscribed && <div className="mt-2 text-green-600 dark:text-green-400 text-sm w-full">You are subscribed. Thanks for joining.</div>}
    </form>
  );
} 