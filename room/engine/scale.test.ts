import { describe, expect, test } from "vitest";
import { MODEL_SCALE } from "../data/models";
import { scaleOf } from "./scale";
import { SCENE } from "../data/scene";

describe("scaleOf", () => {
  test("an absent scale is the pack's own size", () => {
    expect(scaleOf({})).toEqual([MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]);
  });

  test("a number scales evenly, on top of MODEL_SCALE rather than instead of it", () => {
    expect(scaleOf({ scale: 2 })).toEqual([
      2 * MODEL_SCALE,
      2 * MODEL_SCALE,
      2 * MODEL_SCALE,
    ]);
  });

  test("a triple scales each of the model's own axes", () => {
    expect(scaleOf({ scale: [0.5, 1, 2] })).toEqual([
      0.5 * MODEL_SCALE,
      MODEL_SCALE,
      2 * MODEL_SCALE,
    ]);
  });

  test("the door is flattened along its thickness and nothing else", () => {
    // house_door is 0.300 x 1.875 x 0.800: a slab nearly half as thick as it
    // is wide. Squashing its height or width would make it the wrong door for
    // its own frame, so only the first axis may differ from 1.
    const door = SCENE.find((prop) => prop.id === "contact:door")!;
    const [x, y, z] = scaleOf(door);
    expect(x).toBeLessThan(y);
    expect(y).toBe(MODEL_SCALE);
    expect(z).toBe(MODEL_SCALE);
    // 0.300 thick times the squash, against the leaf's unchanged 0.800 width.
    expect((0.3 * x) / MODEL_SCALE / 0.8).toBeLessThan(0.15);
  });
});
