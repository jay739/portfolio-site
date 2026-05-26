'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import ConstellationBackground from '@/components/backgrounds/ConstellationBackground';
import DataStreamBackground from '@/components/backgrounds/DataStreamBackground';
import NeuralLatticeBackground from '@/components/backgrounds/NeuralLatticeBackground';

export default function PageBackground() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === '/') return null;

  // Theme-aware accent palette. Dark = glowing amber on black; light = a
  // deeper amber that stays legible against a light surface (a low-opacity
  // light amber would simply disappear on white).
  const isLight = mounted && resolvedTheme === 'light';
  const c = isLight
    ? {
        line: 'rgba(180,83,9,0.32)',
        node: 'rgba(154,52,18,0.5)',
        glow: 'rgba(217,119,6,0.30)',
      }
    : {
        line: 'rgba(245,158,11,0.2)',
        node: 'rgba(251,191,36,0.38)',
        glow: 'rgba(251,191,36,0.24)',
      };

  if (pathname.startsWith('/skills')) {
    return (
      <NeuralLatticeBackground
        opacity={0.66}
        density={1}
        lineColor={c.line}
        nodeCoreColor={c.node}
        glowColor={c.glow}
      />
    );
  }

  if (pathname.startsWith('/projects')) {
    return (
      <ConstellationBackground
        opacity={0.58}
        density={0.9}
        maxDistance={128}
        lineColor={c.line}
        nodeColor={c.node}
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
        primaryColor={c.line}
        secondaryColor={c.glow}
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
        primaryColor={c.line}
        secondaryColor={c.glow}
      />
    );
  }

  if (pathname.startsWith('/homeserver')) {
    return (
      <NeuralLatticeBackground
        opacity={0.54}
        density={0.82}
        lineColor={c.line}
        nodeCoreColor={c.node}
        glowColor={c.glow}
      />
    );
  }

  if (pathname.startsWith('/impact')) {
    return (
      <ConstellationBackground
        opacity={0.5}
        density={0.78}
        maxDistance={116}
        lineColor={c.line}
        nodeColor={c.node}
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
        primaryColor={c.line}
        secondaryColor={c.glow}
      />
    );
  }

  if (pathname.startsWith('/contact')) {
    return (
      <ConstellationBackground
        opacity={0.42}
        density={0.58}
        maxDistance={108}
        lineColor={c.line}
        nodeColor={c.node}
      />
    );
  }

  if (pathname.startsWith('/blog')) {
    return (
      <NeuralLatticeBackground
        opacity={0.48}
        density={0.72}
        lineColor={c.line}
        nodeCoreColor={c.node}
        glowColor={c.glow}
      />
    );
  }

  if (pathname.startsWith('/gallery')) {
    return (
      <ConstellationBackground
        opacity={0.48}
        density={0.7}
        maxDistance={124}
        lineColor={c.line}
        nodeColor={c.node}
      />
    );
  }

  return (
    <DataStreamBackground
      opacity={0.4}
      lineCount={4}
      speedMultiplier={0.6}
      amplitudeMultiplier={0.5}
      primaryColor={c.line}
      secondaryColor={c.glow}
    />
  );
}
