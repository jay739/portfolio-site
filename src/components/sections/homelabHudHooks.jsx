// homelab-hooks.jsx — shared React hooks + tiny components used by all 3 variants
'use client';

import React from 'react';

// useTick — re-renders every `ms`, returns a counter
function useTick(ms = 1000) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setN(x => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return n;
}

// useJitter — returns a value that drifts ±jitter around base, updated every ms
function useJitter(base, jitter, ms = 2000) {
  const [v, setV] = React.useState(base);
  React.useEffect(() => {
    const id = setInterval(() => {
      setV(base + (Math.random() - 0.5) * 2 * jitter);
    }, ms);
    return () => clearInterval(id);
  }, [base, jitter, ms]);
  return v;
}

// useClock — formatted clock string, refreshes each second
function useClock(format = 'hms') {
  useTick(1000);
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  if (format === 'hms') return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (format === 'iso') return d.toISOString().replace('T', ' ').slice(0, 19);
  if (format === 'date') return d.toISOString().slice(0, 10);
  return d.toLocaleTimeString();
}

// useCount — counter that ticks up by random small amounts (e.g. requests served)
function useCount(start, perSec = 3) {
  const [v, setV] = React.useState(start);
  React.useEffect(() => {
    const id = setInterval(() => {
      setV(x => x + Math.floor(Math.random() * perSec * 2));
    }, 1000);
    return () => clearInterval(id);
  }, [perSec]);
  return v;
}

// Accent color resolver
const ACCENT = {
  red:    '#e63946',
  blue:   '#4a9eff',
  green:  '#3fcf8e',
  purple: '#b48ce8',
  amber:  '#f4a261',
  orange: '#e67e22',
  yellow: '#f4d35e',
  teal:   '#34d1bf',
  gray:   '#8b8579',
  cyan:   '#5ed3f3',
};

// Status dot
function Dot({ s = 'g', size = 6, glow = true }) {
  const c = s === 'g' ? '#3fcf8e' : s === 'a' ? '#f4a261' : s === 'r' ? '#e63946' : '#5a5a5a';
  const anim = s === 'g' ? 'hl-pulse-g 2.4s ease-in-out infinite'
            : s === 'a' ? 'hl-pulse-a 0.9s ease-in-out infinite'
            : s === 'r' ? 'hl-pulse-r 1.2s ease-in-out infinite' : 'none';
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: c, boxShadow: glow ? `0 0 ${size}px ${c}` : 'none',
      animation: anim, flexShrink: 0,
    }} />
  );
}

// Inject pulse keyframes once
if (typeof document !== 'undefined' && !document.getElementById('hl-keyframes')) {
  const s = document.createElement('style');
  s.id = 'hl-keyframes';
  s.textContent = `
    @keyframes hl-pulse-g { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
    @keyframes hl-pulse-a { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
    @keyframes hl-pulse-r { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
    @keyframes hl-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
    @keyframes hl-flicker { 0%,100% { opacity: 1; } 8% { opacity: 0.85; } 12% { opacity: 1; } }
    @keyframes hl-dash-march { to { stroke-dashoffset: -20; } }
    @keyframes hl-glow-pulse { 0%,100% { filter: drop-shadow(0 0 8px currentColor); } 50% { filter: drop-shadow(0 0 18px currentColor); } }
    @keyframes hl-spin { to { transform: rotate(360deg); } }
    @keyframes hl-blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
    @keyframes hl-bar-shift { 0% { background-position: 0 0; } 100% { background-position: 14px 0; } }
    @keyframes hl-radar { 0% { transform: rotate(0deg); opacity: 0.7; } 100% { transform: rotate(360deg); opacity: 0.7; } }
    @keyframes hl-fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(s);
}

// Static-noise overlay component
function Noise({ opacity = 0.04 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 100,
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
      )}")`,
      mixBlendMode: 'overlay',
    }} />
  );
}

// Scanlines
function Scanlines({ opacity = 0.06 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity, zIndex: 99,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)',
      mixBlendMode: 'overlay',
    }} />
  );
}

// Vignette
function Vignette({ strength = 0.55 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 98,
      background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
    }} />
  );
}

export { useTick, useJitter, useClock, useCount, ACCENT, Dot, Noise, Scanlines, Vignette };
