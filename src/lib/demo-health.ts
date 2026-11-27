import { withFailover } from "@/lib/host-failover";

/**
 * Liveness checks for the three AI demos on /ai-tools, so an external monitor
 * can watch them over HTTPS without being on the tailnet.
 *
 * Two hard rules shape everything here.
 *
 * It only ever calls a backend's HEALTH endpoint. It must never start a
 * generation, a chat or a job, because the GPU hosts are the scarce resource
 * and a monitor polls forever.
 *
 * Nothing it returns may name a host, an address, a port, or repeat an upstream
 * error. The caller publishes failure text on a PUBLIC status page, so every
 * check collapses to a bare boolean and all errors are swallowed here rather
 * than propagated. That is also why the checks return booleans instead of
 * throwing: an uncaught error would reach Sentry with the URL attached.
 */

export const DEMOS = ["podcast", "chatbot", "image"] as const;
export type Demo = (typeof DEMOS)[number];

/** Per-backend budget. Kept short so a hung backend cannot stall the response. */
const CHECK_TIMEOUT_MS = 5_000;

/** How long a result is reused, so frequent polling cannot pile up load. */
const CACHE_TTL_MS = 60_000;

const PODCAST_ENDPOINT =
  process.env.PODCAST_ENDPOINT ?? "http://100.104.170.37:5050";

/** Must match the chatbot route's default, or this would check the wrong model. */
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma2:2b";

const cache = new Map<Demo, { ok: boolean; expires: number }>();

export function isDemo(value: string | null): value is Demo {
  return value !== null && (DEMOS as readonly string[]).includes(value);
}

/**
 * Is `want` present in the model names Ollama reported?
 *
 * Ollama normalises an untagged pull to `name:latest`, so a configured
 * `gemma2` legitimately appears as `gemma2:latest`. Matching the exact string
 * only would report a healthy host as down. A configured name that already
 * carries a tag is compared exactly, so `llama3.2:3b` never matches
 * `llama3.2:1b`.
 */
export function modelListed(names: readonly string[], want: string): boolean {
  if (want.includes(":")) return names.includes(want);
  return names.some((n) => n === want || n === `${want}:latest`);
}

async function checkPodcast(): Promise<boolean> {
  try {
    const res = await fetch(`${PODCAST_ENDPOINT}/web/v1/health`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const body: unknown = await res.json();
    // The backend reports its own readiness; a 200 alone is not enough.
    return (
      typeof body === "object" &&
      body !== null &&
      (body as { ok?: unknown }).ok === true
    );
  } catch {
    return false;
  }
}

async function checkChatbot(): Promise<boolean> {
  // Same resolution and failover the chatbot route uses, so this reports on the
  // host a visitor would actually reach rather than a hardcoded one.
  const result = await withFailover("ollama", async (host) => {
    const res = await fetch(`${host}/api/tags`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    const raw = (body as { models?: unknown })?.models;
    const names = Array.isArray(raw)
      ? raw
          .map((m) => (m as { name?: unknown })?.name)
          .filter((n): n is string => typeof n === "string")
      : [];
    // Returning null rather than false lets withFailover try the other host,
    // which may well have the model even when this one does not.
    return modelListed(names, OLLAMA_MODEL) ? true : null;
  });
  return result === true;
}

async function checkImage(): Promise<boolean> {
  const result = await withFailover("comfyui", async (host) => {
    const res = await fetch(`${host}/system_stats`, {
      cache: "no-store",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    return res.ok ? true : null;
  });
  return result === true;
}

const CHECKS: Record<Demo, () => Promise<boolean>> = {
  podcast: checkPodcast,
  chatbot: checkChatbot,
  image: checkImage,
};

/**
 * Cached liveness for one demo. Failures are cached for the same window as
 * successes, deliberately: a down backend is exactly the case where repeated
 * probing is least welcome.
 */
export async function getDemoHealth(demo: Demo): Promise<boolean> {
  const hit = cache.get(demo);
  if (hit && hit.expires > Date.now()) return hit.ok;

  const ok = await CHECKS[demo]();
  cache.set(demo, { ok, expires: Date.now() + CACHE_TTL_MS });
  return ok;
}

/** Test seam: drops the memo so a check runs again immediately. */
export function resetDemoHealthCache(): void {
  cache.clear();
}
