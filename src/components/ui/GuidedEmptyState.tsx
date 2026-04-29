'use client';

import Link from 'next/link';

export default function GuidedEmptyState({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  onSecondaryClick,
}: {
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/25 px-4 py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{description}</p>
      {(primaryHref || onSecondaryClick) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {primaryHref && primaryLabel && (
            <Link href={primaryHref} className="neural-control-btn-primary text-xs">
              {primaryLabel}
            </Link>
          )}
          {onSecondaryClick && secondaryLabel && (
            <button type="button" onClick={onSecondaryClick} className="neural-control-btn-ghost text-xs">
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
