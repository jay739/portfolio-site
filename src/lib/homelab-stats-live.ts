import {
  BATCAVE_CONTAINERS,
  HOMELAB_STATS_URL,
  readStatField,
} from "@/data/homelab-stats";

/**
 * Live read of the published homelab figures, shared by every surface that
 * quotes them.
 *
 * This exists because the badge and the AI Tools page both print the container
 * count and drifted apart: the badge read the published file while the page used
 * the compiled-in constant, so when bookstack-db was removed the page said 63
 * and the badge said 62. One module means one number.
 *
 * The cache is per server process and module level, so the badge route and the
 * page's API route share it rather than each holding their own.
 */

/** How long a successful read is reused. The freshness window for all callers. */
const STATS_CACHE_MS = 300_000;

/**
 * How long a fallback is reused. Deliberately much shorter, so a transient
 * raw.githubusercontent.com failure retries within a minute instead of pinning
 * a stale number for the full window.
 */
const RETRY_CACHE_MS = 60_000;

const STATS_TIMEOUT_MS = 2500;

export type StatSource = "published" | "env" | "fallback";

export interface LiveContainerCount {
  value: number;
  source: StatSource;
}

let cache: { value: LiveContainerCount; expires: number } | null = null;

/**
 * Operator override, read once at module load. It beats the compiled-in constant
 * but loses to the published file, so it corrects the number without a deploy
 * rather than pinning it.
 */
const ENV_CONTAINER_COUNT = Number(process.env.BATCAVE_CONTAINER_COUNT) || 0;

function fallback(): LiveContainerCount {
  return ENV_CONTAINER_COUNT
    ? { value: ENV_CONTAINER_COUNT, source: "env" }
    : { value: BATCAVE_CONTAINERS, source: "fallback" };
}

/**
 * Read `batcave_containers` from the published stats file.
 *
 * Returns null on any failure (network, non-200, malformed JSON, missing or
 * non-positive field) so every caller degrades the number's freshness rather
 * than its own response.
 */
async function readPublished(): Promise<number | null> {
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

/** Resolve the count, preferring the published file, then the env var, then the constant. */
export async function getBatcaveContainers(): Promise<LiveContainerCount> {
  if (cache && cache.expires > Date.now()) return cache.value;

  const published = await readPublished();
  const resolved: LiveContainerCount =
    published === null ? fallback() : { value: published, source: "published" };

  cache = {
    value: resolved,
    expires:
      Date.now() + (published === null ? RETRY_CACHE_MS : STATS_CACHE_MS),
  };
  return resolved;
}
