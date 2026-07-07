// Resolves which host to hit for a given AI backend (Ollama or ComfyUI).
//
// The RTX box runs these on demand only (powered off most of the time to save
// power), so it is tried first and cached as down for a short TTL on failure —
// this avoids paying a multi-second connect timeout on every request while the
// box is off. The Mac Mini runs 24/7 and is the fallback.

export type FailoverService = "ollama" | "comfyui";

interface HostPair {
  primary: string;
  fallback: string;
}

interface HealthState {
  host: string | null; // null until first check
  checkedAt: number;
}

const HEALTH_CHECK_TIMEOUT_MS = 2_000;
const HEALTH_CACHE_TTL_MS = 60_000;

const health = new Map<FailoverService, HealthState>();

// Env vars are fixed for the process lifetime, so compute these once.
const HOST_PAIRS: Record<FailoverService, HostPair> = {
  ollama: {
    primary: process.env.OLLAMA_ENDPOINT_RTX ?? "http://100.103.184.119:11434",
    fallback: process.env.OLLAMA_ENDPOINT ?? "http://100.104.170.37:11434",
  },
  comfyui: {
    primary: process.env.COMFYUI_ENDPOINT_RTX ?? "http://100.103.184.119:8188",
    fallback: process.env.COMFYUI_ENDPOINT ?? "http://100.104.170.37:8188",
  },
};

const PING_PATH: Record<FailoverService, string> = {
  ollama: "/api/tags",
  comfyui: "/system_stats",
};

async function isReachable(
  baseUrl: string,
  pingPath: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}${pingPath}`, {
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Returns the base URL to use for the given service: the RTX box if it
 * responded within the last HEALTH_CACHE_TTL_MS, otherwise the Mac Mini.
 */
export async function resolveHost(service: FailoverService): Promise<string> {
  const { primary, fallback } = HOST_PAIRS[service];
  const cached = health.get(service);
  const now = Date.now();

  if (cached && now - cached.checkedAt < HEALTH_CACHE_TTL_MS) {
    return cached.host ?? fallback;
  }

  const reachable = await isReachable(primary, PING_PATH[service]);
  health.set(service, { host: reachable ? primary : null, checkedAt: now });
  return reachable ? primary : fallback;
}

/** Force the next resolveHost() call for this service to re-check immediately. */
export function invalidateHost(service: FailoverService): void {
  health.delete(service);
}

/** The fallback (always-on) host for a service, for use in retry-on-failure paths. */
export function fallbackHost(service: FailoverService): string {
  return HOST_PAIRS[service].fallback;
}

export type ComputeLabel = "rtx" | "apple-silicon";

/**
 * Classifies a resolved base URL as whichever physical box handled the
 * request, so the UI can show the visitor which hardware actually rendered
 * their result (the RTX box vs. the always-on Mac Mini).
 */
export function hostLabel(
  service: FailoverService,
  host: string,
): ComputeLabel {
  return host === HOST_PAIRS[service].primary ? "rtx" : "apple-silicon";
}

/**
 * Runs `attempt` against the resolved host for `service`; if it throws or
 * returns a falsy/not-ok result, invalidates the cached health state and
 * retries once against the always-on fallback host (skipped if the resolved
 * host was already the fallback, to avoid hitting the same dead host twice).
 *
 * `attempt` should itself decide whether a given Response is acceptable
 * (e.g. check `.ok`) and return null/throw to signal a failure worth
 * failing over from.
 */
export async function withFailover<T>(
  service: FailoverService,
  attempt: (host: string) => Promise<T | null>,
): Promise<T | null> {
  const host = await resolveHost(service);
  try {
    const result = await attempt(host);
    if (result !== null) return result;
  } catch {
    // fall through to fallback retry
  }

  invalidateHost(service);
  const fallback = fallbackHost(service);
  if (fallback === host) return null;
  try {
    return await attempt(fallback);
  } catch {
    return null;
  }
}
