/*
  Tile choices into `room-builder.png`, in tile coordinates.

  The pack draws floors as 3x2 repeating blocks and walls as a two row pair: an
  upper row seen from above and a lower row that is the face you look at from
  inside the room. Indices were read off the sheet and checked for full opacity,
  so none of these land on a transparent cell.
*/
export interface TileRef {
  c: number;
  r: number;
}

export type FloorKind = "room" | "corridor";

const FLOOR_BLOCKS: Record<FloorKind, TileRef> = {
  room: { c: 11, r: 11 }, // plain pale slabs; the patterned blocks read as rugs
  corridor: { c: 14, r: 11 }, // darker grey, so the corridor reads as circulation
};

/** Solid dark ceiling block, seen looking down on a wall from above. */
export const WALL_TOP: TileRef = { c: 12, r: 0 };
/** Lit wall face, seen from inside a room looking at its far wall. */
export const WALL_FACE: TileRef = { c: 14, r: 0 };

/** Picks the floor tile for a cell, repeating the 3x2 block across the room. */
export function floorTileFor(
  col: number,
  row: number,
  kind: FloorKind,
): TileRef {
  const origin = FLOOR_BLOCKS[kind];
  return {
    c: origin.c + (((col % 3) + 3) % 3),
    r: origin.r + (((row % 2) + 2) % 2),
  };
}

/**
 * Picks the wall tile for a cell. A wall with floor under it is being viewed
 * from the front, so it gets the face texture; anything else is being viewed
 * from above and gets the top.
 */
export function wallTileFor(
  col: number,
  row: number,
  isWall: (c: number, r: number) => boolean,
): TileRef {
  return isWall(col, row + 1) ? WALL_TOP : WALL_FACE;
}
