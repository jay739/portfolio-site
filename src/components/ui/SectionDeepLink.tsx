'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { pushSiteFeedback } from '@/lib/site-ux';
import { copyToClipboard } from '@/lib/clipboard';

export default function SectionDeepLink({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        const ok = await copyToClipboard(url);
        if (!ok) {
          pushSiteFeedback('Copy unavailable in this context.', 'info');
          return;
        }
        setCopied(true);
        pushSiteFeedback(`${title} link copied.`, 'success');
        window.setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 px-3 py-1 text-[11px] text-slate-400 transition hover:border-amber-400/25 hover:text-amber-200"
      aria-label={`Copy link to ${title}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy section link'}
    </button>
  );
}
