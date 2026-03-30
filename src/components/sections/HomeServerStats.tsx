'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { fetchNetdataMetrics } from '@/lib/netdata';
import { motion } from 'framer-motion';

const SERVICE_CHARTS = {
  'vaultwarden': { 
    title: 'Vaultwarden',
    icon: '🔐',
    description: 'Password manager',
    url: 'https://github.com/dani-garcia/vaultwarden'
  },
  'redis': {
    title: 'Redis',
    icon: '🚀',
    description: 'In-memory data store',
    url: 'https://redis.io/'
  },
  'home-assistant': {
    title: 'Home Assistant',
    icon: '🏠',
    description: 'Home automation',
    url: 'https://www.home-assistant.io/'
  },
  'qbittorrent': {
    title: 'qBittorrent',
    icon: '📥',
    description: 'Torrent client',
    url: 'https://www.qbittorrent.org/'
  },
  'portainer': {
    title: 'Portainer',
    icon: '🐳',
    description: 'Container management',
    url: 'https://www.portainer.io/'
  },
  'nginx': {
    title: 'Nginx',
    icon: '🌐',
    description: 'Web server & reverse proxy',
    url: 'https://nginx.org/'
  },
  'jellyfin': {
    title: 'Jellyfin',
    icon: '🎬',
    description: 'Media server',
    url: 'https://jellyfin.org/'
  },
  'calibre': {
    title: 'Calibre',
    icon: '📚',
    description: 'E-book management',
    url: 'https://calibre-ebook.com/'
  },
  'navidrome': {
    title: 'Navidrome',
    icon: '🎵',
    description: 'Music streaming server',
    url: 'https://www.navidrome.org/'
  },
  'pi-hole': {
    title: 'Pi-hole',
    icon: '🛡️',
    description: 'Network-wide ad blocking',
    url: 'https://pi-hole.net/'
  },
  'drupal': {
    title: 'Drupal',
    icon: '💧',
    description: 'CMS',
    url: 'https://www.drupal.org/'
  },
  'sonarr': {
    title: 'Sonarr',
    icon: '📺',
    description: 'TV series management',
    url: 'https://sonarr.tv/'
  },
  'radarr': {
    title: 'Radarr',
    icon: '🎥',
    description: 'Movie management',
    url: 'https://radarr.video/'
  },
  'grafana': {
    title: 'Grafana',
    icon: '📊',
    description: 'Monitoring & analytics',
    url: 'https://grafana.com/'
  },
  'lidarr': {
    title: 'Lidarr',
    icon: '🎼',
    description: 'Music management',
    url: 'https://lidarr.audio/'
  },
  'watchtower': {
    title: 'Watchtower',
    icon: '🔄',
    description: 'Container updates',
    url: 'https://containrrr.dev/watchtower/'
  },
  'duckdns': {
    title: 'DuckDNS',
    icon: '🦆',
    description: 'Dynamic DNS',
    url: 'https://www.duckdns.org/'
  },
  'nextcloud': {
    title: 'Nextcloud',
    icon: '☁️',
    description: 'File hosting',
    url: 'https://nextcloud.com/'
  },
  'mariadb': {
    title: 'MariaDB',
    icon: '🗄️',
    description: 'Database',
    url: 'https://mariadb.org/'
  },
  'uptime-kuma': {
    title: 'Uptime Kuma',
    icon: '📈',
    description: 'Uptime monitoring',
    url: 'https://github.com/louislam/uptime-kuma'
  }
};

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
  const [storage, setStorage] = useState<{ used: any[]; avail: any[] }>({ used: [], avail: [] });
  const [networkIn, setNetworkIn] = useState<any[]>([]);
  const [networkOut, setNetworkOut] = useState<any[]>([]);
  const [progress, setProgress] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGoodUpdate, setLastGoodUpdate] = useState<number | null>(null);
  const [serviceQuery, setServiceQuery] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const REFRESH_INTERVAL = 30000;

  const fetchData = async (background = false) => {
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
      setError(null);
      setWarning(null);
    }

    try {
      const [memoryResult, storageResult, networkResult] = await Promise.allSettled([
        fetchNetdataMetrics('memory', 'used', 0, 0, 20),
        Promise.all([
          fetchNetdataMetrics('storage', 'used', 0, 0, 20),
          fetchNetdataMetrics('storage', 'avail', 0, 0, 20),
        ]),
        Promise.all([
          fetchNetdataMetrics('network', 'tcp', 0, 0, 20),
          fetchNetdataMetrics('network', 'udp', 0, 0, 20),
        ]),
      ]);

      let successfulSources = 0;

      if (memoryResult.status === 'fulfilled') {
        successfulSources += 1;
        setMemory(memoryResult.value.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })));
      }

      if (storageResult.status === 'fulfilled') {
        successfulSources += 1;
        const [used, avail] = storageResult.value;
        setStorage({
          used: used.map(entry => ({
            timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
            value: entry.value,
          })),
          avail: avail.map(entry => ({
            timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
            value: entry.value,
          })),
        });
      }

      if (networkResult.status === 'fulfilled') {
        successfulSources += 1;
        const [networkInData, networkOutData] = networkResult.value;
        setNetworkIn(networkInData.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })));
        setNetworkOut(networkOutData.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })));
      }

      if (successfulSources > 0) {
        const now = Date.now();
        lastUpdateRef.current = now;
        setLastGoodUpdate(now);
        setProgress(0);
        setError(null);
        setWarning(
          successfulSources < 3
            ? 'Some live sources are temporarily unavailable. Showing partial metrics.'
            : null
        );
      } else {
        setError('Unable to fetch server stats. Is Netdata running?');
        setWarning(lastGoodUpdate ? 'Showing the last available snapshot.' : null);
      }
    } catch {
      setError('Unable to fetch server stats. Is Netdata running?');
      setWarning(lastGoodUpdate ? 'Showing the last available snapshot.' : null);
    } finally {
      if (background) {
        setIsRefreshing(false);
      } else {
        setIsInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), REFRESH_INTERVAL);
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
  }));

  const latestStats = useMemo(() => {
    const latestMemory = memory[memory.length - 1]?.value ?? 0;
    const latestUsed = storage.used[storage.used.length - 1]?.value ?? 0;
    const latestAvail = storage.avail[storage.avail.length - 1]?.value ?? 0;
    const latestTcp = networkIn[networkIn.length - 1]?.value ?? 0;
    const latestUdp = networkOut[networkOut.length - 1]?.value ?? 0;
    const storageTotal = latestUsed + latestAvail;
    const storageUsedPercent = storageTotal > 0 ? (latestUsed / storageTotal) * 100 : 0;

    return {
      latestMemory,
      latestTcp,
      latestUdp,
      storageUsedPercent,
    };
  }, [memory, storage.used, storage.avail, networkIn, networkOut]);

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    return Object.entries(SERVICE_CHARTS).filter(([_, info]) => {
      if (!q) return true;
      return info.title.toLowerCase().includes(q) || info.description.toLowerCase().includes(q);
    });
  }, [serviceQuery]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4" />
        <span className="text-cyan-300">Loading server stats...</span>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background/fadeout effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full neural-card neural-glow-border rounded-2xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🏠</span>
            <h2 className="neural-section-title">Home Server Infrastructure</h2>
          </div>
          <p className="neural-section-copy mb-3">
            My self-hosted home lab running on Docker containers, providing a complete infrastructure stack for development, 
            media management, productivity, and automation. All services are containerized and monitored with real-time metrics, 
            demonstrating practical DevOps skills and system administration expertise.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Memory</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestMemory.toFixed(0)} MB</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Storage Used</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.storageUsedPercent.toFixed(1)}%</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">TCP</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestTcp.toFixed(1)} pkt/s</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">UDP</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestUdp.toFixed(1)} pkt/s</p>
            </div>
          </div>
          {(warning || lastGoodUpdate) && (
            <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/20 p-3 text-sm text-amber-900 dark:text-amber-100">
              {warning && <p>{warning}</p>}
              {lastGoodUpdate && (
                <p className="text-xs opacity-90 mt-1">
                  Last successful refresh: {new Date(lastGoodUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
          <div className="mb-6">
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Filter services (e.g., media, proxy, monitoring)"
              className="neural-input w-full max-w-md px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map(([service, info]) => (
              <motion.a
                key={service}
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.15, delay: 0 } }}
                className="transform transition-all duration-300 neural-card-soft rounded-2xl p-6 flex flex-col items-center fade-in tilt glow-hover border border-slate-600/55"
              >
                <div className="flex items-center gap-3 mb-2">
                  <PulsingDot />
                  <span className="text-2xl">{info.icon}</span>
                  <span className="font-medium text-slate-100 group-hover:text-primary transition-colors">
                    {info.title}
                  </span>
                </div>
                <span className="neural-statement-chip text-center">{info.description}</span>
              </motion.a>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="col-span-full flex items-center mb-4">
              <span className="neural-pill-intro text-xs mr-2">Live</span>
              <CircularProgress progress={progress} />
              <span className="text-xs text-slate-400">Auto-refreshes every 30s</span>
              {isRefreshing && (
                <span className="ml-2 inline-flex items-center text-xs text-cyan-300">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                  Updating...
                </span>
              )}
              <button
                type="button"
                onClick={() => { void fetchData(false); }}
                className="ml-auto neural-control-btn text-xs"
              >
                Refresh now
              </button>
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Memory Usage (MB)</h3>
              {error && memory.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Memory data not available. <button onClick={() => { void fetchData(false); }} className="underline">Retry</button></div>
              ) : (
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
              )}
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Root Storage Usage (GiB)</h3>
              {error && storageData.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Storage data not available. <button onClick={() => { void fetchData(false); }} className="underline">Retry</button></div>
              ) : (
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
                  </defs>
                  <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25 }} />
                  <YAxis tick={{ fill: '#888', fontSize: 12 }} label={{ value: 'GiB', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip contentStyle={{ background: '#222', color: '#fff', borderRadius: 8 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#888' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <Area type="monotone" dataKey="used" stroke="#ff7300" fillOpacity={1} fill="url(#colorUsed)" name="Used" isAnimationActive animationDuration={800} strokeWidth={2} />
                  <Area type="monotone" dataKey="avail" stroke="#387908" fillOpacity={1} fill="url(#colorAvail)" name="Available" isAnimationActive animationDuration={800} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              )}
              <div className="text-xs text-gray-500 mt-2">
                <b>Note:</b> <span>"Available" is the space available to non-root users. "Used" may appear higher due to reserved blocks and filesystem overhead.</span>
              </div>
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network TCP Packets (packets/s)</h3>
              {error && networkIn.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Network TCP data not available. <button onClick={() => { void fetchData(false); }} className="underline">Retry</button></div>
              ) : (
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
              )}
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network UDP Packets (packets/s)</h3>
              {error && networkOut.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Network UDP data not available. <button onClick={() => { void fetchData(false); }} className="underline">Retry</button></div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}