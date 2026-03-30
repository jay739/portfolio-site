'use client';

import { useEffect, useState } from 'react';

export default function SmartScrollButton() {
  const [atTop, setAtTop] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isTop = window.scrollY < 10;
      setAtTop(isTop);
      setVisible(isTop || window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-full neural-control-btn-primary shadow-lg focus:outline-none animate-bounce"
      aria-label={atTop ? 'Scroll down' : 'Back to top'}
      style={{ display: visible ? 'block' : 'none' }}
    >
      {atTop ? '↓' : '↑'}
    </button>
  );
} 