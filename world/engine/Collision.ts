export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

/**
 * Moves `body` by (dx, dy) and resolves it out of any solid it would end up
 * inside.
 *
 * The axes are resolved separately, X first and then Y, which is what lets the
 * player slide along a wall instead of sticking to it: a diagonal push into a
 * vertical wall loses its X component and keeps its Y.
 */
export function moveAndCollide(
  body: Rect,
  dx: number,
  dy: number,
  solids: Rect[],
): { x: number; y: number } {
  let x = body.x + dx;
  let y = body.y;

  for (const solid of solids) {
    if (!overlaps({ x, y, w: body.w, h: body.h }, solid)) continue;
    if (dx > 0) x = solid.x - body.w;
    else if (dx < 0) x = solid.x + solid.w;
  }

  y += dy;

  for (const solid of solids) {
    if (!overlaps({ x, y, w: body.w, h: body.h }, solid)) continue;
    if (dy > 0) y = solid.y - body.h;
    else if (dy < 0) y = solid.y + solid.h;
  }

  return { x, y };
}
