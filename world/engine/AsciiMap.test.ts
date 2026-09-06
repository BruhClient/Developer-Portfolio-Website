import { describe, expect, test } from "vitest";
import { parseAsciiMap } from "./AsciiMap";

// '#' is wall, '.' is floor, '@' is the spawn point (and is walkable).
const rows = ["###", "#@#", "###"];

describe("parseAsciiMap", () => {
  test("sizes the map from the grid and the tile size", () => {
    expect(parseAsciiMap(rows, 16).size).toEqual({ width: 48, height: 48 });
  });

  test("makes one solid per wall tile, placed on the grid", () => {
    const { solids } = parseAsciiMap(rows, 16);

    expect(solids).toHaveLength(8);
    expect(solids).toContainEqual({ x: 0, y: 0, w: 16, h: 16 });
    expect(solids).toContainEqual({ x: 32, y: 32, w: 16, h: 16 });
    // The centre tile is the spawn, so it must not be solid.
    expect(solids).not.toContainEqual({ x: 16, y: 16, w: 16, h: 16 });
  });

  test("spawns the player in the centre of the marked tile", () => {
    expect(parseAsciiMap(rows, 16).spawn).toEqual({ x: 24, y: 24 });
  });
});
