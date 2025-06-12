'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import HomeServerStats from './HomeServerStats';
import { FaDocker, FaJenkins, FaGitlab, FaNodeJs, FaHome, FaCloud, FaDatabase, FaNetworkWired, FaLinux, FaPython, FaJava, FaPhp, FaJs, FaReact, FaServer, FaUbuntu, FaWindows, FaApple, FaRaspberryPi, FaCogs, FaLock, FaMusic, FaBook, FaGamepad, FaRegFileCode, FaRegQuestionCircle, FaRobot, FaChartLine, FaNewspaper } from 'react-icons/fa';
import { SiJellyfin, SiNextcloud, SiMariadb, SiRedis, SiPihole, SiPortainer, SiHomeassistant, SiQbittorrent, SiWatchtower, SiDuckduckgo, SiVault, SiSonarr, SiRadarr, SiDrupal, SiOpenai } from 'react-icons/si';
import { DynamicIcon, getIconData } from '@/lib/icons';
import { fetchNetdata } from '@/lib/netdata';

interface Server {
  name: string;
  icon: string;
  description: string;
  specs: string[];
  color: string;
}

const servers: Server[] = [
  {
    name: "Media Server",
    icon: "🎬",
    description: "Streaming movies, TV shows, and music across all devices",
    specs: ["Jellyfin Media Server", "4K HDR Support", "Automated Media Management"],
    color: "from-purple-500 to-indigo-600"
  },
  {
    name: "Game Server",
    icon: "🎮",
    description: "Hosting multiplayer games and game servers",
    specs: ["Minecraft", "Valheim", "Terraria", "CS:GO"],
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Development Server",
    icon: "💻",
    description: "Running development environments and CI/CD pipelines",
    specs: ["Docker", "Jenkins", "GitLab", "VS Code Server"],
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "Home Automation",
    icon: "🏠",
    description: "Smart home control and automation",
    specs: ["Home Assistant", "Zigbee/Z-Wave", "MQTT", "Node-RED"],
    color: "from-orange-500 to-amber-600"
  }
];

const morphPaths = [
  "M0,200 Q175,120 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,180 350,200 T700,200 V300 H0 Z",
  "M0,200 Q175,120 350,200 T700,200 V300 H0 Z"
];

// Container data (replace with dynamic fetch if needed)
const containers = [
  {
    name: 'authelia', image: 'authelia/authelia:latest', status: 'restarting', ports: '', healthy: false,
  },
  { name: 'redis', image: 'redis:alpine', status: 'running', ports: '6379/tcp', healthy: true },
  { name: 'homarr', image: 'ghcr.io/ajnart/homarr:latest', status: 'healthy', ports: '7575/tcp', healthy: true },
  { name: 'qbittorrent', image: 'linuxserver/qbittorrent', status: 'running', ports: '6881/tcp, 8082/tcp, 6881/udp, 8080/tcp', healthy: true },
  { name: 'nginx-proxy-manager', image: 'jc21/nginx-proxy-manager:latest', status: 'running', ports: '80-81/tcp, 443/tcp', healthy: true },
  { name: 'theme-park', image: 'ghcr.io/themepark-dev/theme.park', status: 'running', ports: '443/tcp, 8384->80/tcp', healthy: true },
  { name: 'open-webui', image: 'ghcr.io/open-webui/open-webui:latest', status: 'healthy', ports: '3000/tcp, 8080/tcp', healthy: true },
  { name: 'jellyfin', image: 'jellyfin/jellyfin', status: 'healthy', ports: '8096/tcp', healthy: true },
  { name: 'audiobookshelf', image: 'ghcr.io/advplyr/audiobookshelf:latest', status: 'running', ports: '13378/tcp', healthy: true },
  { name: 'nicotine', image: 'sirjmann92/nicotineplus-proper:latest', status: 'running', ports: '2234/tcp, 6565/tcp', healthy: true },
  { name: 'pihole', image: 'pihole/pihole:latest', status: 'healthy', ports: '53/tcp, 53/udp, 8080/tcp', healthy: true },
  { name: 'portainer', image: 'portainer/portainer-ce', status: 'running', ports: '9000/tcp', healthy: true },
  { name: 'drupal', image: 'drupal', status: 'running', ports: '8085/tcp', healthy: true },
  { name: 'portfolio', image: 'nginx:alpine', status: 'running', ports: '80/tcp', healthy: true },
  { name: 'lidarr', image: 'linuxserver/lidarr', status: 'running', ports: '8686/tcp', healthy: true },
  { name: 'vscode', image: 'linuxserver/code-server', status: 'running', ports: '18080/tcp', healthy: true },
  { name: 'radarr', image: 'linuxserver/radarr', status: 'running', ports: '7878/tcp', healthy: true },
  { name: 'sonarr', image: 'linuxserver/sonarr', status: 'running', ports: '8989/tcp', healthy: true },
  { name: 'uptime-kuma', image: 'louislam/uptime-kuma', status: 'healthy', ports: '3001/tcp', healthy: true },
  { name: 'navidrome', image: 'deluan/navidrome:latest', status: 'running', ports: '4533/tcp', healthy: true },
  { name: 'watchtower', image: 'containrrr/watchtower', status: 'healthy', ports: '8080/tcp', healthy: true },
  { name: 'duckdns', image: 'lscr.io/linuxserver/duckdns', status: 'running', ports: '', healthy: true },
  { name: 'vaultwarden', image: 'vaultwarden/server', status: 'healthy', ports: '8222/tcp', healthy: true },
  { name: 'homeassistant', image: 'ghcr.io/home-assistant/home-assistant:stable', status: 'running', ports: '', healthy: true },
  { name: 'wg-easy', image: 'weejewel/wg-easy', status: 'running', ports: '', healthy: true },
  { name: 'kuma-bot', image: 'telegram-bot', status: 'running', ports: '5050/tcp', healthy: true },
  { name: 'nextcloud', image: 'nextcloud', status: 'running', ports: '80/tcp', healthy: true },
  { name: 'mariadb', image: 'mariadb:10.7', status: 'running', ports: '3306/tcp', healthy: true },
  { name: 'comfyui', image: 'comfyui:local', status: 'running', ports: '8188/tcp', healthy: true },
  { name: 'netdata', image: 'netdata/netdata:latest', status: 'healthy', ports: '19999/tcp', healthy: true },
  { name: 'signal-api', image: 'bbernhard/signal-cli-rest-api', status: 'healthy', ports: '8088/tcp', healthy: true },
];

