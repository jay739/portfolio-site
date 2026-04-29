 'use client';

import { usePathname } from 'next/navigation';
import ConstellationBackground from '@/components/backgrounds/ConstellationBackground';
import DataStreamBackground from '@/components/backgrounds/DataStreamBackground';
import NeuralLatticeBackground from '@/components/backgrounds/NeuralLatticeBackground';

export default function PageBackground() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  if (pathname.startsWith('/skills')) {
    return (
      <NeuralLatticeBackground
        opacity={0.66}
        density={1}
        lineColor="rgba(245,158,11,0.22)"
        nodeCoreColor="rgba(251,191,36,0.4)"
        glowColor="rgba(251,191,36,0.24)"
      />
    );
  }

  if (pathname.startsWith('/projects')) {
    return (
      <ConstellationBackground
        opacity={0.58}
        density={0.9}
        maxDistance={128}
        lineColor="rgba(251,191,36,0.18)"
        nodeColor="rgba(251,191,36,0.38)"
      />
    );
  }

  if (pathname.startsWith('/ai-tools')) {
    return (
      <DataStreamBackground
        opacity={0.56}
        lineCount={6}
        speedMultiplier={0.9}
        amplitudeMultiplier={0.85}
        primaryColor="rgba(245,158,11,0.24)"
        secondaryColor="rgba(251,191,36,0.16)"
      />
    );
  }

  if (pathname.startsWith('/ai-news')) {
    return (
      <DataStreamBackground
        opacity={0.46}
        lineCount={5}
        speedMultiplier={0.65}
        amplitudeMultiplier={0.6}
        primaryColor="rgba(251,191,36,0.2)"
        secondaryColor="rgba(255,237,213,0.12)"
      />
    );
  }

  if (pathname.startsWith('/homeserver')) {
    return (
      <NeuralLatticeBackground
        opacity={0.54}
        density={0.82}
        lineColor="rgba(245,158,11,0.18)"
        nodeCoreColor="rgba(251,191,36,0.34)"
        glowColor="rgba(251,191,36,0.2)"
      />
    );
  }

  if (pathname.startsWith('/impact')) {
    return (
      <ConstellationBackground
        opacity={0.5}
        density={0.78}
        maxDistance={116}
        lineColor="rgba(245,158,11,0.16)"
        nodeColor="rgba(251,191,36,0.32)"
      />
    );
  }

  if (pathname.startsWith('/timeline')) {
    return (
      <DataStreamBackground
        opacity={0.44}
        lineCount={4}
        speedMultiplier={0.55}
        amplitudeMultiplier={0.45}
        primaryColor="rgba(245,158,11,0.18)"
        secondaryColor="rgba(251,191,36,0.1)"
      />
    );
  }

  if (pathname.startsWith('/contact')) {
    return (
      <ConstellationBackground
        opacity={0.42}
        density={0.58}
        maxDistance={108}
        lineColor="rgba(251,191,36,0.14)"
        nodeColor="rgba(255,237,213,0.24)"
      />
    );
  }

  if (pathname.startsWith('/blog')) {
    return (
      <NeuralLatticeBackground
        opacity={0.48}
        density={0.72}
        lineColor="rgba(245,158,11,0.16)"
        nodeCoreColor="rgba(251,191,36,0.28)"
        glowColor="rgba(251,191,36,0.18)"
      />
    );
  }

  if (pathname.startsWith('/gallery')) {
    return (
      <ConstellationBackground
        opacity={0.48}
        density={0.7}
        maxDistance={124}
        lineColor="rgba(245,158,11,0.16)"
        nodeColor="rgba(251,191,36,0.3)"
      />
    );
  }

  return (
    <DataStreamBackground
      opacity={0.4}
      lineCount={4}
      speedMultiplier={0.6}
      amplitudeMultiplier={0.5}
      primaryColor="rgba(245,158,11,0.16)"
      secondaryColor="rgba(251,191,36,0.1)"
    />
  );
}
