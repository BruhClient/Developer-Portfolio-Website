import type { Rect } from "./Collision";
import type { Size } from "./Camera";

export const WALL = "#";
export const SPAWN = "@";

export interface ParsedMap {
  size: Size;
  solids: Rect[];
  spawn: { x: number; y: number };
}

/**
 * Builds a walkable map out of an ASCII grid.
 *
 * This is the grey-box floor, and later the fixture builder for tests that need
 * a map without loading Tiled JSON. One solid per wall tile is more rectangles
 * than a merged representation would produce, but collision is checked against
 * a handful of nearby tiles, not the whole floor, so it does not matter.
 */
export function parseAsciiMap(rows: string[], tileSize: number): ParsedMap {
  const solids: Rect[] = [];
  let spawn = { x: 0, y: 0 };

  rows.forEach((row, rowIndex) => {
    [...row].forEach((cell, columnIndex) => {
      const x = columnIndex * tileSize;
      const y = rowIndex * tileSize;

      if (cell === WALL) {
        solids.push({ x, y, w: tileSize, h: tileSize });
        return;
      }

      if (cell === SPAWN) {
        spawn = { x: x + tileSize / 2, y: y + tileSize / 2 };
      }
    });
  });

  const columns = Math.max(...rows.map((row) => row.length));

  return {
    size: { width: columns * tileSize, height: rows.length * tileSize },
    solids,
    spawn,
  };
}
