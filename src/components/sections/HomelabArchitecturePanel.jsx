"use client";

import { useEffect, useRef, useState } from "react";
import HomelabArchitectureV3 from "./HomelabArchitectureV3";

const DESIGN_WIDTH = 1780;
// Fit the HUD to the container width (no over-scale). The previous 1.12 boost
// rendered the stage ~12% wider than the wrapper, so it always overflowed and
// showed a stray horizontal scrollbar — even maximised, where the padded shell
// is still narrower than DESIGN_WIDTH. Fitting exactly removes that scrollbar.
const VISUAL_BOOST = 1.0;
// Below this scale the HUD text becomes unreadable; under ≈ 800 px wide we stop
// shrinking and let the container scroll horizontally (with a pan hint).
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
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);

  // Width of the scaled inner stage. When overflowing, this exceeds the
  // wrapper width and the outer overflow-x-auto exposes a horizontal scroll.
  const innerWidth = DESIGN_WIDTH * scale;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${overflowing ? "overflow-x-auto" : "overflow-x-hidden"} overflow-y-hidden rounded-[28px] border border-slate-300/50 bg-white/70 shadow-2xl shadow-slate-300/30 dark:border-cyan-400/15 dark:bg-slate-950/70 dark:shadow-cyan-950/20`}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: innerWidth,
          height: stageHeight,
          // Center when it fits; left-align when it overflows so the user
          // sees the "start" of the HUD before scrolling.
          marginLeft: overflowing ? 0 : "auto",
          marginRight: overflowing ? 0 : "auto",
        }}
      >
        <div
          ref={innerRef}
          style={{
            width: DESIGN_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
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
