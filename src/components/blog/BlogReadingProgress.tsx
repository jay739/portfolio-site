'use client';

import { useEffect, useState } from 'react';

export default function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(percent);
      setShowTopButton(scrollTop > 420);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <>
      <div className="fixed left-0 top-0 z-40 h-1 w-full bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-orange-700 via-orange-500 to-amber-300 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>

      {showTopButton && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 neural-control-btn text-xs"
          aria-label="Back to top"
        >
          Top
        </button>
      )}
    </>
  );
}
