import { describe, expect, test } from "vitest";
import { moveAndCollide, type Rect } from "./Collision";

const player: Rect = { x: 100, y: 100, w: 16, h: 16 };

describe("moveAndCollide", () => {
  test("moves freely when nothing is in the way", () => {
    expect(moveAndCollide(player, 10, -5, [])).toEqual({ x: 110, y: 95 });
  });

  test("stops flush against a wall it walks into", () => {
    const wall: Rect = { x: 120, y: 90, w: 16, h: 40 };

    // Asks to move 30px right, which would overlap the wall by 26px.
    const moved = moveAndCollide(player, 30, 0, [wall]);

    // Flush against the wall's left face, not inside it and not short of it.
    expect(moved.x).toBe(104);
    expect(moved.y).toBe(100);
  });

  test("slides along a wall instead of stopping dead", () => {
    const wall: Rect = { x: 120, y: 0, w: 16, h: 400 };

    // Pushing diagonally into a vertical wall: x is blocked, y must still move.
    const moved = moveAndCollide(player, 30, 10, [wall]);

    expect(moved.x).toBe(104);
    expect(moved.y).toBe(110);
  });
});

describe("moveAndCollide, negative directions", () => {
  test("stops flush against a wall on its left", () => {
    const wall: Rect = { x: 60, y: 90, w: 16, h: 40 };

    const moved = moveAndCollide(player, -30, 0, [wall]);

    // Flush against the wall's right face at 60 + 16.
    expect(moved.x).toBe(76);
  });

  test("stops flush against a ceiling above it", () => {
    const wall: Rect = { x: 90, y: 60, w: 40, h: 16 };

    const moved = moveAndCollide(player, 0, -30, [wall]);

    expect(moved.y).toBe(76);
  });
});
