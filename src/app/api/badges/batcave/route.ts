import { NextResponse } from "next/server";
import {
  BATCAVE_CONTAINERS,
  HOMELAB_STATS_URL,
  readStatField,
} from "@/data/homelab-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const AMBER = "F59E0B";
const RED = "DC2626";
const CACHE_MS = 60_000;

/**
 * How long a successfully read container count is reused. This is the window in
 * the B-1 acceptance line: an edit to `profile/homelab-stats.json` shows up on
 * the badge within STATS_CACHE_MS, plus whatever shields.io caches on top.
 */
const STATS_CACHE_MS = 300_000;
const STATS_TIMEOUT_MS = 2500;
const NETDATA_TIMEOUT_MS = 2500;

interface BadgeBody {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  labelColor: string;
  cacheSeconds: number;
}

let cache: { value: BadgeBody; expires: number } | null = null;
let statsCache: { value: number; expires: number } | null = null;

/**
 * Operator override, read once at module load. It wins over the compiled-in
 * constant but loses to the published stats file, so setting it is a way to
 * correct the badge without waiting for a deploy, not a way to pin it.
 */
const ENV_CONTAINER_COUNT = Number(process.env.BATCAVE_CONTAINER_COUNT) || 0;

function fallbackContainerCount(): number {
  return ENV_CONTAINER_COUNT || BATCAVE_CONTAINERS;
}

/**
 * Read `batcave_containers` from the published stats file.
 *
 * Returns null on any failure (network, non-200, malformed JSON, missing or
 * non-positive field). The caller substitutes a fallback, so a broken raw host
 * degrades the number's freshness and never the badge itself.
 */
async function readPublishedContainerCount(): Promise<number | null> {
  try {
    const res = await fetch(HOMELAB_STATS_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(STATS_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return readStatField(await res.json(), "batcave_containers");
  } catch {
    return null;
  }
}

/**
 * Resolve the count to print, preferring the published file and falling back to
 * the environment variable, then the compiled-in constant.
 *
 * A fallback is cached for the short badge window rather than the full stats
 * window, so a transient fetch failure retries within a minute instead of
 * pinning a stale number for five.
 */
async function resolveContainerCount(): Promise<number> {
  if (statsCache && statsCache.expires > Date.now()) return statsCache.value;

  const published = await readPublishedContainerCount();
  const value = published ?? fallbackContainerCount();
  const ttl = published === null ? CACHE_MS : STATS_CACHE_MS;

  statsCache = { value, expires: Date.now() + ttl };
  return value;
}

async function probeNetdataAlive(): Promise<boolean> {
  const netdataUrl = process.env.NETDATA_URL || "https://metrics.jay739.dev";
  const apiKey = process.env.NETDATA_API_KEY;
  if (!apiKey) return false;

  const [username, password] = apiKey.split(":");
  if (!username || !password) return false;

  const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  try {
    const res = await fetch(`${netdataUrl}/api/v1/info`, {
      headers: { Authorization: `Basic ${basicAuth}`, Accept: "*/*" },
      signal: AbortSignal.timeout(NETDATA_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.value, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  }

  const [alive, containers] = await Promise.all([
    probeNetdataAlive(),
    resolveContainerCount(),
  ]);

  const body: BadgeBody = alive
    ? {
        schemaVersion: 1,
        label: "batcave",
        message: `${containers} containers · up`,
        color: AMBER,
        labelColor: "0F172A",
        cacheSeconds: 60,
      }
    : {
        schemaVersion: 1,
        label: "batcave",
        message: "status unavailable",
        color: RED,
        labelColor: "0F172A",
        cacheSeconds: 60,
      };

  cache = { value: body, expires: Date.now() + CACHE_MS };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
