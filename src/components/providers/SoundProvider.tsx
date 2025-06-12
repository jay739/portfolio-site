'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import useSound from 'use-sound';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playError: () => void;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  toggleSound: () => {},
  playClick: () => {},
  playSuccess: () => {},
  playError: () => {},
});

export function useSoundContext() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sound hooks - these will only work on client side
  const [playClickSound] = useSound('/sounds/click.wav', { 
    volume: 0.3,
    soundEnabled: soundEnabled 
  });
  const [playSwitchOn] = useSound('/sounds/switch-on.wav', { 
    volume: 0.4,
    soundEnabled: soundEnabled 
  });
  const [playSwitchOff] = useSound('/sounds/switch-off.wav', { 
    volume: 0.4,
    soundEnabled: soundEnabled 
  });
  const [playSuccessSound] = useSound('/sounds/success.wav', { 
    volume: 0.3,
    soundEnabled: soundEnabled 
  });
  const [playErrorSound] = useSound('/sounds/error.wav', { 
    volume: 0.3,
    soundEnabled: soundEnabled 
  });

  // Load sound preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedSoundState = localStorage.getItem('portfolio-sound-enabled');
    if (savedSoundState !== null) {
      setSoundEnabled(JSON.parse(savedSoundState));
    } else {
      // Default to enabled for better UX
      setSoundEnabled(true);
      localStorage.setItem('portfolio-sound-enabled', 'true');
    }
  }, []);

  // Save to localStorage whenever sound state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('portfolio-sound-enabled', JSON.stringify(soundEnabled));
    }
  }, [soundEnabled, mounted]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    
    // Play immediate feedback sound
    if (newState) {
      playSwitchOn();
    } else {
      playSwitchOff();
    }
  };

  const playClick = () => {
    if (soundEnabled && mounted) {
      playClickSound();
    }
  };

  const playSuccess = () => {
    if (soundEnabled && mounted) {
      playSuccessSound();
    }
  };

  const playError = () => {
    if (soundEnabled && mounted) {
      playErrorSound();
    }
  };

  const value = {
    soundEnabled,
    toggleSound,
    playClick,
    playSuccess,
    playError,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
} 