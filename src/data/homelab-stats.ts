/**
 * Homelab figures published by the profile repo.
 *
 * The authoritative copy lives in `jay739/jay739` at `profile/homelab-stats.json`,
 * which an hourly drift check rebuilds from the live Docker daemon and proxy
 * config. The profile README interpolates those values into its stats table, so
 * anything on this site quoting the same numbers has to agree with that file or
 * the two pages contradict each other.
 *
 * The constants below are compiled-in fallbacks, used when the published file
 * cannot be read (offline build, rate-limited raw host). Refresh them whenever
 * the published file changes materially. Values as published 2026-11-24.
 */

/** Raw URL of the published stats file. `main` only, never a branch tip. */
export const HOMELAB_STATS_URL =
  "https://raw.githubusercontent.com/jay739/jay739/main/profile/homelab-stats.json";

/** Containers running on Batcave alone. README row "Containers on Batcave". */
export const BATCAVE_CONTAINERS = 63;

/** Containers across every host on the mesh. README row "Containers across the homelab". */
export const HOMELAB_CONTAINERS = 87;

/** Compose services declared across all stacks. README row "Compose services". */
export const SERVICES_DECLARED = 62;

/** Sites served over HTTPS through the proxy. README row "HTTPS sites". */
export const HTTPS_SITES = 38;

/** Machines on the Tailscale mesh. README row "Machines on the mesh". */
export const MESH_HOSTS = 4;

/** Shape of the published stats file. Only the fields this site reads. */
export interface HomelabStats {
  batcave_containers: number;
  homelab_containers: number;
  services_declared: number;
  https_sites: number;
  hosts: number;
}

/**
 * Pull one positive integer field out of a parsed stats payload.
 *
 * Returns null rather than throwing, because every caller treats an unreadable
 * payload the same way: fall back to a known-good number. A null here means the
 * file was fetched but did not carry a usable value, which is distinct from the
 * fetch itself failing.
 */
export function readStatField(
  payload: unknown,
  field: keyof HomelabStats,
): number | null {
  if (typeof payload !== "object" || payload === null) return null;
  const raw = (payload as Record<string, unknown>)[field];
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0)
    return null;
  return raw;
}
