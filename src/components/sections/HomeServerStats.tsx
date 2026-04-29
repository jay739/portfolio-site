'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { fetchNetdataMetrics } from '@/lib/netdata';
import { motion } from 'framer-motion';
import OnboardingHint from '@/components/ui/OnboardingHint';
import { getAmbientMode } from '@/lib/site-ux';
import {
  FaFilm, FaMusic, FaHeadphones, FaCloud, FaImages,
  FaFileAlt, FaHome, FaLock, FaStickyNote, FaBookmark,
  FaCompass, FaDocker, FaChartBar, FaFire, FaDollarSign, FaRobot
} from 'react-icons/fa';

const SERVICE_CHARTS = {
  'media-server': {
    title: 'Media Server',
    icon: <FaFilm className="text-amber-400" />,
    description: 'Private streaming service',
    url: '#home-server'
  },
  'music-service': {
    title: 'Music Service',
    icon: <FaMusic className="text-amber-400" />,
    description: 'Private music library',
    url: '#home-server'
  },
  'audio-library': {
    title: 'Audio Library',
    icon: <FaHeadphones className="text-amber-400" />,
    description: 'Audiobook and podcast service',
    url: '#home-server'
  },
  'cloud-storage': {
    title: 'Cloud Storage',
    icon: <FaCloud className="text-amber-400" />,
    description: 'File sync and backup surface',
    url: '#home-server'
  },
  'photo-library': {
    title: 'Photo Library',
    icon: <FaImages className="text-amber-400" />,
    description: 'Private image management',
    url: '#home-server'
  },
  'document-archive': {
    title: 'Document Archive',
    icon: <FaFileAlt className="text-amber-400" />,
    description: 'Private document workflow',
    url: '#home-server'
  },
  'home-automation': {
    title: 'Home Automation',
    icon: <FaHome className="text-amber-400" />,
    description: 'Local device orchestration',
    url: '#home-server'
  },
  'password-vault': {
    title: 'Password Vault',
    icon: <FaLock className="text-amber-400" />,
    description: 'Private credential storage',
    url: '#home-server'
  },
  'notes-system': {
    title: 'Notes System',
    icon: <FaStickyNote className="text-amber-400" />,
    description: 'Private knowledge base',
    url: '#home-server'
  },
  'bookmark-archive': {
    title: 'Bookmark Archive',
    icon: <FaBookmark className="text-amber-400" />,
    description: 'Saved web references',
    url: '#home-server'
  },
  'dashboard': {
    title: 'Ops Dashboard',
    icon: <FaCompass className="text-amber-400" />,
    description: 'Unified homelab overview',
    url: '#home-server'
  },
  'container-console': {
    title: 'Container Console',
    icon: <FaDocker className="text-amber-400" />,
    description: 'Private container operations',
    url: '#home-server'
  },
  'metrics-dashboard': {
    title: 'Metrics Dashboard',
    icon: <FaChartBar className="text-amber-400" />,
    description: 'Operational charts',
    url: '#home-server'
  },
  'metrics-store': {
    title: 'Metrics Store',
    icon: <FaFire className="text-amber-400" />,
    description: 'Time-series monitoring',
    url: '#home-server'
  },
  'subscription-tracker': {
    title: 'Subscription Tracker',
    icon: <FaDollarSign className="text-amber-400" />,
    description: 'Recurring cost visibility',
    url: '#home-server'
  },
  'ai-chat': {
    title: 'AI Chat Surface',
    icon: <FaRobot className="text-amber-400" />,
    description: 'Private local AI interface',
    url: '#home-server'
  },
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
        stroke="#f59e0b"
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
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
    </span>
  );
}