const containerIconMap: Record<string, { icon: JSX.Element, url: string, label: string }> = {
  'authelia': { icon: <FaLock />, url: 'https://www.authelia.com/', label: 'Authelia' },
  'redis': { icon: <SiRedis />, url: 'https://redis.io/', label: 'Redis' },
  'homarr': { icon: <FaHome />, url: 'https://homarr.dev/', label: 'Homarr' },
  'qbittorrent': { icon: <SiQbittorrent />, url: 'https://www.qbittorrent.org/', label: 'qBittorrent' },
  'nginx-proxy-manager': { icon: <FaServer />, url: 'https://nginxproxymanager.com/', label: 'Nginx Proxy Manager' },
  'theme-park': { icon: <FaCloud />, url: 'https://theme-park.dev/', label: 'Theme Park' },
  'open-webui': { icon: <FaRegFileCode />, url: 'https://github.com/open-webui/open-webui', label: 'Open WebUI' },
  'jellyfin': { icon: <SiJellyfin />, url: 'https://jellyfin.org/', label: 'Jellyfin' },
  'audiobookshelf': { icon: <FaBook />, url: 'https://www.audiobookshelf.org/', label: 'Audiobookshelf' },
  'nicotine': { icon: <FaMusic />, url: 'https://nicotine-plus.org/', label: 'Nicotine+' },
  'pihole': { icon: <SiPihole />, url: 'https://pi-hole.net/', label: 'Pi-hole' },
  'portainer': { icon: <FaServer />, url: 'https://www.portainer.io/', label: 'Portainer' },
  'drupal': { icon: <SiDrupal />, url: 'https://www.drupal.org/', label: 'Drupal' },
  'portfolio': { icon: <FaRegFileCode />, url: 'https://nextjs.org/', label: 'Next.js' },
  'lidarr': { icon: <SiSonarr />, url: 'https://lidarr.audio/', label: 'Lidarr' },
  'vscode': { icon: <FaRegFileCode />, url: 'https://github.com/coder/code-server', label: 'VS Code Server' },
  'radarr': { icon: <SiRadarr />, url: 'https://radarr.video/', label: 'Radarr' },
  'sonarr': { icon: <SiSonarr />, url: 'https://sonarr.tv/', label: 'Sonarr' },
  'uptime-kuma': { icon: <FaChartLine />, url: 'https://github.com/louislam/uptime-kuma', label: 'Uptime Kuma' },
  'navidrome': { icon: <FaMusic />, url: 'https://www.navidrome.org', label: 'Navidrome' },
  'watchtower': { icon: <SiWatchtower />, url: 'https://containrrr.dev/watchtower/', label: 'Watchtower' },
  'duckdns': { icon: <SiDuckduckgo />, url: 'https://www.duckdns.org/', label: 'DuckDNS' },
  'vaultwarden': { icon: <SiVault />, url: 'https://vaultwarden.dev/', label: 'Vaultwarden' },
  'homeassistant': { icon: <SiHomeassistant />, url: 'https://www.home-assistant.io/', label: 'Home Assistant' },
  'wg-easy': { icon: <FaNetworkWired />, url: 'https://github.com/WeeJeWel/wg-easy', label: 'WG-Easy' },
  'kuma-bot': { icon: <FaGamepad />, url: 'https://github.com/louislam/uptime-kuma-discord-bot', label: 'Kuma Bot' },
  'nextcloud': { icon: <SiNextcloud />, url: 'https://nextcloud.com/', label: 'Nextcloud' },
  'mariadb': { icon: <SiMariadb />, url: 'https://mariadb.org/', label: 'MariaDB' },
  'comfyui': { icon: <FaRobot />, url: 'https://github.com/comfyanonymous/ComfyUI', label: 'ComfyUI' },
  'netdata': { icon: <FaServer />, url: 'https://www.netdata.cloud/', label: 'Netdata' },
  'signal-api': { icon: <FaRegFileCode />, url: 'https://github.com/bbernhard/signal-cli-rest-api', label: 'Signal API' },
  'nginx': { icon: <FaServer />, url: 'https://nginx.org', label: 'Nginx' },
};

