'use client';

import { ReactNode } from 'react';

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export default function FilterChip({ active, onClick, children, className = '' }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${active ? 'neural-pill' : 'neural-control-btn-ghost'} rounded-full text-sm font-medium ${className}`}
    >
      {children}
    </button>
  );
}
