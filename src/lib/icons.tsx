import { IconType } from 'react-icons';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import * as Fa6Icons from 'react-icons/fa6';

// Export all icon types for type safety
export type IconName = keyof typeof FaIcons | keyof typeof SiIcons | keyof typeof Fa6Icons;

// Centralized icon mapping
export const iconMap: Record<string, { icon: IconType, url: string, label: string }> = {
  // Technology Icons
  'python': { icon: FaIcons.FaPython, url: 'https://www.python.org/', label: 'Python' },
  'javascript': { icon: FaIcons.FaJs, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', label: 'JavaScript' },
  'typescript': { icon: SiIcons.SiTypescript, url: 'https://www.typescriptlang.org/', label: 'TypeScript' },
  'react': { icon: FaIcons.FaReact, url: 'https://react.dev/', label: 'React' },
  'next.js': { icon: SiIcons.SiNextdotjs, url: 'https://nextjs.org/', label: 'Next.js' },
  'nextjs': { icon: SiIcons.SiNextdotjs, url: 'https://nextjs.org/', label: 'Next.js' },
  'astro': { icon: SiIcons.SiAstro, url: 'https://astro.build/', label: 'Astro' },
  'node.js': { icon: FaIcons.FaNodeJs, url: 'https://nodejs.org/', label: 'Node.js' },
  'nodejs': { icon: FaIcons.FaNodeJs, url: 'https://nodejs.org/', label: 'Node.js' },
  'docker': { icon: FaIcons.FaDocker, url: 'https://www.docker.com/', label: 'Docker' },
  'kubernetes': { icon: SiIcons.SiKubernetes, url: 'https://kubernetes.io/', label: 'Kubernetes' },
  'linux': { icon: FaIcons.FaLinux, url: 'https://www.linux.org/', label: 'Linux' },
  'ci/cd': { icon: FaIcons.FaCogs, url: 'https://en.wikipedia.org/wiki/CI/CD', label: 'CI/CD' },
  'cicd': { icon: FaIcons.FaCogs, url: 'https://en.wikipedia.org/wiki/CI/CD', label: 'CI/CD' },
  'portainer': { icon: FaIcons.FaServer, url: 'https://www.portainer.io/', label: 'Portainer' },
  'nginx': { icon: FaIcons.FaServer, url: 'https://nginx.org/', label: 'Nginx' },
  'uptime kuma': { icon: SiIcons.SiUptimekuma, url: 'https://github.com/louislam/uptime-kuma', label: 'Uptime Kuma' },
  'uptime-kuma': { icon: SiIcons.SiUptimekuma, url: 'https://github.com/louislam/uptime-kuma', label: 'Uptime Kuma' },
  'tensorflow': { icon: SiIcons.SiTensorflow, url: 'https://www.tensorflow.org/', label: 'TensorFlow' },
  'pytorch': { icon: SiIcons.SiPytorch, url: 'https://pytorch.org/', label: 'PyTorch' },
  'nlp': { icon: FaIcons.FaRobot, url: 'https://en.wikipedia.org/wiki/Natural_language_processing', label: 'NLP' },
  'computer vision': { icon: FaIcons.FaRegFileCode, url: 'https://en.wikipedia.org/wiki/Computer_vision', label: 'Computer Vision' },
  'mlops': { icon: FaIcons.FaCogs, url: 'https://en.wikipedia.org/wiki/MLOps', label: 'MLOps' },
  'pandas': { icon: SiIcons.SiPandas, url: 'https://pandas.pydata.org/', label: 'Pandas' },
  'scikit-learn': { icon: SiIcons.SiScikitlearn, url: 'https://scikit-learn.org/', label: 'Scikit-learn' },
  'scikitlearn': { icon: SiIcons.SiScikitlearn, url: 'https://scikit-learn.org/', label: 'Scikit-learn' },
  'langchain': { icon: SiIcons.SiLangchain, url: 'https://www.langchain.com/', label: 'LangChain' },
  'ollama': { icon: SiIcons.SiOllama, url: 'https://ollama.com/', label: 'Ollama' },
  'aws': { icon: FaIcons.FaAws, url: 'https://aws.amazon.com/', label: 'AWS' },
  'gcp': { icon: FaIcons.FaCloud, url: 'https://cloud.google.com/', label: 'GCP' },
  'github actions': { icon: FaIcons.FaGithub, url: 'https://github.com/features/actions', label: 'GitHub Actions' },
  'github-actions': { icon: FaIcons.FaGithub, url: 'https://github.com/features/actions', label: 'GitHub Actions' },
  'watchtower': { icon: SiIcons.SiWatchtower, url: 'https://containrrr.dev/watchtower/', label: 'Watchtower' },
  'vaultwarden': { icon: SiIcons.SiVault, url: 'https://vaultwarden.dev/', label: 'Vaultwarden' },
  'html/css': { icon: FaIcons.FaHtml5, url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', label: 'HTML/CSS' },
  'tailwind css': { icon: SiIcons.SiTailwindcss, url: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
  'tailwindcss': { icon: SiIcons.SiTailwindcss, url: 'https://tailwindcss.com/', label: 'Tailwind CSS' },
  'tkinter': { icon: FaIcons.FaPython, url: 'https://wiki.python.org/moin/TkInter', label: 'Tkinter' },
  'django': { icon: SiIcons.SiDjango, url: 'https://www.djangoproject.com/', label: 'Django' },
  'fastapi': { icon: SiIcons.SiFastapi, url: 'https://fastapi.tiangolo.com/', label: 'FastAPI' },
  'rest apis': { icon: FaIcons.FaRegFileCode, url: 'https://restfulapi.net/', label: 'REST APIs' },
  'express': { icon: FaIcons.FaNodeJs, url: 'https://expressjs.com/', label: 'Express' },
  'java': { icon: FaIcons.FaJava, url: 'https://www.java.com/', label: 'Java' },
  'go': { icon: FaIcons.FaRegFileCode, url: 'https://go.dev/', label: 'Go' },
  'bash': { icon: FaIcons.FaLinux, url: 'https://www.gnu.org/software/bash/', label: 'Bash' },
  'sql': { icon: FaIcons.FaDatabase, url: 'https://en.wikipedia.org/wiki/SQL', label: 'SQL' },
  'mysql': { icon: SiIcons.SiMysql, url: 'https://www.mysql.com/', label: 'MySQL' },
  'postgresql': { icon: SiIcons.SiPostgresql, url: 'https://www.postgresql.org/', label: 'PostgreSQL' },
  'mongodb': { icon: SiIcons.SiMongodb, url: 'https://www.mongodb.com/', label: 'MongoDB' },
  'azure': { icon: FaIcons.FaCloud, url: 'https://azure.microsoft.com', label: 'Azure' },
  'power bi': { icon: FaIcons.FaChartBar, url: 'https://powerbi.microsoft.com/', label: 'Power BI' },
  'streamlit': { icon: SiIcons.SiStreamlit, url: 'https://streamlit.io/', label: 'Streamlit' },
  'xgboost': { icon: FaIcons.FaChartBar, url: 'https://xgboost.ai/', label: 'XGBoost' },
  'home assistant': { icon: SiIcons.SiHomeassistant, url: 'https://www.home-assistant.io/', label: 'Home Assistant' },
  'qBittorrent': { icon: SiIcons.SiQbittorrent, url: 'https://www.qbittorrent.org/', label: 'qBittorrent' },
  'qbittorrent': { icon: SiIcons.SiQbittorrent, url: 'https://www.qbittorrent.org/', label: 'qBittorrent' },

  // Container Icons
  'authelia': { icon: FaIcons.FaLock, url: 'https://www.authelia.com/', label: 'Authelia' },
  'redis': { icon: SiIcons.SiRedis, url: 'https://redis.io/', label: 'Redis' },
  'homarr': { icon: FaIcons.FaHome, url: 'https://homarr.dev/', label: 'Homarr' },
  'nginx-proxy-manager': { icon: FaIcons.FaServer, url: 'https://nginxproxymanager.com/', label: 'Nginx Proxy Manager' },
  'theme-park': { icon: FaIcons.FaCloud, url: 'https://theme-park.dev/', label: 'Theme Park' },
  'open-webui': { icon: FaIcons.FaRegFileCode, url: 'https://github.com/open-webui/open-webui', label: 'Open WebUI' },
  'jellyfin': { icon: SiIcons.SiJellyfin, url: 'https://jellyfin.org/', label: 'Jellyfin' },
  'audiobookshelf': { icon: FaIcons.FaBook, url: 'https://www.audiobookshelf.org/', label: 'Audiobookshelf' },
  'nicotine': { icon: FaIcons.FaMusic, url: 'https://nicotine-plus.org/', label: 'Nicotine+' },
  'pihole': { icon: SiIcons.SiPihole, url: 'https://pi-hole.net/', label: 'Pi-hole' },
  'drupal': { icon: SiIcons.SiDrupal, url: 'https://www.drupal.org/', label: 'Drupal' },
  'portfolio': { icon: FaIcons.FaRegFileCode, url: 'https://nextjs.org/', label: 'Next.js' },
  'lidarr': { icon: SiIcons.SiSonarr, url: 'https://lidarr.audio/', label: 'Lidarr' },
  'vscode': { icon: FaIcons.FaRegFileCode, url: 'https://github.com/coder/code-server', label: 'VS Code Server' },
  'radarr': { icon: SiIcons.SiRadarr, url: 'https://radarr.video/', label: 'Radarr' },
  'sonarr': { icon: SiIcons.SiSonarr, url: 'https://sonarr.tv/', label: 'Sonarr' },
  'navidrome': { icon: FaIcons.FaMusic, url: 'https://www.navidrome.org', label: 'Navidrome' },
  'comfyui': { icon: FaIcons.FaRobot, url: 'https://github.com/comfyanonymous/ComfyUI', label: 'ComfyUI' },
  'signal-api': { icon: FaIcons.FaRegFileCode, url: 'https://github.com/bbernhard/signal-cli-rest-api', label: 'Signal API' },
  'netdata': { icon: FaIcons.FaServer, url: 'https://www.netdata.cloud/', label: 'Netdata' },
  'mariadb': { icon: SiIcons.SiMariadb, url: 'https://mariadb.org/', label: 'MariaDB' },
  'duckdns': { icon: SiIcons.SiDuckduckgo, url: 'https://www.duckdns.org/', label: 'DuckDNS' },
  'homeassistant': { icon: SiIcons.SiHomeassistant, url: 'https://www.home-assistant.io/', label: 'Home Assistant' },
  'wg-easy': { icon: FaIcons.FaNetworkWired, url: 'https://github.com/WeeJeWel/wg-easy', label: 'WG-Easy' },
  'kuma-bot': { icon: FaIcons.FaGamepad, url: 'https://github.com/louislam/uptime-kuma-discord-bot', label: 'Kuma Bot' },
  'nextcloud': { icon: SiIcons.SiNextcloud, url: 'https://nextcloud.com/', label: 'Nextcloud' },

  // Social Icons
  'github': { icon: Fa6Icons.FaGithub, url: 'https://github.com/jay739', label: 'GitHub' },
  'linkedin': { icon: Fa6Icons.FaLinkedin, url: 'https://www.linkedin.com/in/jaya-krishna-konda/', label: 'LinkedIn' },
  'twitter': { icon: Fa6Icons.FaXTwitter, url: 'https://x.com/jay739', label: 'X (Twitter)' },

  // Theme Icons
  'sun': { icon: FaIcons.FaSun, url: '#', label: 'Light Mode' },
  'moon': { icon: FaIcons.FaMoon, url: '#', label: 'Dark Mode' },

  // Default Icon
  'default': { icon: FaIcons.FaRegQuestionCircle, url: '#', label: 'Unknown' },

  // New icons
  'volume-up': { icon: FaIcons.FaVolumeUp, url: '#', label: 'Sound On' },
  'volume-mute': { icon: FaIcons.FaVolumeMute, url: '#', label: 'Sound Off' },
};

// Helper function to get icon data
export function getIconData(name: string) {
  return iconMap[name.toLowerCase()] || iconMap['default'];
}

// Dynamic icon component
export function DynamicIcon({ name, className = '', size = 24 }: { name: string, className?: string, size?: number }) {
  const iconData = getIconData(name);
  const Icon = iconData.icon;
  return <Icon className={className} size={size} />;
} 