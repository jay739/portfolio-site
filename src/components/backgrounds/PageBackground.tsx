'use client';

import { usePathname } from 'next/navigation';
import NeuralLatticeBackground from '@/components/NeuralLatticeBackground';
import ParticleFieldBackground from './ParticleFieldBackground';
import DataStreamBackground from './DataStreamBackground';
import ConstellationBackground from './ConstellationBackground';

const PAGE_BACKGROUNDS: Record<string, React.ComponentType> = {
  '/impact': NeuralLatticeBackground,
  '/timeline': DataStreamBackground,
  '/skills': ConstellationBackground,
  '/projects': NeuralLatticeBackground,
  '/ai-tools': ParticleFieldBackground,
  '/homeserver': DataStreamBackground,
  '/ai-news': ParticleFieldBackground,
  '/contact': ConstellationBackground,
  '/blog': DataStreamBackground,
};

function getBackgroundForPath(pathname: string): React.ComponentType | null {
  // Exact match
  if (PAGE_BACKGROUNDS[pathname]) {
    return PAGE_BACKGROUNDS[pathname];
  }
  // Blog slug pages
  if (pathname.startsWith('/blog/')) {
    return DataStreamBackground;
  }
  return null;
}

export default function PageBackground() {
  const pathname = usePathname();

  // Home page has NeuralNetworkViz in Hero - no extra background
  if (pathname === '/') return null;

  const BackgroundComponent = getBackgroundForPath(pathname);

  if (!BackgroundComponent) {
    return <NeuralLatticeBackground />;
  }

  return <BackgroundComponent />;
}
