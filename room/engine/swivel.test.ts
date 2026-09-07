import { describe, expect, test } from "vitest";
import {
  applyDrag,
  beginPress,
  clampSwivel,
  DRAG_SLOP,
  movePress,
  SWIVEL_LIMITS,
} from "./swivel";

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

/*
  Telling a click apart from a drag.

  Measured before this existed: a ONE pixel pointer movement between press and
  release moved the camera 0.063 world units, because the rig turned every
  pixel into 0.25 degrees from the very first one. The room then eased toward
  that for the next fifty-odd frames, sliding whatever you were aiming at out
  from under the pointer - and a sign click that survived 2px of travel six
  times out of six survived 12px zero times out of six.
*/
describe("telling a click apart from a drag", () => {
  test("ignores the wobble of a press that never becomes a drag", () => {
    let press = beginPress(100, 100);
    for (const [x, y] of [[101, 100], [102, 101], [103, 102]] as const) {
      const step = movePress(press, x, y);
      press = step.press;
      expect(step.dx).toBe(0);
      expect(step.dy).toBe(0);
      expect(press.dragging).toBe(false);
    }
  });

  test("starts dragging once the pointer has travelled past the slop", () => {
    const press = beginPress(100, 100);
    const step = movePress(press, 100 + DRAG_SLOP, 100);
    expect(step.press.dragging).toBe(true);
  });

  /*
    The frame that crosses the threshold must not hand over the whole distance
    travelled so far, or the room jumps a slop's worth the instant a drag
    starts - which is precisely the lurch the dead zone exists to remove.
  */
  test("does not hand over the slop it swallowed when the drag begins", () => {
    const press = beginPress(100, 100);
    const step = movePress(press, 140, 100);
    expect(step.dx).toBe(0);
    expect(step.dy).toBe(0);
  });

  test("reports plain deltas once dragging, measured from the last point", () => {
    let press = movePress(beginPress(100, 100), 140, 100).press;
    const step = movePress(press, 150, 108);
    expect(step.dx).toBe(10);
    expect(step.dy).toBe(8);
    press = step.press;
    expect(movePress(press, 145, 108).dx).toBe(-5);
  });

  /*
    Diagonal wobble is the common one - a hand rolling off a mouse button moves
    on both axes - so the threshold is a radius, not a pair of limits.
  */
  test("measures the slop as a distance, not per axis", () => {
    const press = beginPress(0, 0);
    expect(movePress(press, 4, 4).press.dragging).toBe(false);
    expect(movePress(press, 5, 5).press.dragging).toBe(true);
  });

  test("stays dragging once it has started, even back inside the slop", () => {
    const press = movePress(beginPress(100, 100), 140, 100).press;
    expect(movePress(press, 100, 100).press.dragging).toBe(true);
  });
});