function StatusDot({ status }: { status: string }) {
  let color = 'bg-green-500';
  let ping = 'bg-green-400';
  if (status === 'restarting') { color = 'bg-yellow-400'; ping = 'bg-yellow-300'; }
  if (status === 'unhealthy') { color = 'bg-red-500'; ping = 'bg-red-400'; }
  return (
    <span className="relative flex h-3 w-3 mr-1">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ping} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
    </span>
  );
}

function NetdataServiceStats() {
  // TODO: Implement Netdata fetch and display logic here
  return (
    <div className="my-8 text-center text-muted-foreground">
      <span>Service stats updating every 30 seconds (Netdata integration coming soon).</span>
    </div>
  );
}

// Netdata integration: fetch service status and map to friendly names
function useNetdataServiceStatus(serviceMap: Record<string, string[]>) {
  const [status, setStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchStatus() {
      try {
        const data = await fetchNetdata({ 
          service: 'system',
          points: 1,
          dimension: 'user' // We only need one dimension to check if the service is up
        });

        // Map container names to friendly service names
        const up: Record<string, boolean> = {};
        if (data && data.length > 0) {
          // If we got any data back, the service is up
          for (const [friendly] of Object.entries(serviceMap)) {
            up[friendly] = true;
          }
        }
        setStatus(up);
      } catch (e) {
        // On error, mark all as unknown (false)
        setStatus({});
      }
    }
    fetchStatus();
    interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [serviceMap]);
  return status;
}

// Map friendly service names to possible container aliases
const serviceMap: Record<string, string[]> = {
  'Media Server': ['plex', 'jellyfin'],
  'Game Server': ['minecraft', 'valheim', 'terraria', 'csgo'],
  'Development Server': ['jenkins', 'gitlab', 'code-server'],
  'Home Automation': ['homeassistant', 'node-red', 'zigbee', 'mqtt'],
};

function ServiceStatusDot({ up }: { up?: boolean }) {
  let color = up ? 'bg-green-500' : 'bg-red-500';
  let ping = up ? 'bg-green-400' : 'bg-red-400';
  return (
    <span className="relative flex h-3 w-3 mr-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ping} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
    </span>
  );
}

// Map container names to Netdata app group names
const netdataAppMap: Record<string, string> = {
  portainer: 'portainer',
  navidrome: 'navidrome',
  'signal-api': 'signal-cli-rest-api',
  jellyfin: 'jellyfin',
  nextcloud: 'nextcloud',
  homarr: 'homarr',
  drupal: 'drupal',
  mariadb: 'mariadb',
  // ...add more as needed
};

