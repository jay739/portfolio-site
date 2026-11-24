import {
  BATCAVE_CONTAINERS,
  HOMELAB_STATS_URL,
  readStatField,
} from "../homelab-stats";

/**
 * readStatField decides whether the badge prints the published number or falls
 * back to a compiled-in one, so every rejection path matters: a payload that
 * slips through as a string or a float would render a badge like
 * "63.5 containers" or "[object Object] containers".
 */
describe("readStatField", () => {
  const payload = {
    docs_updated: "2026-11-24",
    batcave_containers: 63,
    homelab_containers: 87,
    services_declared: 62,
    https_sites: 38,
    hosts: 4,
  };

  it("reads a positive integer field", () => {
    expect(readStatField(payload, "batcave_containers")).toBe(63);
    expect(readStatField(payload, "homelab_containers")).toBe(87);
    expect(readStatField(payload, "hosts")).toBe(4);
  });

  it("returns null when the field is absent", () => {
    expect(readStatField({ hosts: 4 }, "batcave_containers")).toBeNull();
  });

  it("returns null for a numeric string rather than coercing it", () => {
    expect(
      readStatField({ batcave_containers: "63" }, "batcave_containers"),
    ).toBeNull();
  });

  it("returns null for a non-integer", () => {
    expect(
      readStatField({ batcave_containers: 63.5 }, "batcave_containers"),
    ).toBeNull();
    expect(
      readStatField({ batcave_containers: NaN }, "batcave_containers"),
    ).toBeNull();
    expect(
      readStatField({ batcave_containers: Infinity }, "batcave_containers"),
    ).toBeNull();
  });

  it("returns null for zero or negative counts", () => {
    expect(
      readStatField({ batcave_containers: 0 }, "batcave_containers"),
    ).toBeNull();
    expect(
      readStatField({ batcave_containers: -3 }, "batcave_containers"),
    ).toBeNull();
  });

  it("returns null for a payload that is not an object", () => {
    expect(readStatField(null, "batcave_containers")).toBeNull();
    expect(readStatField(undefined, "batcave_containers")).toBeNull();
    expect(readStatField("63", "batcave_containers")).toBeNull();
    expect(readStatField(63, "batcave_containers")).toBeNull();
  });
});

describe("compiled-in fallbacks", () => {
  it("exposes a usable container count", () => {
    expect(Number.isInteger(BATCAVE_CONTAINERS)).toBe(true);
    expect(BATCAVE_CONTAINERS).toBeGreaterThan(0);
  });

  it("points at the published file on main, not a branch tip", () => {
    expect(HOMELAB_STATS_URL).toBe(
      "https://raw.githubusercontent.com/jay739/jay739/main/profile/homelab-stats.json",
    );
  });
});
