'use client';

import { useEffect, useRef, useState } from 'react';
import HomelabArchitectureV3 from './HomelabArchitectureV3';

const DESIGN_WIDTH = 1780;
const VISUAL_BOOST = 1.12;

export default function HomelabArchitecturePanel() {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [stageHeight, setStageHeight] = useState(1180);

  useEffect(() => {
    const calc = () => {
      const wrap = wrapRef.current;
      const inner = innerRef.current;
      if (!wrap || !inner) return;
      const fitScale = Math.max(0.18, wrap.clientWidth / DESIGN_WIDTH);
      const nextScale = Math.min(1, fitScale * VISUAL_BOOST);
      setScale(nextScale);
      setStageHeight(inner.scrollHeight * nextScale);
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

  return (
    <div ref={wrapRef} className="w-full overflow-x-auto overflow-y-hidden rounded-[28px] border border-cyan-400/15 bg-slate-950/70 shadow-2xl shadow-cyan-950/20">
      <div
        className="relative mx-auto overflow-hidden"
        style={{ width: Math.min(DESIGN_WIDTH, DESIGN_WIDTH * scale), height: stageHeight }}
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
    </div>
  );
}
