import { describe, expect, test } from "vitest";
import {
  FRAME_H,
  FRAME_W,
  facingFrom,
  frameAt,
  sliceDirectional,
} from "./CharacterSprite";

describe("sliceDirectional", () => {
  test("cuts an idle sheet into one frame per direction, in pack order", () => {
    const frames = sliceDirectional(1);

    // LimeZu sheets run right, up, left, down across a single row.
    expect(frames.right).toEqual([{ x: 0, y: 0, w: FRAME_W, h: FRAME_H }]);
    expect(frames.up).toEqual([{ x: 16, y: 0, w: FRAME_W, h: FRAME_H }]);
    expect(frames.left).toEqual([{ x: 32, y: 0, w: FRAME_W, h: FRAME_H }]);
    expect(frames.down).toEqual([{ x: 48, y: 0, w: FRAME_W, h: FRAME_H }]);
  });

  test("cuts a 24 frame run sheet into six frames per direction", () => {
    const frames = sliceDirectional(6);

    expect(frames.right).toHaveLength(6);
    expect(frames.right[0].x).toBe(0);
    expect(frames.right[5].x).toBe(80);
    // Down is the fourth block, so it starts at frame 18.
    expect(frames.down[0].x).toBe(288);
  });
});

describe("facingFrom", () => {
  test("faces the way it is moving", () => {
    expect(facingFrom({ x: 1, y: 0 }, "down")).toBe("right");
    expect(facingFrom({ x: 0, y: -1 }, "down")).toBe("up");
  });

  test("prefers the horizontal frame when moving diagonally", () => {
    // Sideways sprites read better than back/front ones on a diagonal.
    expect(facingFrom({ x: 0.707, y: 0.707 }, "down")).toBe("right");
  });

  test("keeps the last facing when standing still", () => {
    expect(facingFrom({ x: 0, y: 0 }, "left")).toBe("left");
  });
});

describe("frameAt", () => {
  test("starts on the first frame", () => {
    expect(frameAt(0, 6, 10)).toBe(0);
  });

  test("advances at the given frame rate", () => {
    // 10fps is 100ms a frame, so 250ms in is the third frame.
    expect(frameAt(250, 6, 10)).toBe(2);
  });

  test("loops back round at the end of the cycle", () => {
    expect(frameAt(650, 6, 10)).toBe(0);
  });
});