// Constants for optimization
const CACHE_DURATION = 30000; // 30 seconds
const POLL_INTERVAL = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const BATCH_SIZE = 10; // Number of containers to process in one batch

// Types for better type safety
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  error?: Error;
}

interface ContainerStats {
  cpu: number | null;
  mem: number | null;
  uptime: number | null;
  lastUpdate: number;
  error?: string;
}

interface RequestState {
  promise: Promise<any>;
  timestamp: number;
  retries: number;
}

// Enhanced cache with error tracking and cleanup
class StatsCache {
  private cache: Record<string, CacheEntry<ContainerStats>> = {};
  private requestStates: Record<string, RequestState> = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  get(container: string): CacheEntry<ContainerStats> | undefined {
    return this.cache[container];
  }

  set(container: string, data: ContainerStats, error?: Error): void {
    this.cache[container] = {
      data,
      timestamp: Date.now(),
      error
    };
  }

  cleanup(): void {
    const now = Date.now();
    Object.entries(this.cache).forEach(([key, entry]) => {
      if (now - entry.timestamp > CACHE_DURATION * 2) {
        delete this.cache[key];
      }
    });
  }

  getRequestState(endpoint: string): RequestState | undefined {
    const state = this.requestStates[endpoint];
    if (state && Date.now() - state.timestamp < CACHE_DURATION) {
      return state;
    }
    return undefined;
  }

  setRequestState(endpoint: string, promise: Promise<any>): void {
    this.requestStates[endpoint] = {
      promise,
      timestamp: Date.now(),
      retries: 0
    };
  }

  clearRequestState(endpoint: string): void {
    delete this.requestStates[endpoint];
  }

