'use client';

import React, { useState } from 'react';

export default function BlogSubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    setEmail('');
  };

  return (
    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubscribe}>
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={subscribed}
      />
      <button
        type="submit"
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        disabled={subscribed}
      >
        {subscribed ? 'Subscribed!' : 'Subscribe'}
      </button>
      {error && <div className="mt-2 text-red-200 text-sm w-full">{error}</div>}
      {subscribed && <div className="mt-2 text-green-200 text-sm w-full">Thank you for subscribing!</div>}
    </form>
  );
} 