import type { Direction } from "./CharacterSprite";

export interface Positioned {
  x: number;
  y: number;
}

const FACING_VECTORS: Record<Direction, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

/**
 * The thing the player would interact with if they pressed E right now: the
 * closest item within `radius` that lies in the direction they are facing.
 *
 * Facing is part of the test rather than distance alone, so standing with your
 * back to a computer does not offer to open it. Anything at or behind the
 * player's shoulder line is excluded.
 */
export function nearestInteractable<T extends Positioned>(
  player: Positioned,
  facing: Direction,
  items: T[],
  radius: number,
): T | null {
  const forward = FACING_VECTORS[facing];
  let best: T | null = null;
  let bestDistance = Infinity;

  for (const item of items) {
    const dx = item.x - player.x;
    const dy = item.y - player.y;

    if (dx * forward.x + dy * forward.y <= 0) continue;

    const distance = Math.hypot(dx, dy);
    if (distance > radius || distance >= bestDistance) continue;

    best = item;
    bestDistance = distance;
  }

  return best;
}
