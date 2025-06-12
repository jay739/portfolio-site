'use client';

import { useEffect, useState } from 'react';

export default function SmartScrollButton() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY < 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (atTop) {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-pink-500 transition-all focus:outline-none animate-bounce"
      aria-label={atTop ? 'Scroll down' : 'Back to top'}
      style={{ display: atTop || window.scrollY > 10 ? 'block' : 'none' }}
    >
      {atTop ? '↓' : '↑'}
    </button>
  );
} 