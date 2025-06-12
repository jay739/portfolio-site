'use client';

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { fetchNetdataChart } from '@/lib/netdata';

function CircularProgress({ progress }: { progress: number }) {
  // progress: 0 to 1
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} className="mr-2">
      <circle
        stroke="#8884d8"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s linear' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-3 w-3 mr-1">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </span>
  );
}

export default function HomeServerStats() {
  const [memory, setMemory] = useState<any[]>([]);
  const [storage, setStorage] = useState<{ used: any[]; avail: any[]; free: any[]; total: any[] }>({ used: [], avail: [], free: [], total: [] });
  const [networkIn, setNetworkIn] = useState<any[]>([]);
  const [networkOut, setNetworkOut] = useState<any[]>([]);
  const [progress, setProgress] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const REFRESH_INTERVAL = 30000;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchAll = async () => {
      setMemory(await fetchNetdataChart({ service: 'memory', dimension: 'used', points: 20 }));
      const used = await fetchNetdataChart({ service: 'storage', dimension: 'used', points: 20 });
      const avail = await fetchNetdataChart({ service: 'storage', dimension: 'avail', points: 20 });
      const free = await fetchNetdataChart({ service: 'storage', dimension: 'free', points: 20 });
      const total = await fetchNetdataChart({ service: 'storage', dimension: 'total', points: 20 });
      setStorage({ used, avail, free, total });
      setNetworkIn(await fetchNetdataChart({ service: 'network', dimension: 'tcp', points: 20 }));
      setNetworkOut(await fetchNetdataChart({ service: 'network', dimension: 'udp', points: 20 }));
      lastUpdateRef.current = Date.now();
      setProgress(0);
    };
    fetchAll();
    interval = setInterval(fetchAll, REFRESH_INTERVAL);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastUpdateRef.current;
      setProgress(Math.min(elapsed / REFRESH_INTERVAL, 1));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  // Merge all storage dimensions for charting
  const storageData = storage.used.map((point, idx) => ({
    timestamp: point.timestamp,
    used: point.value,
    avail: storage.avail[idx]?.value ?? null,
    free: storage.free[idx]?.value ?? null,
    total: storage.total[idx]?.value ?? null,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto my-12 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="col-span-full flex items-center mb-4">
        <PulsingDot />
        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded mr-2">Live</span>
        <CircularProgress progress={progress} />
        <span className="text-xs text-gray-500">Auto-refreshes every 30s</span>
      </div>
      <div>
        <h3 className="mb-2 font-bold">Memory Usage (MB)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={memory} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25 }} />
            <YAxis tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'MB', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#888' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorMem)" name="Used" isAnimationActive animationDuration={800} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 font-bold">Root Storage Usage (GiB)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={storageData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7300" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#ff7300" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#387908" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#387908" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C49F" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25 }} />
            <YAxis tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'GiB', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#888' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <Area type="monotone" dataKey="used" stroke="#ff7300" fillOpacity={1} fill="url(#colorUsed)" name="Used" isAnimationActive animationDuration={800} strokeWidth={2} />
            <Area type="monotone" dataKey="avail" stroke="#387908" fillOpacity={1} fill="url(#colorAvail)" name="Available" isAnimationActive animationDuration={800} strokeWidth={2} />
            <Area type="monotone" dataKey="free" stroke="#00C49F" fillOpacity={1} fill="url(#colorFree)" name="Free" isAnimationActive animationDuration={800} strokeWidth={2} />
            <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" name="Total" isAnimationActive animationDuration={800} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-2">
          <b>Note:</b> <span>"Available" is space available to non-root users. "Free" is total free space. "Used" may appear higher than "Available" due to reserved blocks and filesystem overhead.</span>
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-bold">Network TCP Packets (packets/s)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={networkIn} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorTCP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25 }} />
            <YAxis tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Packets/s', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#888' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <Area type="monotone" dataKey="value" stroke="#0088FE" fillOpacity={1} fill="url(#colorTCP)" name="TCP" isAnimationActive animationDuration={800} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="mb-2 font-bold">Network UDP Packets (packets/s)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={networkOut} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id="colorUDP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C49F" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25 }} />
            <YAxis tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Packets/s', angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#888' }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <Area type="monotone" dataKey="value" stroke="#00C49F" fillOpacity={1} fill="url(#colorUDP)" name="UDP" isAnimationActive animationDuration={800} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 