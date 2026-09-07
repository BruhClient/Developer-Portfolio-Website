/*
  The room is a cutaway box: floor, back-left wall, back-right wall, and no
  front walls at all. Free orbit would swing the camera behind the missing
  walls and show an unlit, un-art-directed void, so dragging is clamped to a
  cone that always keeps the open corner in front of the viewer.

  Degrees, not radians, because these numbers are read and tuned by hand.
*/
export interface Swivel {
  /** Horizontal, 0 is the default corner-on framing. */
  yaw: number;
  /** Vertical, 0 is the default. Positive looks up. */
  pitch: number;
}

export const SWIVEL_LIMITS = {
  yawMin: -35,
  yawMax: 35,
  /** Tighter upward: there is no ceiling, so looking up runs out of room first. */
  pitchMin: -20,
  pitchMax: 5,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampSwivel(swivel: Swivel): Swivel {
  return {
    yaw: clamp(swivel.yaw, SWIVEL_LIMITS.yawMin, SWIVEL_LIMITS.yawMax),
    pitch: clamp(swivel.pitch, SWIVEL_LIMITS.pitchMin, SWIVEL_LIMITS.pitchMax),
  };
}

/**
 * Fold a pointer drag into the current swivel. Dragging down looks down, which
 * is the direction people expect when they feel like they are turning the room
 * rather than turning their head.
 */
export function applyDrag(
  current: Swivel,
  dxPx: number,
  dyPx: number,
  degreesPerPixel = 0.25,
): Swivel {
  return clampSwivel({
    yaw: current.yaw + dxPx * degreesPerPixel,
    pitch: current.pitch - dyPx * degreesPerPixel,
  });
}

/*
  How far the pointer may travel before a press counts as a drag, in pixels.

  There was no threshold at all, and the cost was measurable: one pixel of
  movement with the button down turned the room 0.25 degrees and slid the
  camera 0.063 world units, which the rig then eased into over the next fifty
  frames. Every object and every sign moved out from under the pointer that was
  aiming at them. Sign clicks survived 2px of travel six times out of six and
  12px zero times out of six.

  Six pixels is the usual figure for this - far enough to swallow the wobble of
  a hand pressing a button, short enough that a deliberate drag still feels
  immediate.
*/
export const DRAG_SLOP = 6;

/** A pointer that is down: where it started, where it was last, and whether it
 *  has yet travelled far enough to be turning the room. */
export interface Press {
  origin: { x: number; y: number };
  last: { x: number; y: number };
  dragging: boolean;
}

export function beginPress(x: number, y: number): Press {
  return { origin: { x, y }, last: { x, y }, dragging: false };
}

/**
 * Fold a pointer move into a press, returning the movement the camera should
 * actually turn by - which is nothing at all until the slop is crossed.
 *
 * On the move that crosses it, the deltas are still zero and `last` jumps to
 * the current point. Handing over the whole distance travelled so far would
 * make the room lurch a slop's worth the instant a drag begins, which is the
 * same lurch the dead zone exists to remove.
 */
export function movePress(
  press: Press,
  x: number,
  y: number,
): { press: Press; dx: number; dy: number } {
  if (!press.dragging) {
    const travelled = Math.hypot(x - press.origin.x, y - press.origin.y);
    if (travelled < DRAG_SLOP) return { press, dx: 0, dy: 0 };
    return { press: { ...press, last: { x, y }, dragging: true }, dx: 0, dy: 0 };
  }
  return {
    press: { ...press, last: { x, y } },
    dx: x - press.last.x,
    dy: y - press.last.y,
  };
}
