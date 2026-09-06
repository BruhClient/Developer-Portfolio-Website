import type { Prop } from "../data/scene";

/*
  Standing wall art up.

  The pack authors its paintings lying flat: a measured frame is 0.55 wide,
  0.02 TALL and 0.65 deep, with the picture facing +Y. That is a rug, not a
  painting, and no amount of Y-rotation will stand it up - which is why two
  passes of "try the other yaw" got two rooms with slabs jutting out of the
  walls. It needs a tilt about X first.

  `mount` carries that whole transform so the scene manifest never spells out
  raw Euler angles, and `rotationY` keeps its one meaning - which way a thing
  standing on the floor faces.
*/

/** Tilt that takes a face-up plane to a face-forward one: +Y becomes +Z. */
const STAND_UP = 90;

export type MountKind = "wall-left" | "wall-back";

export interface Mounting {
  /** Degrees about Y, applied outside the tilt. */
  yaw: number;
  /** Degrees about X, applied inside the yaw. */
  tilt: number;
}

/*
  Order matters and is not commutative, so the two angles are applied by nested
  groups rather than one Euler triple: the tilt stands the art up facing +Z,
  then the yaw turns it to face into the room.

  The back-right wall (z = -HALF) wants +Z and so takes no yaw. The back-left
  wall (x = -HALF) wants +X, and Ry(90) maps +Z to +X.
*/
export function mountingFor(prop: Pick<Prop, "rotationY" | "mount">): Mounting {
  switch (prop.mount) {
    case "wall-back":
      return { yaw: prop.rotationY, tilt: STAND_UP };
    case "wall-left":
      return { yaw: prop.rotationY + 90, tilt: STAND_UP };
    default:
      return { yaw: prop.rotationY, tilt: 0 };
  }
}
