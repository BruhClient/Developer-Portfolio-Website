import { describe, expect, test } from "vitest";
import { applyDrag, clampSwivel, SWIVEL_LIMITS } from "./swivel";

describe("clampSwivel", () => {
  test("leaves a swivel inside the cone alone", () => {
    expect(clampSwivel({ yaw: 10, pitch: -5 })).toEqual({ yaw: 10, pitch: -5 });
  });

  test("clamps yaw at both limits", () => {
    expect(clampSwivel({ yaw: 90, pitch: 0 }).yaw).toBe(SWIVEL_LIMITS.yawMax);
    expect(clampSwivel({ yaw: -90, pitch: 0 }).yaw).toBe(SWIVEL_LIMITS.yawMin);
  });

  test("clamps pitch asymmetrically, since looking up hits the missing ceiling first", () => {
    expect(clampSwivel({ yaw: 0, pitch: 45 }).pitch).toBe(SWIVEL_LIMITS.pitchMax);
    expect(clampSwivel({ yaw: 0, pitch: -45 }).pitch).toBe(SWIVEL_LIMITS.pitchMin);
  });

  test("the cone never lets the missing walls rotate into view", () => {
    // The two front walls are absent, so anything past +-35 yaw shows the void.
    expect(SWIVEL_LIMITS.yawMax).toBe(35);
    expect(SWIVEL_LIMITS.yawMin).toBe(-35);
  });
});

describe("applyDrag", () => {
  test("turns horizontal pixels into yaw degrees", () => {
    expect(applyDrag({ yaw: 0, pitch: 0 }, 40, 0, 0.25).yaw).toBe(10);
  });

  test("dragging down looks down", () => {
    expect(applyDrag({ yaw: 0, pitch: 0 }, 0, 40, 0.25).pitch).toBe(-10);
  });

  test("accumulates onto the current swivel", () => {
    expect(applyDrag({ yaw: 10, pitch: 0 }, 40, 0, 0.25).yaw).toBe(20);
  });

  test("clamps as it accumulates, so a long drag cannot escape the cone", () => {
    expect(applyDrag({ yaw: 30, pitch: 0 }, 400, 0, 0.25).yaw).toBe(35);
  });
});
