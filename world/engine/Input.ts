/*
  Keys are matched on the lowercased `KeyboardEvent.key`, which covers WASD and
  the arrow keys with one lookup and keeps the touch d-pad able to feed the same
  function by pushing synthetic key names into the set.
*/
const BINDINGS = {
  left: ["a", "arrowleft"],
  right: ["d", "arrowright"],
  up: ["w", "arrowup"],
  down: ["s", "arrowdown"],
} as const;

function held(keys: Set<string>, bound: readonly string[]): boolean {
  return bound.some((key) => keys.has(key));
}

/**
 * Turns the set of currently held keys into a movement vector of length 1 (or
 * 0 when still). Normalising matters: without it, holding two keys would move
 * the player diagonally at 1.41x the speed of walking straight.
 */
export function directionVector(keys: Set<string>): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (held(keys, BINDINGS.left)) x -= 1;
  if (held(keys, BINDINGS.right)) x += 1;
  if (held(keys, BINDINGS.up)) y -= 1;
  if (held(keys, BINDINGS.down)) y += 1;

  const length = Math.hypot(x, y);
  if (length === 0) return { x: 0, y: 0 };

  return { x: x / length, y: y / length };
}
