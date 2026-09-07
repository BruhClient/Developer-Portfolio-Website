/*
  Where the camera sits at each level.

  Pure maths on purpose. The rig in CameraRig.tsx does the tweening and owns the
  three.js objects; everything decidable without a renderer is decided here so it
  can be tested in a node environment, matching the convention in vitest.config.ts.
*/
/*
  Deliberately the same shape as RoomState's own level, and deliberately not
  imported from it: this module is pure maths and stays free of the store.

  There was a third, "zone", framing a single corner. Only the establishing
  sweep ever asked for it, and the sweep is gone - the signs tell a visitor
  what is in the room without the camera having to show them.
*/
export type Level = "home" | "item";

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
  How much air to leave around the subject, as a multiple of the distance at
  which it exactly fills the frame. Home shows the whole room; item fills the
  frame with one object.
*/
const PADDING: Record<Level, number> = {
  home: 1.9,
  item: 1.15,
};

/*
  Home's padding when it is the WIDTH that has to fit - a phone held upright.

  Smaller than the landscape 1.9, and not an inconsistency. `radius` is one
  number standing in for a room that is much wider on screen than it is tall,
  so 1.9 is really "enough air that the room's width also lands", spent against
  the vertical fit. Applied to the horizontal fit as well it pays for the same
  margin twice and strands the room as a postage stamp in the middle of a tall
  screen. 1.35 leaves the room filling most of the width with the signs inside
  the frame, which is the thing the number exists to buy.
*/
const PADDING_HOME_PORTRAIT = 1.7;

/*
  Where the room's centre should sit on a portrait screen.

  Not 0.5, because the room's geometric centre is not the centre of the six
  things worth looking at. Five of them cluster around the desk and the bed;
  the sixth is the door, out at the far corner on its own. Measured at 390px,
  that puts the midpoint of the six signs about 11% of the screen width right
  of the point the camera is aimed at - so centring the floor leaves a margin
  of empty carpet down the left and pushes the door's sign off the right edge.

  Aiming a little left of the room's centre puts the SIGNS in the middle
  instead, which is what a visitor is actually looking at, and buys back enough
  width that the framing does not have to retreat to fit the door in.

  Landscape keeps 0.5: there the width is not the binding axis and there is
  slack on both sides, so the composition is free to sit where it was tuned.
*/
const ANCHOR_HOME_PORTRAIT_X = 0.42;

export function framingFor(
  level: Level,
  bounds: Bounds,
  viewport: Viewport,
  fovDegrees: number,
): Framing {
  const halfFov = (fovDegrees / 2) * (Math.PI / 180);

  /*
    three.js takes a VERTICAL field of view, so the horizontal one narrows with
    the viewport and a portrait screen is the narrow case. Fitting only the
    height is why the room used to run off both sides of a phone: measured at
    390px, two of the six signs - About Me and Contact Me, the ends of the
    room - sat outside the viewport entirely, so a third of the site's
    navigation was invisible on the device most people would arrive on.

    Dividing by the aspect when it is under 1 fits the width instead. Keyed on
    the viewport's shape rather than on isMobile(), because this is a question
    about the frame, not the device: a tablet held upright clipped Contact Me
    too, at 768px, on the far side of that breakpoint.
  */
  const aspect = viewport.width / viewport.height;
  const fit = Math.min(1, aspect);
  const padding =
    level === "home" && fit < 1 ? PADDING_HOME_PORTRAIT : PADDING[level];

  const distance = (bounds.radius / (Math.tan(halfFov) * fit)) * padding;

  let screenAnchor = { x: 0.5, y: 0.5 };
  if (level === "item") {
    // Only the item level has a panel to make room for.
    screenAnchor = isMobile(viewport)
      ? { x: 0.5, y: 0.25 } // centre of the top half, above the bottom sheet
      : { x: 0.275, y: 0.5 }; // centre of the left 55%, beside the panel
  } else if (fit < 1) {
    screenAnchor = { x: ANCHOR_HOME_PORTRAIT_X, y: 0.5 };
  }

  return { target: bounds.center, distance, screenAnchor };
}
