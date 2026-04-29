'use client';

import { useEffect, useState } from 'react';

export default function OnboardingHint({
  storageKey,
  title,
  body,
}: {
  storageKey: string;
  title: string;
  body: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(storageKey) === '1') return;
    setVisible(true);
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-200">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{body}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(storageKey, '1');
            setVisible(false);
          }}
          className="neural-control-btn-ghost text-xs"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
