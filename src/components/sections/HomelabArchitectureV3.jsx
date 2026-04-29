// variant3.jsx — V3: Operations Command (live mission HUD)
// Cinematic, dark, radial. Clock-shaped central command with a topology
// rose. Live event ticker, traffic readout, pulsing pings. Most "live"
// of the three. Aspect: full-screen ops console.
'use client';

import React from 'react';
import { HOMELAB } from '@/data/homelab-architecture';
import {
  ACCENT,
  Scanlines,
  Vignette,
  useClock,
  useCount,
  useJitter,
  useTick,
} from './homelabHudHooks';

const V3_C = {
  bg: '#02030a',
  panel: 'rgba(6, 8, 16, 0.92)',
  ink: '#e3e8f0',
  inkDim: '#cbd5e1',
  inkFaint: '#94a3b8',
  red: '#ff3a4a',
  amber: '#f4a261',
  green: '#4cf0a4',
  cyan: '#5ed3f3',
  purple: '#c89ef0',
  rule: 'rgba(180, 200, 230, 0.10)',
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
};

// Animated event ticker
function V3Ticker() {
  const [events, setEvents] = React.useState(() => [
    { t: '-04s', c: V3_C.green, m: 'media service · background job complete' },
    { t: '-12s', c: V3_C.purple, m: 'mesh network · Device 4 -> batcave handshake ok' },
    { t: '-21s', c: V3_C.cyan, m: 'private dns · filtering active · sampled window' },
    { t: '-38s', c: V3_C.amber, m: 'dynamic dns · restart cycle · backoff active' },
    { t: '-44s', c: V3_C.green, m: 'vpn tunneller · egress path healthy' },
    { t: '-58s', c: V3_C.green, m: 'media automation · queue item processed' },
    { t: '-1m12s', c: V3_C.cyan, m: 'identity gateway · trusted mesh login' },
    { t: '-1m41s', c: V3_C.amber, m: 'Backup VPS · backup volume threshold event' },
  ]);
  const samples = [
    { c: V3_C.green, m: 'media service · client session opened' },
    { c: V3_C.purple, m: 'mesh network · keepalive · node quorum healthy' },
    { c: V3_C.cyan, m: 'private dns · query filtering within baseline' },
    { c: V3_C.green, m: 'update watcher · container scan clean' },
    { c: V3_C.green, m: 'photo library · ml indexing complete' },
    { c: V3_C.amber, m: 'disk health · pre-fail counter steady' },
    { c: V3_C.green, m: 'music service · nightly scan complete' },
    { c: V3_C.cyan, m: 'local ai · inference worker healthy' },
    { c: V3_C.green, m: 'reverse proxy · certificate window healthy' },
    { c: V3_C.purple, m: 'image workflow · queue idle' },
  ];
  React.useEffect(() => {
    const id = setInterval(() => {
      setEvents(prev => {
        const next = samples[Math.floor(Math.random() * samples.length)];
        return [{ t: 'now', c: next.c, m: next.m }, ...prev.slice(0, 9)];
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {events.map((e, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '62px 8px 1fr', alignItems: 'center', gap: 8,
          fontSize: 12, fontFamily: V3_C.mono,
          opacity: 1 - i * 0.07, color: V3_C.ink,
          padding: '3px 0', animation: i === 0 ? 'hl-fade-in 0.4s ease' : 'none',
        }}>
          <span style={{ color: V3_C.inkFaint, fontVariantNumeric: 'tabular-nums' }}>{e.t}</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: e.c, boxShadow: `0 0 6px ${e.c}` }} />
          <span style={{ color: V3_C.ink }}>{e.m}</span>
        </div>
      ))}
    </div>
  );
}

// Sparkline
function V3Spark({ color, h = 20, w = 80, seed = 1 }) {
  const tick = useTick(1500);
  const pts = React.useMemo(() => {
    const n = 24;
    return Array.from({ length: n }, (_, i) => {
      const x = (i / (n - 1)) * w;
      const noise = Math.sin(i * 0.7 + seed + tick * 0.3) * 0.4
                  + Math.sin(i * 0.3 + seed * 2) * 0.3
                  + (Math.random() - 0.5) * 0.2;
      const y = h / 2 + noise * (h / 2 - 1);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [tick, seed, w, h]);
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" opacity="0.85"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}

// Compact host pod
function V3HostPod({ host, color, glyph, role, metrics, side }) {
  return (
    <div style={{
      background: V3_C.panel, border: `1px solid ${color}55`,
      borderRadius: 8, padding: 14,
      boxShadow: `0 0 30px ${color}18, inset 0 0 50px ${color}06`,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 24, color }}>{glyph}</span>
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '2px', color }}>{host.name}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 9.5, color: V3_C.inkFaint, letterSpacing: '1.2px' }}>{role}</span>
      </div>
      <div style={{ fontSize: 10.5, color: V3_C.inkDim, fontFamily: V3_C.mono, marginBottom: 10, lineHeight: 1.5 }}>
        {host.codename} · {host.ip}<br />
        ts {host.ts}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {metrics.map(m => (
          <div key={m.l}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>{m.l}</span>
              <span style={{ fontSize: 12.5, color: m.c, fontFamily: V3_C.mono, fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{m.v}</span>
            </div>
            <V3Spark color={m.c} w={120} h={14} seed={m.seed} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Service pill (compact)
function V3Pill({ s }) {
  const c = s.s === 'g' ? V3_C.green : s.s === 'a' ? V3_C.amber : V3_C.red;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontFamily: V3_C.mono,
      padding: '3px 7px', borderRadius: 3,
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
      color: V3_C.ink, whiteSpace: 'nowrap', margin: '1px 1px',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}`,
        animation: s.s === 'a' ? 'hl-pulse-a 0.9s ease-in-out infinite' : 'none' }} />
      {s.n}
    </span>
  );
}

function V3() {
  const D = HOMELAB;
  const ramPct = useJitter(74, 4, 2200);
  const loadVal = useJitter(5.25, 0.5, 1800);
  const cachePct = useJitter(82, 1, 3000);
  const reqs = useCount(2_184_392, 5);
  const blocked = useCount(31_405, 3);
  const inMbps = useJitter(48.2, 12, 1600);
  const outMbps = useJitter(112.4, 30, 1600);
  const tokSec = useJitter(34, 4, 1500);
  const clock = useClock('iso');

  return (
    <div style={{
      position: 'relative', width: 1780, minHeight: 1180,
      background: V3_C.bg,
      backgroundImage: [
        'radial-gradient(circle at 50% 38%, rgba(255,58,74,0.10) 0%, transparent 40%)',
        'radial-gradient(circle at 18% 60%, rgba(94,211,243,0.05) 0%, transparent 50%)',
        'radial-gradient(circle at 82% 62%, rgba(200,158,240,0.05) 0%, transparent 50%)',
        'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: 'auto, auto, auto, 36px 36px, 36px 36px',
      fontFamily: V3_C.mono, color: V3_C.ink, overflow: 'hidden',
    }}>

      {/* Top bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '14px 28px', borderBottom: `1px solid ${V3_C.red}33`,
        background: 'rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: V3_C.inkDim, letterSpacing: '1.2px' }}>
          <span style={{ color: V3_C.red, fontWeight: 700 }}>● MISSION LIVE</span>
          <span>OP / HOMELAB</span>
          <span style={{ color: V3_C.inkFaint }}>·</span>
          <span>SECTOR / EARTH-2</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 22, letterSpacing: '7px', color: V3_C.red, fontWeight: 800,
            textShadow: `0 0 22px ${V3_C.red}99`,
          }}>OPERATIONS COMMAND</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: V3_C.inkDim, letterSpacing: '1.2px' }}>
          <span style={{ color: V3_C.green }}>● UPLINK</span> &nbsp;·&nbsp; <span style={{ color: V3_C.green }}>● MESH</span> &nbsp;·&nbsp; <span style={{ color: V3_C.green }}>● DNS</span> &nbsp;·&nbsp; {clock} <span style={{ color: V3_C.inkFaint }}>UTC</span>
        </div>
      </div>

      {/* 3-column main: left telemetry / center map / right telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: 18, padding: '18px 22px' }}>

        {/* LEFT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <V3HostPod host={D.hosts.oci} color={V3_C.cyan} glyph="◐" role="EDGE / EXIT"
            metrics={[
              { l: 'CACHE', v: `${cachePct.toFixed(0)}%`, c: V3_C.amber, seed: 1 },
              { l: 'CPU', v: '12%', c: V3_C.green, seed: 2 },
              { l: 'NET IN', v: `${inMbps.toFixed(1)}M`, c: V3_C.cyan, seed: 3 },
              { l: 'DNS Q/S', v: '47', c: V3_C.purple, seed: 4 },
            ]}
          />

          {/* PiHole pod */}
          <div style={{
            background: V3_C.panel, border: `1px solid ${V3_C.purple}44`, borderRadius: 8, padding: 14,
            boxShadow: `0 0 22px ${V3_C.purple}14`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '1.7px', color: V3_C.purple }}>⌬ PRIVATE DNS</span>
              <span style={{ fontSize: 9.5, color: V3_C.inkFaint }}>mesh only</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div>
                <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>BLOCKED · 24h</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: V3_C.purple, fontVariantNumeric: 'tabular-nums' }}>
                  {blocked.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>BLOCK RATE</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: V3_C.green, fontVariantNumeric: 'tabular-nums' }}>31.2%</div>
              </div>
            </div>
            <V3Spark color={V3_C.purple} w={290} h={28} seed={9} />
          </div>

          {/* Backup VPS services condensed */}
          <div style={{
            background: V3_C.panel, border: `1px solid ${V3_C.rule}`, borderRadius: 8, padding: 12,
          }}>
            <div style={{ fontSize: 10, color: V3_C.inkFaint, letterSpacing: '1.6px', marginBottom: 6 }}>BACKUP VPS · SERVICES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {D.oci_stacks.flatMap(s => s.svcs).map(s => <V3Pill key={s.n + (s.port || '')} s={s} />)}
            </div>
          </div>
        </div>

        {/* CENTER: topology + flows + batcave */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Topology rose */}
          <V3TopologyRose />

          {/* Batcave detail */}
          <div style={{
            background: V3_C.panel, border: `1px solid ${V3_C.red}55`, borderRadius: 10, padding: 16,
            boxShadow: `0 0 50px ${V3_C.red}1a, inset 0 0 80px ${V3_C.red}06`,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 32, color: V3_C.red }}>🦇</span>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '3px', color: V3_C.red }}>BATCAVE</span>
              <span style={{ fontSize: 10.5, color: V3_C.inkDim, letterSpacing: '0.8px' }}>main-server · private core LAN · mesh core node</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 10.5, color: V3_C.green }}>● {D.meta.containers} CONTAINERS HEALTHY</span>
            </div>

            {/* Live metric strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
              border: `1px solid ${V3_C.rule}`, marginBottom: 12, background: 'rgba(0,0,0,0.4)',
            }}>
              {[
                { l: 'RAM', v: `${ramPct.toFixed(0)}%`, sub: '11/16 GB', c: V3_C.amber, seed: 11 },
                { l: 'CPU LOAD', v: loadVal.toFixed(2), sub: '8-core', c: V3_C.cyan, seed: 12 },
                { l: 'DISK', v: '31%', sub: '610G/2T', c: V3_C.green, seed: 13 },
                { l: 'NET OUT', v: `${outMbps.toFixed(0)}M`, sub: 'media service', c: V3_C.red, seed: 14 },
                { l: 'UPTIME', v: '22h', sub: '0 incidents', c: V3_C.ink, seed: 15 },
              ].map((m, i) => (
                <div key={m.l} style={{
                  padding: '10px 12px',
                  borderRight: i < 4 ? `1px solid ${V3_C.rule}` : 'none',
                }}>
                  <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.2px' }}>{m.l}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: m.c, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 2 }}>{m.v}</div>
                  <div style={{ fontSize: 9.5, color: V3_C.inkFaint, marginTop: 2 }}>{m.sub}</div>
                  <div style={{ marginTop: 4 }}><V3Spark color={m.c} w={130} h={14} seed={m.seed} /></div>
                </div>
              ))}
            </div>

            {/* Service grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {D.batcave_stacks.filter(s => s.title !== 'DATA LAYER').map(s => {
                const c = ACCENT[s.accent] || V3_C.ink;
                return (
                  <div key={s.id} style={{
                    border: `1px solid ${c}33`, borderRadius: 6, padding: '8px 10px',
                    background: `linear-gradient(180deg, ${c}06, transparent 60%)`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', color: c, marginBottom: 5 }}>
                      ◢ {s.title}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {s.svcs.map(x => <V3Pill key={x.n + (x.port || '')} s={x} />)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 10, fontSize: 9.5, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>
              DB LAYER &nbsp;:&nbsp; {D.batcave_stacks.find(s => s.title === 'DATA LAYER').svcs.map(s => s.n).join(' · ')}
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <V3HostPod host={D.hosts.mac} color={V3_C.purple} glyph="◉" role="AI / LOCAL"
            metrics={[
              { l: 'TOK / S', v: tokSec.toFixed(0), c: V3_C.purple, seed: 21 },
              { l: 'GPU MEM', v: '11.4G', c: V3_C.amber, seed: 22 },
              { l: 'CPU', v: '38%', c: V3_C.cyan, seed: 23 },
              { l: 'TEMP', v: '54°C', c: V3_C.green, seed: 24 },
            ]}
          />

          {/* Loaded model classes */}
          <div style={{
            background: V3_C.panel, border: `1px solid ${V3_C.purple}33`, borderRadius: 8, padding: 12,
          }}>
            <div style={{ fontSize: 10, color: V3_C.purple, letterSpacing: '1.6px', marginBottom: 6, fontWeight: 700 }}>
              ⊕ LOCAL AI · MODEL CLASSES
            </div>
            {D.mac_models.map(m => (
              <div key={m.n} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 11.5, padding: '4px 0', borderBottom: `1px dotted ${V3_C.rule}`,
                fontFamily: V3_C.mono,
              }}>
                <span style={{ color: V3_C.ink }}>{m.n}</span>
                <span style={{ color: V3_C.inkDim, fontVariantNumeric: 'tabular-nums' }}>{m.sz}</span>
              </div>
            ))}
          </div>

          {/* Tailscale mesh */}
          <div style={{
            background: V3_C.panel, border: `1px solid ${V3_C.purple}33`, borderRadius: 8, padding: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, color: V3_C.purple, letterSpacing: '1.6px', fontWeight: 700 }}>⬡ MESH · 10 NODES</span>
              <span style={{ fontSize: 10, color: V3_C.inkFaint }}>3 act · 3 idle · 4 off</span>
            </div>
            {D.tailscale.map(d => (
              <div key={d.n} style={{
                display: 'grid', gridTemplateColumns: '8px 1fr auto',
                alignItems: 'center', gap: 8, padding: '3px 0',
                fontSize: 11, opacity: d.s === 'off' ? 0.4 : 1,
                borderBottom: `1px dotted ${V3_C.rule}`,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: d.s === 'on' ? V3_C.green : d.s === 'idle' ? V3_C.amber : V3_C.inkFaint,
                  boxShadow: d.s !== 'off' ? `0 0 5px ${d.s === 'on' ? V3_C.green : V3_C.amber}` : 'none',
                  animation: d.s === 'on' ? 'hl-pulse-g 2.4s ease-in-out infinite' : 'none',
                }} />
                <span style={{ color: V3_C.ink, fontFamily: V3_C.mono }}>{d.n}</span>
                <span style={{ color: V3_C.inkFaint, fontFamily: V3_C.mono, fontSize: 10 }}>{d.os}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: live event ticker + traffic readout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18,
        padding: '0 22px 28px',
      }}>
        <div style={{
          background: V3_C.panel, border: `1px solid ${V3_C.rule}`, borderRadius: 8, padding: 14,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', color: V3_C.green }}>
              ▶ SANITIZED EVENT STREAM
            </span>
            <span style={{ fontSize: 10, color: V3_C.inkFaint }}>simulated signals · auto-refresh 3.5s</span>
          </div>
          <V3Ticker />
        </div>
        <div style={{
          background: V3_C.panel, border: `1px solid ${V3_C.rule}`, borderRadius: 8, padding: 14,
        }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '2px', color: V3_C.cyan, marginBottom: 8 }}>
            ◈ TRAFFIC · LAST 60s
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>INGRESS · WEB EDGE</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: V3_C.cyan, fontVariantNumeric: 'tabular-nums' }}>{inMbps.toFixed(1)} <span style={{ fontSize: 11.5, color: V3_C.inkFaint }}>Mb/s</span></div>
              <V3Spark color={V3_C.cyan} w={170} h={26} seed={31} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>EGRESS · MEDIA SERVICE</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: V3_C.red, fontVariantNumeric: 'tabular-nums' }}>{outMbps.toFixed(0)} <span style={{ fontSize: 11.5, color: V3_C.inkFaint }}>Mb/s</span></div>
              <V3Spark color={V3_C.red} w={170} h={26} seed={32} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>PUBLIC REQ · 24h</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: V3_C.green, fontVariantNumeric: 'tabular-nums' }}>{reqs.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: V3_C.inkFaint, letterSpacing: '1.1px' }}>DNS BLOCKED</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: V3_C.purple, fontVariantNumeric: 'tabular-nums' }}>{blocked.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <Vignette strength={0.55} />
      <Scanlines opacity={0.04} />
    </div>
  );
}

// Topology rose: central radial diagram showing the 3 hosts + internet + mesh
function V3TopologyRose() {
  const W = 1080, H = 240;
  const cx = W / 2, cy = H / 2;
  const tick = useTick(2000);

  const nodes = [
    { id: 'inet', label: 'INTERNET', sub: '*.jay739.dev', x: cx - 460, y: cy, color: V3_C.red, glyph: '☁' },
    { id: 'oci',  label: 'BACKUP VPS',  sub: 'edge / exit', x: cx - 230, y: cy, color: V3_C.cyan, glyph: '◐' },
    { id: 'bvc',  label: 'BATCAVE',  sub: 'core',         x: cx,       y: cy, color: V3_C.red, glyph: '🦇', big: true },
    { id: 'mac',  label: 'AI NODE', sub: 'local inference',  x: cx + 230, y: cy, color: V3_C.purple, glyph: '◉' },
    { id: 'ts',   label: 'MESH',     sub: '10 nodes',    x: cx + 460, y: cy, color: V3_C.purple, glyph: '⬡' },
  ];

  const links = [
    { from: 0, to: 1, c: V3_C.red, dur: 2.0, label: 'PUBLIC' },
    { from: 0, to: 2, c: V3_C.red, dur: 2.4, dash: '0', label: 'PUBLIC' },
    { from: 1, to: 2, c: V3_C.purple, dur: 2.6, dash: '4 3', label: 'TS' },
    { from: 2, to: 3, c: V3_C.purple, dur: 2.2, dash: '4 3', label: 'TS' },
    { from: 3, to: 4, c: V3_C.purple, dur: 2.6, dash: '4 3', label: 'TS' },
    { from: 2, to: 4, c: V3_C.purple, dur: 3.2, dash: '4 3', label: 'TS' },
  ];

  const linkPath = (a, b) => {
    if (a.y === b.y) {
      // arc above
      const mx = (a.x + b.x) / 2;
      const my = a.y - Math.abs(b.x - a.x) * 0.18;
      return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    }
    return `M${a.x},${a.y} L${b.x},${b.y}`;
  };

  return (
    <div style={{
      background: V3_C.panel, border: `1px solid ${V3_C.rule}`, borderRadius: 10,
      padding: '14px 18px', position: 'relative',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '2px', color: V3_C.cyan }}>◈ TOPOLOGY</span>
        <span style={{ fontSize: 10, color: V3_C.inkFaint }}>real-time / packet flow</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', maxHeight: 240 }}>
        <defs>
          <radialGradient id="v3-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e63946" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* concentric range rings around batcave */}
        {[60, 120, 180, 240].map(r => (
          <circle key={r} cx={cx} cy={cy} r={r}
            fill="none" stroke={V3_C.rule} strokeDasharray="2 6" strokeWidth="0.7" />
        ))}
        {/* radar sweep */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'hl-radar 6s linear infinite' }}>
          <path d={`M${cx},${cy} L${cx + 240},${cy} A240,240 0 0,1 ${cx + 169.7},${cy + 169.7} Z`}
            fill={`url(#v3-glow)`} opacity="0.4" />
        </g>

        {/* glow under batcave */}
        <circle cx={cx} cy={cy} r="80" fill="url(#v3-glow)" />

        {/* links */}
        {links.map((l, i) => {
          const a = nodes[l.from], b = nodes[l.to];
          const d = linkPath(a, b);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={l.c} strokeWidth="1.4" opacity="0.4"
                strokeDasharray={l.dash || 'none'} />
              <circle r="4.5" fill={l.c} style={{ filter: `drop-shadow(0 0 7px ${l.c})` }}>
                <animateMotion dur={`${l.dur}s`} repeatCount="indefinite" path={d} />
              </circle>
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map(n => (
          <g key={n.id} transform={`translate(${n.x},${n.y})`}>
            <circle r={n.big ? 46 : 30} fill={V3_C.bg} stroke={n.color} strokeWidth="1.8" />
            <circle r={n.big ? 46 : 30} fill="none" stroke={n.color} strokeWidth="0.8" opacity="0.4">
              <animate attributeName="r" values={`${n.big ? 46 : 30};${n.big ? 66 : 48};${n.big ? 46 : 30}`} dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <text textAnchor="middle" dy="8" fontSize={n.big ? 34 : 24} fill={n.color}>{n.glyph}</text>
            <text textAnchor="middle" dy={n.big ? 70 : 52} fontSize="13" fontFamily={V3_C.mono} fontWeight="700" fill={V3_C.ink} letterSpacing="1.6">{n.label}</text>
            <text textAnchor="middle" dy={n.big ? 88 : 68} fontSize="11" fontFamily={V3_C.mono} fill={V3_C.inkFaint}>{n.sub}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default V3;
