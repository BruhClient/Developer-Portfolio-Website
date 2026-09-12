"use client";

import { ROOM, WALL_FACE } from "../data/scene";

/*
  An acoustic dreadnought, leaning against the left wall at the head of the bed.

  Boxes rather than a pack model, for the same reason the cross and the dog are:
  the pack has no instrument in it. Chunky proportions and flat Lambert colour
  keep it in the room's voxel language.

  It is scenery. See scene.ts on why exactly six things in this room are
  clickable.

  Modelled standing upright along +y with its face toward +x, and tipped onto
  the wall by the group's own z rotation. Building it upright and leaning it
  once is what keeps every measurement below readable as a guitar's own
  dimensions - a dreadnought is a 0.51 body under a 0.47 neck - rather than as
  coordinates in a tilted frame.
*/

const SPRUCE = "#d8a763";
const MAHOGANY = "#8b5a33";
const ROSEWOOD = "#3b2517";
const PICKGUARD = "#b98a4e";
const SOUNDHOLE = "#241610";
const STRING = "#e0d6c0";

/*
  Where it stands, and how far it tips.

  The left wall has exactly one gap wide enough: the file cabinet's edge is at
  z -0.30 and the bed's at z 0.56, so a 0.385 body centred at 0.13 has about
  24cm clear either side.

  The lean is the number that had to be worked rather than chosen. The foot has
  to stand out from the wall or the thing is not leaning, and the headstock has
  to end up within a few centimetres of the wall or it is propped against
  nothing - and the two pull in opposite directions, because tipping it further
  to reach the wall also swings the foot out. At 0.98 tall, 12 degrees puts the
  foot 26cm off the wall and the headstock's back corner about 3cm from it.
  Guitar.test.ts asserts both ends of that rather than trusting the arithmetic
  here.
*/
const AT = { x: -2.1, y: 0, z: 0.13 };
const LEAN = 12;

/** Floor to headstock, and the widest part of the lower bout. */
const HEIGHT = 0.98;
const BODY_WIDTH = 0.385;
/** The headstock's thickness - the part that ends up nearest the plaster. */
const TOP_THICKNESS = 0.045;

const DEG = Math.PI / 180;

export function Guitar() {
  return (
    <group position={[AT.x, AT.y, AT.z]} rotation={[0, 0, LEAN * DEG]} name="about:guitar">
      {/*
        The body, as three boxes: lower bout, waist, upper bout. A dreadnought's
        waist is shallow - that is what makes it a dreadnought rather than an
        orchestra model - so the middle box is only 9cm narrower than the bottom.
      */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.115, 0.3, BODY_WIDTH]} />
        <meshLambertMaterial color={SPRUCE} />
      </mesh>
      <mesh position={[0, 0.345, 0]}>
        <boxGeometry args={[0.112, 0.09, 0.285]} />
        <meshLambertMaterial color={SPRUCE} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.11, 0.12, 0.325]} />
        <meshLambertMaterial color={SPRUCE} />
      </mesh>

      {/*
        The soundhole, and the one round thing in the room. A square hole would
        not read as a soundhole at any resolution, so this is a 12-sided cylinder
        lying on its side - chunky enough to sit with the boxes, round enough to
        be the hole. Laid a few millimetres proud of the top so the two faces are
        never coplanar; flush would leave depth-buffer rounding to decide which
        one draws, which is the flicker the rugs had against the floor.
      */}
      <mesh position={[0.058, 0.325, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.048, 0.048, 0.008, 12]} />
        <meshLambertMaterial color={SOUNDHOLE} />
      </mesh>

      <mesh position={[0.06, 0.175, 0]}>
        <boxGeometry args={[0.014, 0.038, 0.145]} />
        <meshLambertMaterial color={ROSEWOOD} />
      </mesh>

      {/*
        The pickguard. It is here to break a shape, not to be a pickguard: a
        dark disc above a dark bar on a blank slab reads as two eyes and a
        mouth, and the first render of this guitar was a face. Kept a shade off
        the spruce rather than black, so it reads as a panel and not as a
        second hole.
      */}
      <mesh position={[0.059, 0.255, -0.078]}>
        <boxGeometry args={[0.006, 0.16, 0.075]} />
        <meshLambertMaterial color={PICKGUARD} />
      </mesh>

      {/* Neck, fretboard and nut. No frets: at PIXEL_SCALE 0.85 they are
          smaller than a pixel, so they would only ever be noise on the wood. */}
      <mesh position={[0.012, 0.7, 0]}>
        <boxGeometry args={[0.055, 0.39, 0.072]} />
        <meshLambertMaterial color={MAHOGANY} />
      </mesh>
      <mesh position={[0.047, 0.7, 0]}>
        <boxGeometry args={[0.018, 0.39, 0.064]} />
        <meshLambertMaterial color={ROSEWOOD} />
      </mesh>
      <mesh position={[0.047, 0.898, 0]}>
        <boxGeometry args={[0.02, 0.012, 0.068]} />
        <meshLambertMaterial color={STRING} />
      </mesh>

      {/*
        One pale slab from bridge to nut, not six strings - six would be five
        invisible lines and a shimmer.

        Its x is the whole trick. The body's top is 2cm proud of the fretboard,
        so a run of strings laid close to the neck disappears into the body the
        moment it crosses it - which is what the first version did, leaving a
        striped neck above a blank slab. Out here it clears both, and crossing
        the soundhole is also what stops the face reading as a face.
      */}
      <mesh position={[0.066, 0.535, 0]}>
        <boxGeometry args={[0.004, 0.72, 0.036]} />
        <meshLambertMaterial color={STRING} />
      </mesh>

      {/* Headstock, with tuners standing proud either side. */}
      <mesh position={[0, 0.935, 0]}>
        <boxGeometry args={[TOP_THICKNESS, 0.09, 0.088]} />
        <meshLambertMaterial color={MAHOGANY} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`tuner-${side}`} position={[0, 0.935, side * 0.052]}>
          <boxGeometry args={[0.03, 0.055, 0.016]} />
          <meshLambertMaterial color={STRING} />
        </mesh>
      ))}
    </group>
  );
}

/*
  A guard rather than a comment. The guitar is placed by hand against a wall
  face that is itself a measured constant, in a gap defined by two pieces of
  furniture either side of it - and nothing in the render would complain if it
  ended up inside the plaster, inside the bed, or standing upright in the middle
  of the floor.
*/
export const GUITAR_PLACEMENT = {
  at: AT,
  lean: LEAN,
  height: HEIGHT,
  bodyWidth: BODY_WIDTH,
  topThickness: TOP_THICKNESS,
  wallFace: WALL_FACE,
  roomHalf: ROOM.half,
} as const;
