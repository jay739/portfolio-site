"use client";
import { useEffect, useState } from "react";

export default function TimeInSecondsBar() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !now) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateString = now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="w-full flex flex-col items-center justify-center py-2 z-30">
      <div className="px-6 py-2 rounded-xl neural-card-soft border border-slate-600/55 shadow text-lg font-mono text-cyan-200 backdrop-blur mb-1">
        <span>{timeString}</span>
      </div>
      <div className="text-xs text-slate-400 font-mono">{dateString}</div>
    </div>
  );
} 