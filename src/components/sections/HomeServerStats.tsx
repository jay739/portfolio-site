'use client';

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { fetchNetdataMetrics, authenticateNetdata } from '@/lib/netdata';
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
  const [storage, setStorage] = useState<{ used: any[]; avail: any[]; free: any[]; total: any[] }>({ used: [], avail: [], free: [], total: [] });
  const [networkIn, setNetworkIn] = useState<any[]>([]);
  const [networkOut, setNetworkOut] = useState<any[]>([]);
  const [progress, setProgress] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const REFRESH_INTERVAL = 30000;

  const fetchData = async () => {
    try {
      const memoryData = await fetchNetdataMetrics('memory', 'used', 0, 0, 20);
      setMemory(memoryData.map(entry => ({
        timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
        value: entry.value,
      })));

      const [used, avail, free, total] = await Promise.all([
        fetchNetdataMetrics('storage', 'used', 0, 0, 20),
        fetchNetdataMetrics('storage', 'avail', 0, 0, 20),
        fetchNetdataMetrics('storage', 'free', 0, 0, 20),
        fetchNetdataMetrics('storage', 'total', 0, 0, 20)
      ]);

      setStorage({
        used: used.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })),
        avail: avail.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })),
        free: free.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })),
        total: total.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        }))
      });

      const [networkInData, networkOutData] = await Promise.all([
        fetchNetdataMetrics('network', 'tcp', 0, 0, 20),
        fetchNetdataMetrics('network', 'udp', 0, 0, 20)
      ]);

      setNetworkIn(networkInData.map(entry => ({
        timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
        value: entry.value,
      })));
      setNetworkOut(networkOutData.map(entry => ({
        timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
        value: entry.value,
      })));

      lastUpdateRef.current = Date.now();
      setProgress(0);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error instanceof Error && error.message === 'Authentication required') {
        setIsAuthenticated(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    
    const formData = new FormData(event.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const success = await authenticateNetdata(username, password);
      if (success) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
          <form onSubmit={handleLogin} className="bg-white dark:bg-slate-700 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Netdata Authentication Required</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                name="username"
                type="text"
                placeholder="Username"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                name="password"
                type="password"
                placeholder="******************"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // Merge all storage dimensions for charting
  const storageData = storage.used.map((point, idx) => ({
    timestamp: point.timestamp,
    used: point.value,
    avail: storage.avail[idx]?.value ?? null,
    free: storage.free[idx]?.value ?? null,
    total: storage.total[idx]?.value ?? null,
  }));

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background/fadeout effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🏠</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Home Server Infrastructure</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-4xl mb-8">
            My self-hosted home lab running on Docker containers, providing a complete infrastructure stack for development, 
            media management, productivity, and automation. All services are containerized and monitored with real-time metrics, 
            demonstrating practical DevOps skills and system administration expertise.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(SERVICE_CHARTS).map(([service, info]) => (
              <motion.a
                key={service}
                href={info.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.15, delay: 0 } }}
                className="transform transition-all duration-300 bg-white dark:bg-slate-700 rounded-2xl p-6 flex flex-col items-center fade-in tilt glow-hover border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 mb-2">
                  <PulsingDot />
                  <span className="text-2xl">{info.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {info.title}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  {info.description}
                </p>
              </motion.a>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="col-span-full flex items-center mb-4">
              <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-semibold rounded mr-2">Live</span>
              <CircularProgress progress={progress} />
              <span className="text-xs text-gray-500 dark:text-gray-400">Auto-refreshes every 30s</span>
            </div>

            <div className="bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Memory Usage (MB)</h3>
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

            <div className="bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Root Storage Usage (GiB)</h3>
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

            <div className="bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network TCP Packets (packets/s)</h3>
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

            <div className="bg-white/10 dark:bg-slate-700/40 rounded-2xl p-6">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network UDP Packets (packets/s)</h3>
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
        </div>
      </div>
    </section>
  );
}