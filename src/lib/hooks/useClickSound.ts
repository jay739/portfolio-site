import { useCallback } from 'react';
import { useSoundContext } from '@/components/providers/SoundProvider';

export function useClickSound() {
  const { playClick, soundEnabled } = useSoundContext();

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
  }, [playClick, soundEnabled]);

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
  }, [playClick, soundEnabled]);

  return {
    handleClick,
    addClickSound,
    playClick,
    soundEnabled
  };
} 