// Sanitized homelab architecture data for the public portfolio operations HUD.
export const HOMELAB = {
  meta: {
    date: '2026-04-27',
    containers: 65,
    domain: '*.jay739.dev',
  },

  hosts: {
    inet: {
      id: 'inet', name: 'INTERNET', kind: 'cloud',
      lines: ['Public domain', 'Managed DNS', 'Public web edge'],
    },
    oci: {
      id: 'oci', name: 'BACKUP VPS', codename: 'Backup VPS',
      ip: 'public edge', ts: 'mesh edge node',
      arch: 'ARM aarch64 · Ubuntu 24.04',
      ram: '24 GB', disk: { used: 41, label: 'Root 45 GB' },
      cache: { used: 82, total: 137, current: 107, label: 'Backup volume' },
      uptime: '6d 21h',
      role: 'Edge · Tailscale Exit Node',
    },
    batcave: {
      id: 'batcave', name: 'BATCAVE', codename: 'main-server',
      ip: 'private core LAN', ts: 'mesh core node',
      arch: 'Linux 6.8 · x86_64',
      ram: { used: 74, label: '11 GB / 16 GB' },
      disk: { used: 31, label: '610 GB / 2 TB' },
      load: 5.25, uptime: '22h',
      containers: 65,
      role: 'Core · Compute · Storage',
    },
    mac: {
      id: 'mac', name: 'AI NODE', codename: 'Private AI Node',
      ip: 'private AI LAN', ts: 'mesh AI node',
      arch: 'Apple Silicon · local inference',
      ram: '16 GB', uptime: '6d 3h', load: 4.43,
      role: 'AI Compute',
    },
  },

  // Public-safe service categories. status: g=green, a=amber, r=red
  oci_stacks: [
    { id: 'oci-dns', title: 'PRIVATE DNS', accent: 'purple', svcs: [
      { n: 'DNS Filtering', s: 'g', star: true },
      { n: 'DNS Admin', s: 'g' },
    ]},
    { id: 'oci-infra', title: 'EDGE INFRA', accent: 'blue', svcs: [
      { n: 'Reverse Proxy', s: 'g' },
      { n: 'Uptime Monitoring', s: 'g' },
      { n: 'Update Watcher', s: 'g' },
      { n: 'Dynamic DNS', s: 'g' },
      { n: 'Host Metrics', s: 'g' },
    ]},
    { id: 'oci-public', title: 'PUBLIC APPS', accent: 'green', svcs: [
      { n: 'Portfolio Site', s: 'g' },
      { n: 'Roadmap App', s: 'g' },
      { n: 'Error Pages', s: 'g' },
      { n: 'Event Webhook', s: 'g' },
    ]},
    { id: 'oci-automation', title: 'AUTOMATION', accent: 'red', svcs: [
      { n: 'Alert Bot', s: 'g' },
      { n: 'Media Update Bot', s: 'g' },
      { n: 'Health Check', s: 'g' },
    ]},
  ],

  batcave_stacks: [
    { id: 'bc-infra', title: 'INFRASTRUCTURE', accent: 'blue', net: 'private proxy and infra networks', svcs: [
      { n: 'Reverse Proxy', s: 'g', star: true, tag: 'ENTRY' },
      { n: 'SSO Gateway', s: 'g', lock: true },
      { n: 'Container Console', s: 'g' },
      { n: 'Update Watcher', s: 'g' },
      { n: 'Host Monitor', s: 'g' },
      { n: 'Theme Service', s: 'g' },
      { n: 'Home Automation', s: 'g' },
      { n: 'Dynamic DNS', s: 'a', tag: 'RESTART' },
    ]},
    { id: 'bc-media', title: 'MEDIA', accent: 'red', net: 'private media network', svcs: [
      { n: 'Media Server', s: 'g', star: true },
      { n: 'Audiobook Server', s: 'g' },
      { n: 'Music Server', s: 'g' },
      { n: 'Request Portal', s: 'g' },
      { n: 'Account Helper', s: 'g' },
      { n: 'Media Landing Page', s: 'g' },
      { n: 'Usage Analytics', s: 'g' },
      { n: 'Stats API', s: 'g' },
    ]},
    { id: 'bc-automation', title: 'MEDIA AUTOMATION', accent: 'yellow', flow: 'indexer -> managers -> subtitles', svcs: [
      { n: 'Indexer Aggregator', s: 'g' },
      { n: 'Series Manager', s: 'g' },
      { n: 'Movie Manager', s: 'g' },
      { n: 'Music Manager', s: 'g' },
      { n: 'Subtitle Manager', s: 'g' },
    ]},
    { id: 'bc-transfer', title: 'TRANSFER LAYER', accent: 'orange', svcs: [
      { n: 'VPN Tunneller', s: 'g', star: true, tag: 'TUNNEL' },
      { n: 'P2P Client', s: 'g', via: 'tunnel' },
      { n: 'File Transfer Client', s: 'g', via: 'tunnel' },
      { n: 'Media Fetcher', s: 'g' },
      { n: 'Message File Bridge', s: 'g' },
    ]},
    { id: 'bc-files', title: 'FILES & STORAGE', accent: 'teal', svcs: [
      { n: 'Cloud Storage', s: 'g' },
      { n: 'Photo Library', s: 'g' },
      { n: 'Media ML Worker', s: 'g' },
      { n: 'File Browser', s: 'g' },
      { n: 'Document Archive', s: 'g' },
      { n: 'Bookmark Archive', s: 'g' },
    ]},
    { id: 'bc-mon', title: 'MONITORING', accent: 'green', svcs: [
      { n: 'Host Metrics', s: 'g' },
      { n: 'Disk Health', s: 'g' },
      { n: 'Network Check', s: 'g' },
      { n: 'Media Analytics', s: 'g' },
    ]},
    { id: 'bc-sec', title: 'SECURITY', accent: 'red', svcs: [
      { n: 'Password Vault', s: 'g', lock: true },
      { n: 'Identity Provider', s: 'g' },
    ]},
    { id: 'bc-ai', title: 'AI (LOCAL)', accent: 'purple', svcs: [
      { n: 'Audio Intelligence App', s: 'g' },
      { n: 'Personal Analytics App', s: 'g' },
    ]},
    { id: 'bc-tools', title: 'TOOLS', accent: 'gray', svcs: [
      { n: 'Developer Tools', s: 'g' },
      { n: 'Conversion Tools', s: 'g' },
      { n: 'PDF Tools', s: 'g' },
      { n: 'File Converter', s: 'g' },
      { n: 'Private Pastebin', s: 'g' },
      { n: 'Subscription Tracker', s: 'g' },
      { n: 'Task Tracker', s: 'g' },
      { n: 'Media Utility', s: 'g' },
    ]},
    { id: 'bc-notes', title: 'NOTES & DOCS', accent: 'amber', svcs: [
      { n: 'Notes App', s: 'g' },
      { n: 'Code Browser', s: 'g' },
      { n: 'CMS Sandbox', s: 'g' },
      { n: 'Document Archive', s: 'g' },
    ]},
    { id: 'bc-db', title: 'DATA LAYER', accent: 'gray', sub: true, svcs: [
      { n: 'Identity Database', s: 'g' },
      { n: 'Photo Database', s: 'g' },
      { n: 'App Database', s: 'g' },
      { n: 'Bookmark Database', s: 'g' },
      { n: 'Analytics Database', s: 'g' },
      { n: 'Document Cache', s: 'g' },
      { n: 'Identity Cache', s: 'g' },
      { n: 'App Cache', s: 'g' },
      { n: 'Shared Cache', s: 'g' },
      { n: 'Relational Database', s: 'g' },
      { n: 'Wiki Database', s: 'g' },
      { n: 'Search Index', s: 'g' },
    ]},
  ],

  mac_models: [
    { n: 'General LLM', sz: 'large' },
    { n: 'Vision LLM', sz: 'large' },
    { n: 'Reasoning LLM', sz: 'medium' },
    { n: 'Code LLM', sz: 'medium' },
    { n: 'Lightweight LLM', sz: 'small' },
    { n: 'Embedding Model', sz: 'small' },
  ],

  mac_services: [
    { n: 'Local LLM API', s: 'g', star: true },
    { n: 'Image Workflow UI', s: 'g' },
    { n: 'AI Chat UI', s: 'g' },
  ],

  tailscale: [
    { n: 'batcave', ip: 'mesh core', os: 'Linux', s: 'on', role: 'core' },
    { n: 'Backup VPS', ip: 'mesh edge', os: 'exit node', s: 'on', role: 'edge' },
    { n: 'Device 1', ip: 'mesh ai', os: 'macOS · direct', s: 'on', role: 'ai' },
    { n: 'Device 2', ip: 'mesh mobile', os: 'Android', s: 'idle' },
    { n: 'Device 3', ip: 'mesh mobile', os: 'Android', s: 'idle' },
    { n: 'Device 4', ip: 'mesh mobile', os: 'iOS', s: 'idle' },
    { n: 'Device 5', ip: '—', os: 'offline 1d', s: 'off' },
    { n: 'Device 6', ip: '—', os: 'offline 19h', s: 'off' },
    { n: 'Device 7', ip: 'relay blr', os: 'offline 5d', s: 'off' },
    { n: 'Device 8', ip: '—', os: 'offline 1d', s: 'off' },
  ],
};
