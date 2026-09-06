"use client";

import { ROOM, WALL_FACE } from "../data/scene";

/*
  A wooden cross on the wall by the bed.

  Built from two boxes rather than loaded from the pack, because the pack has
  no cross in it - 107 models and not one religious object - and the shape is
  simple enough that primitives are honest rather than a workaround. Chunky
  proportions and a flat material keep it in the same voxel language as the
  furniture around it; a thinner, more detailed cross would read as the one
  object in the room that came from somewhere else.

  It is scenery: no binding, no sign, nothing to click. Not everything in a
  room is a link.
*/

/** Dark walnut, so it reads as carved wood under the about zone's warm lamp. */
const WOOD = "#5c3f2a";

/* Two bars and how far the crossbar sits above centre. A cross with its arms
   at the midpoint looks like a plus sign; the arms belong in the upper third. */
const UPRIGHT = { w: 0.085, h: 0.42, d: 0.04 };
const ARMS = { w: 0.27, h: 0.085, d: 0.04 };
const ARMS_AT = 0.075;

/*
  Where it hangs. x sits a few millimetres proud of the wall's inner face -
  flush would leave the two surfaces coplanar and let depth-buffer rounding
  decide which one draws, the same flicker the rugs had against the floor.

  z 1.35 is past the head of the bed (which is centred at 0.85 and 0.575 deep)
  and clear of the poster already hanging at 0.85, so the two do not crowd each
  other. y 1.5 puts it at head height above someone sitting up.
*/
const AT = { x: WALL_FACE + 0.004, y: 1.5, z: 1.35 };

export function WallCross() {
  // The left wall faces +x, so the bars are laid out in the z-y plane and the
  // box depths run along x, into the wall.
  return (
    <group position={[AT.x, AT.y, AT.z]} name="about:cross">
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[UPRIGHT.d, UPRIGHT.h, UPRIGHT.w]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, ARMS_AT, 0]}>
        <boxGeometry args={[ARMS.d, ARMS.h, ARMS.w]} />
        <meshLambertMaterial color={WOOD} />
      </mesh>
    </group>
  );
}

/*
  A guard rather than a comment: the cross is positioned by hand against a wall
  whose face is a measured constant, and if that constant ever moves the cross
  would be left floating in the room or buried inside the plaster with nothing
  to say so. Cheap to state, and it is the kind of thing nobody re-checks.
*/
export const CROSS_PLACEMENT = { at: AT, wallFace: WALL_FACE, roomHalf: ROOM.half } as const;
