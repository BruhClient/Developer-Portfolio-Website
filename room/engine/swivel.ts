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
