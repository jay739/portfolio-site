'use client';

import { createContext, useContext, ReactNode } from 'react';

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
  const toggleSound = () => {};
  const playClick = () => {};
  const playSuccess = () => {};
  const playError = () => {};

  const value = {
    soundEnabled: false,
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