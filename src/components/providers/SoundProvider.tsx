'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

const SoundContext = createContext({ on: true, toggle: () => {} });

export function useSound() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);
  const toggle = () => setOn((v) => !v);
  return (
    <SoundContext.Provider value={{ on, toggle }}>
      {children}
    </SoundContext.Provider>
  );
} 