  dispose(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Create a singleton cache instance
const statsCache = new StatsCache();

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced fetch with retries and error handling
async function fetchWithRetry(endpoint: string): Promise<any> {
  const state = statsCache.getRequestState(endpoint);
  if (state) {
    return state.promise;
  }

  const fetchAttempt = async (retryCount: number): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const data = await fetchNetdata({ 
        service: endpoint,
        points: 1
      });

      clearTimeout(timeoutId);
      return { data: { result: data } };
    } catch (error) {
      if (retryCount < MAX_RETRIES && error instanceof Error && error.name !== 'AbortError') {
        await delay(RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
        return fetchAttempt(retryCount + 1);
      }
      throw error;
    }
  };

  const promise = fetchAttempt(0);
  statsCache.setRequestState(endpoint, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    statsCache.clearRequestState(endpoint);
  }
}

// Process containers in batches
async function processBatch(containers: string[]): Promise<Record<string, ContainerStats>> {
  const result: Record<string, ContainerStats> = {};
  const now = Date.now();

  // Process containers in batches
  for (let i = 0; i < containers.length; i += BATCH_SIZE) {
    const batch = containers.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (container) => {
      const cached = statsCache.get(container);
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        return [container, cached.data] as const;
      }

      try {
        const [cpuData, memData, uptimeData] = await Promise.all([
          fetchWithRetry('system'),
          fetchWithRetry('memory'),
          fetchWithRetry('docker')
        ]);

        const stats: ContainerStats = {
          cpu: null,
          mem: null,
          uptime: null,
          lastUpdate: now
        };

        // Extract and process stats with error handling
        try {
          if (cpuData?.data?.result) {
            const cpuEntry = cpuData.data.result.find((r: any) => r.dimension === 'user' || r.dimension === 'system');
            if (cpuEntry) {
              stats.cpu = cpuEntry.value;
            }
          }
        } catch (error) {
          console.error(`Error processing CPU stats for ${container}:`, error);
          stats.error = 'CPU data unavailable';
        }

        try {
          if (memData?.data?.result) {
            const memEntry = memData.data.result.find((r: any) => r.dimension === 'used');
            if (memEntry) {
              stats.mem = memEntry.value;
            }
          }
        } catch (error) {
          console.error(`Error processing memory stats for ${container}:`, error);
          stats.error = 'Memory data unavailable';
        }

        try {
          if (uptimeData?.data?.result) {
            const uptimeEntry = uptimeData.data.result.find((r: any) => r.dimension === 'running');
            if (uptimeEntry) {
              stats.uptime = uptimeEntry.value;
            }
          }
        } catch (error) {
          console.error(`Error processing uptime stats for ${container}:`, error);
          stats.error = 'Uptime data unavailable';
        }

        statsCache.set(container, stats);
        return [container, stats] as const;
      } catch (error) {
        console.error(`Error fetching stats for ${container}:`, error);
        const errorStats: ContainerStats = {
          cpu: null,
          mem: null,
          uptime: null,
          lastUpdate: now,
          error: 'Failed to fetch stats'
        };
        statsCache.set(container, errorStats, error as Error);
        return [container, errorStats] as const;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(([container, stats]) => {
      result[container] = stats;
    });

    // Add a small delay between batches to prevent overwhelming the server
    if (i + BATCH_SIZE < containers.length) {
      await delay(100);
    }
  }

  return result;
}

// Update the useNetdataContainerStats hook with enhanced error handling and cleanup
function useNetdataContainerStats(containers: string[]) {
  const [stats, setStats] = useState<Record<string, ContainerStats>>({});
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let isFetching = false;

    async function fetchStats() {
      if (!mountedRef.current || isFetching) return;
      
      isFetching = true;
      try {
        const result = await processBatch(containers);
        if (mountedRef.current) {
          setStats(result);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching container stats:', error);
        if (mountedRef.current) {
          setError('Failed to fetch container stats');
        }
      } finally {
        isFetching = false;
      }
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchStats();

    // Set up new interval
    intervalRef.current = setInterval(fetchStats, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [containers]);

  // Cleanup cache when component unmounts
  useEffect(() => {
    return () => {
      statsCache.dispose();
    };
  }, []);

  return { stats, error };
}

function formatUptime(seconds: number) {
  if (!seconds) return '';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Update ContainerStatusGrid to include icons
function ContainerStatusGrid({ containers, status }: { containers: string[], status: Record<string, boolean> }) {
  return (
    <div className="mt-8">
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Container Status</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {containers.map((name, idx) => {
          const isUp = status[name] !== false;
          const iconData = getIconData(name);
          return (
            <motion.div
              key={name + '-' + idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className={`
                flex items-center gap-2 p-2 rounded-lg
                ${isUp 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }
                transition-colors duration-200
              `}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isUp ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isUp ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                <DynamicIcon name={name} />
              </span>
              <a 
                href={iconData.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm font-medium truncate hover:underline flex-1"
                title={iconData.label}
              >
                {name}
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Update the main component
export default function HomeServerGallery() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const netdataStatus = useNetdataServiceStatus(serviceMap);
  const containerNames = Object.keys(netdataStatus).length > 0
    ? Object.keys(netdataStatus)
    : [
      'authelia', 'redis', 'homarr', 'qbittorrent', 'nginx-proxy-manager', 'theme-park', 'open-webui', 'jellyfin',
      'audiobookshelf', 'nicotine', 'pihole', 'portainer', 'drupal', 'portfolio', 'lidarr', 'vscode', 'radarr',
      'sonarr', 'uptime-kuma', 'navidrome', 'watchtower', 'duckdns', 'vaultwarden', 'homeassistant', 'wg-easy',
      'kuma-bot', 'nextcloud', 'mariadb', 'comfyui', 'netdata', 'signal-api'
    ];

  if (!mounted) return null;

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full">
      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8 pb-32">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          🖥️ Home Server Gallery
        </h2>

        {/* Server Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servers.map((server, index) => (
            <motion.div
              key={server.name + '-' + index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className={`transform transition-all duration-300 bg-gradient-to-br ${server.color} rounded-2xl p-6 flex flex-col items-center`}
              aria-label={server.name}
            >
              <div className="text-4xl mb-4">{server.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {server.name}
              </h3>
              <p className="text-white/90 mb-4 text-center">
                {server.description}
              </p>
              <ul className="space-y-2 w-full">
                {server.specs.map((spec, idx) => (
                  <li
                    key={spec + '-' + idx}
                    className="flex items-center text-white/80 text-sm"
                  >
                    <span className="mr-2">•</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Container Status Grid */}
        <ContainerStatusGrid containers={containerNames} status={netdataStatus} />

        {/* Graphs Section: Use a vertical stack for clarity */}
        <div className="mt-8 flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white/10 dark:bg-slate-700/40 rounded-3xl p-0 min-h-[950px] flex flex-col"
          >
            <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-6 px-8 pt-8">
              System Overview
            </h3>
            <div className="flex-1 w-full px-8 pb-8">
              <HomeServerStats />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 