export default function HomeServerStats() {
  const router = useRouter();
  const pathname = usePathname();
  const [cpu, setCpu] = useState<any[]>([]);
  const [load, setLoad] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [uptime, setUptime] = useState<any[]>([]);
  const [networkIn, setNetworkIn] = useState<any[]>([]);
  const [networkOut, setNetworkOut] = useState<any[]>([]);
  const [networkInLabel, setNetworkInLabel] = useState('Received (KB/s)');
  const [networkOutLabel, setNetworkOutLabel] = useState('Sent (KB/s)');
  const [networkInSource, setNetworkInSource] = useState('received');
  const [networkOutSource, setNetworkOutSource] = useState('sent');
  const [serviceStatus, setServiceStatus] = useState<Record<string, { running: boolean; monitored: boolean; assumed: boolean; cpuUsage: number; memUsage: number }>>({});
  const [sourceHealthy, setSourceHealthy] = useState(true);
  const [showUnmonitored, setShowUnmonitored] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(30000);
  const [progress, setProgress] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshMode, setLastRefreshMode] = useState<'initial' | 'background' | 'manual'>('initial');
  const [lastGoodUpdate, setLastGoodUpdate] = useState<number | null>(null);
  const [liteMode, setLiteMode] = useState(false);
  const [urlStateReady, setUrlStateReady] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const dataPoints = liteMode ? 8 : 20;

  const normalizeNetworkRate = (value: number, dimension: string) => {
    // InOctets/OutOctets are bytes/sec; normalize to KB/s for display consistency.
    if (dimension === 'InOctets' || dimension === 'OutOctets') {
      return value / 1024;
    }
    return value;
  };

  const fetchFirstAvailableDimension = async (
    service: string,
    candidates: string[],
    after = 0,
    before = 0,
    points = 20,
  ) => {
    for (const dimension of candidates) {
      const data = await fetchNetdataMetrics(service, dimension, after, before, points);
      if (data.length > 0) {
        return { data, dimension };
      }
    }
    return { data: [] as any[], dimension: candidates[0] };
  };

  const fetchServiceStatus = async (service: string, after: number, points: number) => {
    const url = new URL(`/api/netdata/${encodeURIComponent(service)}`, window.location.origin);
    url.searchParams.append('points', String(points));
    url.searchParams.append('after', String(after));
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: {
        'Accept': '*/*',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      return { service, running: false, monitored: false, cpuUsage: 0, upstreamDown: true };
    }

    const raw = await response.json();
    const labels: string[] = Array.isArray(raw?.result?.labels) ? raw.result.labels : [];
    const rows: any[] = Array.isArray(raw?.result?.data) ? raw.result.data : [];
    const upstreamDown = raw?.meta?.upstream === 'down';

    // A service is only considered monitored if Netdata returned actual dimension labels
    // (e.g. ['time','user','system']). A bare ['time'] response means the instance doesn't
    // exist on this node (batcave services not visible from the OCI VPS Netdata).
    const monitored = labels.length >= 2 && !upstreamDown;
    const running = rows.length > 0;

    let cpuUsage = 0;
    const latestRow = rows[rows.length - 1];
    if (Array.isArray(latestRow) && latestRow.length > 1) {
      for (let i = 1; i < latestRow.length; i += 1) {
        const value = Number(Array.isArray(latestRow[i]) ? latestRow[i][0] : latestRow[i]);
        if (Number.isFinite(value)) {
          cpuUsage += value;
        }
      }
    }

    return { service, running, monitored, cpuUsage, upstreamDown };
  };

  const fetchData = async (mode: 'initial' | 'background' | 'manual' = 'initial') => {
    setLastRefreshMode(mode);
    if (mode === 'initial') {
      setIsInitialLoading(true);
      setError(null);
      setWarning(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [cpuResult, loadResult, networkResult, processesResult, uptimeResult] = await Promise.allSettled([
        Promise.all([
          fetchNetdataMetrics('cpu', 'user', 0, 0, dataPoints),
          fetchNetdataMetrics('cpu', 'system', 0, 0, dataPoints),
        ]),
        Promise.all([
          fetchNetdataMetrics('load', 'load1', 0, 0, dataPoints),
          fetchNetdataMetrics('load', 'load5', 0, 0, dataPoints),
          fetchNetdataMetrics('load', 'load15', 0, 0, dataPoints),
        ]),
        Promise.all([
          fetchFirstAvailableDimension('network', ['received', 'InOctets'], 0, 0, dataPoints),
          fetchFirstAvailableDimension('network', ['sent', 'OutOctets'], 0, 0, dataPoints),
        ]),
        fetchNetdataMetrics('processes', 'active', 0, 0, dataPoints),
        fetchNetdataMetrics('uptime', 'uptime', 0, 0, dataPoints),
      ]);

      // Fetch container statuses
      const serviceNames = Object.keys(SERVICE_CHARTS);
      const serviceResults = await Promise.allSettled(
        serviceNames.map(async (service) => {
          try {
            const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600;
            return await fetchServiceStatus(service, tenMinutesAgo, dataPoints);
          } catch {
            return { service, running: false, monitored: false, cpuUsage: 0, upstreamDown: true };
          }
        })
      );

      const statusMap: Record<string, { running: boolean; monitored: boolean; assumed: boolean; cpuUsage: number; memUsage: number }> = {};
      serviceResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { service, running, monitored, cpuUsage } = result.value;
          statusMap[service] = { running, monitored, assumed: false, cpuUsage, memUsage: 0 };
        }
      });

      let successfulSources = 0;

      if (cpuResult.status === 'fulfilled') {
        const [userData, systemData] = cpuResult.value;
        if (userData.length > 0 || systemData.length > 0) {
          successfulSources += 1;
        }
        const mergedByTimestamp = new Map<number, { user: number; system: number }>();
        userData.forEach((entry) => {
          const existing = mergedByTimestamp.get(entry.timestamp) || { user: 0, system: 0 };
          mergedByTimestamp.set(entry.timestamp, { ...existing, user: entry.value });
        });
        systemData.forEach((entry) => {
          const existing = mergedByTimestamp.get(entry.timestamp) || { user: 0, system: 0 };
          mergedByTimestamp.set(entry.timestamp, { ...existing, system: entry.value });
        });
        const cpuSeries = Array.from(mergedByTimestamp.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([timestamp, values]) => ({
            timestamp: new Date(timestamp * 1000).toLocaleTimeString(),
            value: values.user + values.system,
          }));
        setCpu(cpuSeries);
      }

      if (loadResult.status === 'fulfilled') {
        const [load1Data, load5Data, load15Data] = loadResult.value;
        if (load1Data.length > 0 || load5Data.length > 0 || load15Data.length > 0) {
          successfulSources += 1;
        }
        const byTimestamp = new Map<number, { load1: number | null; load5: number | null; load15: number | null }>();
        const ensure = (ts: number) => byTimestamp.get(ts) || { load1: null, load5: null, load15: null };
        load1Data.forEach((entry) => {
          const row = ensure(entry.timestamp);
          row.load1 = entry.value;
          byTimestamp.set(entry.timestamp, row);
        });
        load5Data.forEach((entry) => {
          const row = ensure(entry.timestamp);
          row.load5 = entry.value;
          byTimestamp.set(entry.timestamp, row);
        });
        load15Data.forEach((entry) => {
          const row = ensure(entry.timestamp);
          row.load15 = entry.value;
          byTimestamp.set(entry.timestamp, row);
        });
        setLoad(
          Array.from(byTimestamp.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([timestamp, row]) => ({
              timestamp: new Date(timestamp * 1000).toLocaleTimeString(),
              load1: row.load1 ?? 0,
              load5: row.load5 ?? 0,
              load15: row.load15 ?? 0,
            }))
        );
      }

      if (networkResult.status === 'fulfilled') {
        const [networkInResult, networkOutResult] = networkResult.value;
        if (networkInResult.data.length > 0 || networkOutResult.data.length > 0) {
          successfulSources += 1;
        }
        setNetworkInLabel(networkInResult.dimension === 'InOctets' ? 'Received (KB/s)' : 'Received');
        setNetworkOutLabel(networkOutResult.dimension === 'OutOctets' ? 'Sent (KB/s)' : 'Sent');
        setNetworkInSource(networkInResult.dimension);
        setNetworkOutSource(networkOutResult.dimension);

        setNetworkIn(networkInResult.data.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: normalizeNetworkRate(entry.value, networkInResult.dimension),
        })));
        setNetworkOut(networkOutResult.data.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: normalizeNetworkRate(entry.value, networkOutResult.dimension),
        })));
      }

      if (processesResult.status === 'fulfilled') {
        if (processesResult.value.length > 0) {
          successfulSources += 1;
        }
        setProcesses(processesResult.value.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })));
      }

      if (uptimeResult.status === 'fulfilled') {
        if (uptimeResult.value.length > 0) {
          successfulSources += 1;
        }
        setUptime(uptimeResult.value.map(entry => ({
          timestamp: new Date(entry.timestamp * 1000).toLocaleTimeString(),
          value: entry.value,
        })));
      }

      const sourceIsHealthy = successfulSources > 0;
      setSourceHealthy(sourceIsHealthy);

      // If the source is healthy but a service has no direct metric mapping,
      // mark it as assumed-live so dashboard counts reflect operational reality.
      const adjustedStatusMap: Record<string, { running: boolean; monitored: boolean; assumed: boolean; cpuUsage: number; memUsage: number }> = {};
      Object.entries(statusMap).forEach(([service, status]) => {
        if (!status.monitored && sourceIsHealthy) {
          adjustedStatusMap[service] = { ...status, running: true, assumed: true };
        } else {
          adjustedStatusMap[service] = status;
        }
      });
      setServiceStatus(adjustedStatusMap);

      if (successfulSources > 0) {
        const now = Date.now();
        lastUpdateRef.current = now;
        setLastGoodUpdate(now);
        setProgress(0);
        setError(null);
        setWarning(
          successfulSources < 5
            ? 'Some live sources are temporarily unavailable. Showing partial metrics.'
            : null
        );
      } else {
        setError('Monitoring source is temporarily unreachable.');
        setWarning(lastGoodUpdate ? 'Showing the last available snapshot until the source comes back.' : 'Waiting for source recovery.');
      }
    } catch {
      setSourceHealthy(false);
      setError('Monitoring source is temporarily unreachable.');
      setWarning(lastGoodUpdate ? 'Showing the last available snapshot until the source comes back.' : 'Waiting for source recovery.');
    } finally {
      if (mode === 'initial') {
        setIsInitialLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('lite') === '1') {
      setLiteMode(true);
    }
    if (getAmbientMode()) {
      setAutoRefreshEnabled(false);
      setRefreshIntervalMs(60000);
    }
    setUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (!urlStateReady || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (liteMode) {
      params.set('lite', '1');
    } else {
      params.delete('lite');
    }
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [liteMode, pathname, router, urlStateReady]);

  useEffect(() => {
    void fetchData('initial');
  }, [dataPoints]);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const interval = setInterval(() => {
      void fetchData('background');
    }, refreshIntervalMs);
    intervalRef.current = interval;
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshIntervalMs]);

  // Animate progress bar
  useEffect(() => {
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastUpdateRef.current;
      setProgress(Math.min(elapsed / refreshIntervalMs, 1));
    }, 200);
    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshIntervalMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isTyping = activeTag === 'input' || activeTag === 'textarea';
      if (!isTyping && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        void fetchData('manual');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const latestStats = useMemo(() => {
    const latestCpu = cpu[cpu.length - 1]?.value ?? 0;
    const latestLoad = load[load.length - 1]?.load1 ?? 0;
    const latestProcesses = processes[processes.length - 1]?.value ?? 0;
    const latestUptimeHours = (uptime[uptime.length - 1]?.value ?? 0) / 3600;
    const latestNetIn = networkIn[networkIn.length - 1]?.value ?? 0;
    const latestNetOut = networkOut[networkOut.length - 1]?.value ?? 0;

    return {
      latestCpu,
      latestLoad,
      latestProcesses,
      latestUptimeHours,
      latestNetIn,
      latestNetOut,
    };
  }, [cpu, load, processes, uptime, networkIn, networkOut]);

  const filteredServices = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase();
    return Object.entries(SERVICE_CHARTS).filter(([serviceKey, info]) => {
      if (!q) {
        return showUnmonitored || (serviceStatus[serviceKey]?.monitored ?? false);
      }
      const matchesText = info.title.toLowerCase().includes(q) || info.description.toLowerCase().includes(q);
      const matchesVisibility = showUnmonitored || (serviceStatus[serviceKey]?.monitored ?? false);
      return matchesText && matchesVisibility;
    });
  }, [serviceQuery, showUnmonitored, serviceStatus]);

  const serviceHealthSummary = useMemo(() => {
    const values = Object.values(serviceStatus);
    const monitored = values.filter((s) => s.monitored).length;
    const live = values.filter((s) => s.running && !s.assumed).length;
    const assumedLive = values.filter((s) => s.assumed).length;
    const unmonitored = Object.keys(SERVICE_CHARTS).length - monitored;
    return { live, monitored, assumedLive, unmonitored };
  }, [serviceStatus]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mb-4" />
        <span className="text-amber-300">Loading server stats...</span>
      </div>
    );
  }

  return (
    <section className="relative pt-0 pb-16 px-2 sm:px-6 w-full overflow-hidden">
      <div className="w-full relative">
        {/* Animated background/fadeout effect */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <div className="relative w-full neural-card neural-glow-border rounded-2xl shadow-lg p-4 sm:p-8">
          <OnboardingHint
            storageKey="homeserver_telemetry_hint_v1"
            title="Telemetry control center"
            body="Use Lite mode for mobile or slower networks, press R for a manual refresh, and turn on Ambient mode if you want the dashboard to stay quieter."
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl flex items-center"><FaHome className="text-amber-400" /></span>
              <h2 className="neural-section-title">Home Server Infrastructure</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { void fetchData('manual'); }}
                className="neural-control-btn text-xs"
              >
                Refresh now
              </button>
              <button
                type="button"
                onClick={() => setLiteMode((value) => !value)}
                className={`neural-control-btn text-xs ${liteMode ? 'ring-2 ring-amber-400/50' : ''}`}
              >
                {liteMode ? 'Lite mode: ON' : 'Lite mode: OFF'}
              </button>
              <label className="inline-flex items-center gap-2 rounded-md border border-slate-600/50 px-2 py-1 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                />
                Auto refresh
              </label>
              <select
                value={refreshIntervalMs}
                onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
                disabled={!autoRefreshEnabled}
                className="neural-input px-2 py-1 text-xs"
                aria-label="Refresh interval"
              >
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>60s</option>
              </select>
            </div>
          </div>
          <p className="neural-section-copy mb-3">
            My self-hosted home lab running on Docker containers across private nodes. Metrics below are pulled from the Backup VPS,
            which is connected to <span className="text-amber-300 font-medium">batcave</span> through a private mesh.
            Services marked as <span className="text-slate-400 font-medium">unmonitored</span> run on batcave and are not tracked by
            the public telemetry source — they exist and are running, but their resource metrics are not collected here.
          </p>
          <div className="mb-6 rounded-xl border border-slate-700/60 bg-slate-950/35 p-3 text-sm text-slate-300">
            <span className="font-medium text-amber-200">Telemetry mode:</span>{' '}
            {liteMode
              ? 'Lite mode trims chart payloads and keeps the fast status overview for slower networks or mobile screens.'
              : 'Full mode includes the live chart grid and the complete telemetry history.'}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">CPU (User+System)</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestCpu.toFixed(1)}%</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Load Avg (1m)</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestLoad.toFixed(2)}</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Active Processes</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestProcesses.toFixed(0)}</p>
            </div>
            <div className="neural-telemetry-card rounded-xl p-3">
              <p className="text-xs uppercase tracking-widest text-slate-400">Uptime</p>
              <p className="text-lg font-semibold text-slate-100">{latestStats.latestUptimeHours.toFixed(1)} h</p>
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
            <div className={`mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-300 transition-all ${isRefreshing && lastRefreshMode === 'manual' ? 'animate-pulse' : ''}`}>
              <span className={`px-2 py-1 rounded-full border ${sourceHealthy ? 'border-green-500/40 text-green-300' : 'border-amber-500/40 text-amber-300'}`}>
                {sourceHealthy ? 'Source: Live' : 'Source: Degraded'}
              </span>
              {isRefreshing && lastRefreshMode === 'manual' && (
                <span className="px-2 py-1 rounded-full border border-amber-500/40 text-amber-300 inline-flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
                  Refreshing chips...
                </span>
              )}
              <span className="px-2 py-1 rounded-full border border-amber-500/30 text-amber-300">
                Live services: {serviceHealthSummary.live + serviceHealthSummary.assumedLive}/{Object.keys(SERVICE_CHARTS).length}
              </span>
              <span className="px-2 py-1 rounded-full border border-orange-500/30 text-orange-300">
                Assumed live: {serviceHealthSummary.assumedLive}
              </span>
              <span className="px-2 py-1 rounded-full border border-slate-500/40 text-slate-300">
                Unmonitored: {serviceHealthSummary.unmonitored}
              </span>
              {lastGoodUpdate && (
                <span className="px-2 py-1 rounded-full border border-amber-700/30 text-amber-200">
                  Last refresh: {new Date(lastGoodUpdate).toLocaleTimeString()}
                </span>
              )}
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showUnmonitored}
                  onChange={(e) => setShowUnmonitored(e.target.checked)}
                />
                Show unmonitored services
              </label>
            </div>
            <input
              type="text"
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              placeholder="Filter services (e.g., media, proxy, monitoring)"
              className="neural-input w-full max-w-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Legend:</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live — active metrics from this node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400/60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 ring-2 ring-amber-300/70"></span>
              </span>
              Monitored — tracked but no recent samples
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
              Unmonitored — runs on batcave, not tracked here
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredServices.map(([service, info]) => {
              const status = serviceStatus[service];
              const isRunning = status?.running ?? false;
              const isMonitored = status?.monitored ?? false;
              const isAssumed = status?.assumed ?? false;
              return (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{
                  y: -4,
                  scale: 1.015,
                  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
                }}
                className="transform transition-all duration-300 neural-card-soft rounded-xl p-3 sm:p-4 flex flex-col items-center fade-in tilt glow-hover border border-slate-600/55"
              >
                <div className="flex flex-col items-center gap-1 mb-2 text-center">
                  {isRunning && !isAssumed ? (
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  ) : isAssumed ? (
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400/60"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400 ring-2 ring-amber-300/70"></span>
                    </span>
                  ) : isMonitored ? (
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400/60"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400 ring-2 ring-amber-300/70"></span>
                    </span>
                  ) : (
                    <span className="relative flex h-3 w-3 mr-1">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                    </span>
                  )}
                  <span className="text-2xl">{info.icon}</span>
                  <span className="font-medium text-slate-100 text-xs sm:text-sm text-center leading-tight">
                    {info.title}
                  </span>
                </div>
                <span className="neural-statement-chip text-center">{info.description}</span>
                <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-semibold ${
                  isRunning
                    ? 'border-green-500/40 bg-green-500/10 text-green-300'
                    : isMonitored
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-slate-500/40 bg-slate-500/10 text-slate-300'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-400' : isMonitored ? 'bg-amber-400' : 'bg-slate-400'}`} />
                  {isRunning && !isAssumed
                    ? 'Live'
                    : isAssumed
                    ? 'Live'
                    : isMonitored
                    ? 'Monitored, no recent samples'
                    : 'Not monitored on current source'}
                </div>
              </motion.div>
            )})}
          </div>

          {liteMode ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="neural-card-soft rounded-2xl p-5 border border-slate-600/55">
                <p className="text-xs uppercase tracking-widest text-slate-400">Network In</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{latestStats.latestNetIn.toFixed(1)}</p>
                <p className="mt-1 text-xs text-slate-400">{networkInLabel}</p>
              </div>
              <div className="neural-card-soft rounded-2xl p-5 border border-slate-600/55">
                <p className="text-xs uppercase tracking-widest text-slate-400">Network Out</p>
                <p className="mt-2 text-2xl font-semibold text-slate-100">{latestStats.latestNetOut.toFixed(1)}</p>
                <p className="mt-1 text-xs text-slate-400">{networkOutLabel}</p>
              </div>
              <div className="neural-card-soft rounded-2xl p-5 border border-slate-600/55">
                <p className="text-xs uppercase tracking-widest text-slate-400">Telemetry Budget</p>
                <p className="mt-2 text-sm text-slate-200">Compact mode is using {dataPoints} samples per metric request.</p>
                <p className="mt-2 text-xs text-slate-400">Switch back to full mode anytime for the live chart wall.</p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            <div className="col-span-full flex items-center mb-4">
              <span className="neural-pill-intro text-xs mr-2">Live</span>
              <CircularProgress progress={progress} />
              <span className="text-xs text-slate-400">
                {autoRefreshEnabled ? `Auto-refreshes every ${Math.round(refreshIntervalMs / 1000)}s` : 'Auto-refresh paused'}
              </span>
              {isRefreshing && (
                <span className="ml-2 inline-flex items-center text-xs text-amber-300">
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current animate-pulse" />
                  Updating...
                </span>
              )}
              <span className="ml-auto text-[11px] text-slate-500">Tip: press R to refresh</span>
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">CPU Usage (User + System %)</h3>
              <div className="mb-2 text-[11px] text-slate-400">Source: <span className="text-slate-300">system.cpu</span></div>
              {error && cpu.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">CPU data not available. <button onClick={() => { void fetchData('manual'); }} className="underline">Retry</button></div>
              ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={cpu} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25, fill: '#fdba74' }} />
                  <YAxis tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, fill: '#fdba74' }} />
                  <Tooltip contentStyle={{ background: '#111111', color: '#fff7ed', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#fcd34d' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.14)" />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCpu)" name="CPU" isAnimationActive animationDuration={800} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">System Load (1m / 5m / 15m)</h3>
              <div className="mb-2 text-[11px] text-slate-400">Source: <span className="text-slate-300">system.load / load1, load5, load15</span></div>
              {error && load.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Load data not available. <button onClick={() => { void fetchData('manual'); }} className="underline">Retry</button></div>
              ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={load} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25, fill: '#fdba74' }} />
                  <YAxis tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Load', angle: -90, position: 'insideLeft', offset: 10, fill: '#fdba74' }} />
                  <Tooltip contentStyle={{ background: '#111111', color: '#fff7ed', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#fcd34d' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.14)" />
                  <Line type="monotone" dataKey="load1" stroke="#f59e0b" name="Load 1m" isAnimationActive animationDuration={800} strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="load5" stroke="#fb923c" name="Load 5m" isAnimationActive animationDuration={800} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="load15" stroke="#fde68a" name="Load 15m" isAnimationActive animationDuration={800} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              )}
              <div className="mt-2 text-xs text-slate-400">
                Load is runnable demand. A value of 0.925 at 2:26 AM means about 0.925 CPU cores worth of work were ready on average over 1 minute.
              </div>
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network In</h3>
              <div className="mb-2 text-[11px] text-slate-400">Source: <span className="text-slate-300">system.net / {networkInSource}</span></div>
              {error && networkIn.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Network TCP data not available. <button onClick={() => { void fetchData('manual'); }} className="underline">Retry</button></div>
              ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={networkIn} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorTCP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25, fill: '#fdba74' }} />
                  <YAxis tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Rate', angle: -90, position: 'insideLeft', offset: 10, fill: '#fdba74' }} />
                  <Tooltip contentStyle={{ background: '#111111', color: '#fff7ed', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#fcd34d' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.14)" />
                  <Area type="monotone" dataKey="value" stroke="#ea580c" fillOpacity={1} fill="url(#colorTCP)" name={networkInLabel} isAnimationActive animationDuration={800} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>

            <div className="neural-card-soft rounded-2xl p-6 neural-hover-lift border border-slate-600/55">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Network Out</h3>
              <div className="mb-2 text-[11px] text-slate-400">Source: <span className="text-slate-300">system.net / {networkOutSource}</span></div>
              {error && networkOut.length === 0 ? (
                <div className="text-red-600 font-semibold mb-2">Network UDP data not available. <button onClick={() => { void fetchData('manual'); }} className="underline">Retry</button></div>
              ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={networkOut} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <defs>
                    <linearGradient id="colorUDP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="timestamp" angle={-30} textAnchor="end" interval={3} height={40} tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Time', position: 'insideBottom', offset: -25, fill: '#fdba74' }} />
                  <YAxis tick={{ fill: '#fcd34d', fontSize: 12 }} label={{ value: 'Rate', angle: -90, position: 'insideLeft', offset: 10, fill: '#fdba74' }} />
                  <Tooltip contentStyle={{ background: '#111111', color: '#fff7ed', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontWeight: 500, color: '#fcd34d' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.14)" />
                  <Area type="monotone" dataKey="value" stroke="#fbbf24" fillOpacity={1} fill="url(#colorUDP)" name={networkOutLabel} isAnimationActive animationDuration={800} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
