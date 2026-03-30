import { useCallback } from 'react';

export function useClickSound() {
  const playClick = useCallback(() => {
    // Sound feature removed globally.
  }, []);
  const soundEnabled = false;

  const handleClick = useCallback((originalHandler?: () => void) => {
    return (e: React.MouseEvent) => {
      // Play click sound if enabled
      if (soundEnabled) {
        playClick();
      }
      
      // Call original handler if provided
      if (originalHandler) {
        originalHandler();
      }
    };
  }, []);

  const addClickSound = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    const clickHandler = (e: Event) => {
      if (soundEnabled) {
        playClick();
      }
    };

    element.addEventListener('click', clickHandler);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('click', clickHandler);
    };
  }, []);

  return {
    handleClick,
    addClickSound,
    playClick,
    soundEnabled
  };
} 