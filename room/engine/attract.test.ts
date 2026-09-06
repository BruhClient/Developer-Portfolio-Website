import { describe, expect, test } from "vitest";
import { ZONE_ORDER } from "../data/zones";
import { SWEEP_DURATION_MS, sweepAt, sweepPath } from "./attract";

describe("the establishing sweep", () => {
  test("visits all six zones, so nobody has to be told the sections exist", () => {
    const zones = sweepPath().map((s) => s.zone).filter(Boolean);
    expect(zones).toEqual([...ZONE_ORDER]);
  });

  test("visits them in the spec's order", () => {
    expect(sweepPath()[0].zone).toBe("experience");
    expect(sweepPath()[ZONE_ORDER.length - 1].zone).toBe("contact");
  });

  test("ends at home, not parked on the last zone", () => {
    const path = sweepPath();
    expect(path[path.length - 1].zone).toBeNull();
    expect(path[path.length - 1].atMs).toBe(SWEEP_DURATION_MS);
  });

  test("runs for about four seconds", () => {
    expect(SWEEP_DURATION_MS).toBe(4000);
  });

  test("stops are strictly increasing in time", () => {
    const times = sweepPath().map((s) => s.atMs);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(new Set(times).size).toBe(times.length);
  });

  test("sweepAt reports the zone the camera is on", () => {
    expect(sweepAt(0)).toBe("experience");
    expect(sweepAt(SWEEP_DURATION_MS)).toBeNull();
    expect(sweepAt(SWEEP_DURATION_MS + 500)).toBeNull();
  });
});
