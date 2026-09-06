/*
  Frame geometry for the LimeZu character sheets.

  Every sheet is a single row of 16x32 frames. The direction blocks run right,
  up, left, down across that row, which is the pack's standard order. The free
  and paid packs share this layout and differ only in frame size, so swapping in
  the complete pack means changing FRAME_W and FRAME_H and nothing else.
*/
export const FRAME_W = 16;
export const FRAME_H = 32;

export type Direction = "right" | "up" | "left" | "down";

export interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const SHEET_ORDER: Direction[] = ["right", "up", "left", "down"];

function sliceRow(start: number, count: number): FrameRect[] {
  return Array.from({ length: count }, (_, index) => ({
    x: (start + index) * FRAME_W,
    y: 0,
    w: FRAME_W,
    h: FRAME_H,
  }));
}

/** Cuts a sheet holding `perDirection` frames for each of the four directions. */
export function sliceDirectional(
  perDirection: number,
): Record<Direction, FrameRect[]> {
  const frames = {} as Record<Direction, FrameRect[]>;

  SHEET_ORDER.forEach((direction, block) => {
    frames[direction] = sliceRow(block * perDirection, perDirection);
  });

  return frames;
}

/**
 * The direction a character should face given how it is moving.
 *
 * Horizontal wins ties, because the side-on sprites read more clearly than the
 * front and back ones when running diagonally. Standing still keeps whatever
 * the character was already facing, so the player does not snap to a default
 * pose every time they let go of the keys.
 */
export function facingFrom(
  vector: { x: number; y: number },
  previous: Direction,
): Direction {
  if (vector.x === 0 && vector.y === 0) return previous;
  if (Math.abs(vector.x) >= Math.abs(vector.y)) {
    return vector.x > 0 ? "right" : "left";
  }
  return vector.y > 0 ? "down" : "up";
}

/** Which frame of a looping animation is showing at `elapsedMs`. */
export function frameAt(
  elapsedMs: number,
  frameCount: number,
  fps: number,
): number {
  return Math.floor(elapsedMs / (1000 / fps)) % frameCount;
}
