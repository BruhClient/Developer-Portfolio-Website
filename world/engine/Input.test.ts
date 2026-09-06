import { describe, expect, test } from "vitest";
import { directionVector } from "./Input";

describe("directionVector", () => {
  test("gives a unit vector for a single held key", () => {
    expect(directionVector(new Set(["d"]))).toEqual({ x: 1, y: 0 });
  });

  test("treats arrow keys the same as WASD", () => {
    expect(directionVector(new Set(["arrowup"]))).toEqual({ x: 0, y: -1 });
  });

  test("normalises diagonals so they are not faster than straight lines", () => {
    const { x, y } = directionVector(new Set(["d", "s"]));

    expect(Math.hypot(x, y)).toBeCloseTo(1);
    expect(x).toBeCloseTo(Math.SQRT1_2);
    expect(y).toBeCloseTo(Math.SQRT1_2);
  });

  test("cancels opposing keys held together", () => {
    expect(directionVector(new Set(["a", "d"]))).toEqual({ x: 0, y: 0 });
  });

  test("is still when nothing is held", () => {
    expect(directionVector(new Set())).toEqual({ x: 0, y: 0 });
  });
});
