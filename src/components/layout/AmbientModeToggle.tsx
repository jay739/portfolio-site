'use client';

import { useEffect, useState } from 'react';
import { CloudMoon } from 'lucide-react';
import { getAmbientMode, setAmbientMode } from '@/lib/site-ux';

export default function AmbientModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(getAmbientMode());
    sync();
    window.addEventListener('site-ux:ambient-mode', sync as EventListener);
    return () => window.removeEventListener('site-ux:ambient-mode', sync as EventListener);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setAmbientMode(!enabled)}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${enabled ? 'border-amber-400/60 text-amber-200 bg-amber-500/10' : 'border-slate-700/60 text-slate-300'}`}
      aria-pressed={enabled}
      title="Softens the site for lower-distraction browsing"
    >
      <CloudMoon className="mr-1 inline h-3.5 w-3.5" />
      {enabled ? 'Ambient On' : 'Ambient'}
    </button>
  );
}
