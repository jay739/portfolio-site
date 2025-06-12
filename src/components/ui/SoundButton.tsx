'use client';

import React, { forwardRef } from 'react';
import { useClickSound } from '@/lib/hooks/useClickSound';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  as?: 'button' | 'div' | 'a';
  href?: string;
  target?: string;
  rel?: string;
}

const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ children, onClick, as = 'button', className = '', ...props }, ref) => {
    const { playClick, soundEnabled } = useClickSound();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play click sound
      if (soundEnabled) {
        playClick();
      }
      
      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    };

    if (as === 'a') {
      return (
        <a
          {...(props as any)}
          className={className}
          onClick={handleClick as any}
        >
          {children}
        </a>
      );
    }

    if (as === 'div') {
      return (
        <div
          {...(props as any)}
          className={className}
          onClick={handleClick as any}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick(e as any);
            }
          }}
        >
          {children}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        {...props}
        className={className}
        onClick={handleClick}
      >
        {children}
      </button>
    );
  }
);

SoundButton.displayName = 'SoundButton';

export default SoundButton; 