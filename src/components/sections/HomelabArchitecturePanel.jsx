'use client';

import { useEffect, useRef, useState } from 'react';
import HomelabArchitectureV3 from './HomelabArchitectureV3';

const DESIGN_WIDTH = 1780;
const VISUAL_BOOST = 1.12;
// Below this scale the HUD text becomes unreadable. When the viewport is
// narrower than DESIGN_WIDTH * MIN_SCALE / VISUAL_BOOST (≈ 715 px), we stop
// shrinking and let the outer container scroll horizontally instead.
const MIN_SCALE = 0.45;

export default function HomelabArchitecturePanel() {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [stageHeight, setStageHeight] = useState(1180);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const calc = () => {
      const wrap = wrapRef.current;
      const inner = innerRef.current;
      if (!wrap || !inner) return;
      const rawFit = wrap.clientWidth / DESIGN_WIDTH;
      const boosted = rawFit * VISUAL_BOOST;
      const nextScale = Math.min(1, Math.max(MIN_SCALE, boosted));
      setScale(nextScale);
      setStageHeight(inner.scrollHeight * nextScale);
      // When boosted < MIN_SCALE, the inner stage is wider than the wrapper
      // and we expose horizontal scrolling with a visible hint.
      setOverflowing(boosted < MIN_SCALE);
    };

    calc();
    const ro = new ResizeObserver(calc);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener('resize', calc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, []);

  // Width of the scaled inner stage. When overflowing, this exceeds the
  // wrapper width and the outer overflow-x-auto exposes a horizontal scroll.
  const innerWidth = DESIGN_WIDTH * scale;

  return (
    <div ref={wrapRef} className="relative w-full overflow-x-auto overflow-y-hidden rounded-[28px] border border-slate-300/50 bg-white/70 shadow-2xl shadow-slate-300/30 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:shadow-cyan-950/20">
      <div
        className="relative overflow-hidden"
        style={{
          width: innerWidth,
          height: stageHeight,
          // Center when it fits; left-align when it overflows so the user
          // sees the "start" of the HUD before scrolling.
          marginLeft: overflowing ? 0 : 'auto',
          marginRight: overflowing ? 0 : 'auto',
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: DESIGN_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <HomelabArchitectureV3 />
        </div>
      </div>
      {overflowing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-200 backdrop-blur-sm dark:bg-slate-950/80 dark:text-slate-300">
            ← swipe to pan →
          </span>
        </div>
      )}
    </div>
  );
}
