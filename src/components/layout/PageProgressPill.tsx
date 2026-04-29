'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageProgressPill() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(scrollTop / max, 1) : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  const shouldShow =
    pathname.startsWith('/blog') ||
    pathname.startsWith('/impact') ||
    pathname.startsWith('/timeline') ||
    pathname.startsWith('/projects');

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-x-0 top-[68px] z-[110] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.55)] transition-[width] duration-150"
        style={{ width: `${Math.max(progress * 100, 2)}%` }}
      />
    </div>
  );
}
