/*
  Where the camera sits for each of the three levels.

  Pure maths on purpose. The rig in CameraRig.tsx does the tweening and owns the
  three.js objects; everything decidable without a renderer is decided here so it
  can be tested in a node environment, matching the convention in vitest.config.ts.
*/
export type Level = "home" | "zone" | "item";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Bounds {
  center: Vec3;
  /** Radius of the bounding sphere, in world units. */
  radius: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Framing {
  target: Vec3;
  /** How far back along the swivel direction the camera sits. */
  distance: number;
  /** Where the target should land on screen, normalised 0-1. */
  screenAnchor: { x: number; y: number };
}

/** Matches the Tailwind `md` breakpoint the panel switches layout at. */
export function isMobile(viewport: Viewport): boolean {
  return viewport.width < 768;
}

/*
  How much air to leave around the subject. Home shows the whole room, zone
  shows a cluster, item fills the frame with one object.
*/
const PADDING: Record<Level, number> = {
  home: 1.9,
  zone: 1.4,
  item: 1.15,
};

export function framingFor(
  level: Level,
  bounds: Bounds,
  viewport: Viewport,
  fovDegrees: number,
): Framing {
  const halfFov = (fovDegrees / 2) * (Math.PI / 180);
  const distance = (bounds.radius / Math.tan(halfFov)) * PADDING[level];

  // Only the item level has a panel to make room for.
  let screenAnchor = { x: 0.5, y: 0.5 };
  if (level === "item") {
    screenAnchor = isMobile(viewport)
      ? { x: 0.5, y: 0.25 } // centre of the top half, above the bottom sheet
      : { x: 0.275, y: 0.5 }; // centre of the left 55%, beside the panel
  }

  return { target: bounds.center, distance, screenAnchor };
}
