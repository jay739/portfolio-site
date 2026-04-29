import { useEffect } from 'react';

/**
 * Fires `callback` when the Escape key is pressed.
 * Only active while `active` is true (default: true).
 */
export function useEscapeKey(callback: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') callback();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [callback, active]);
}
