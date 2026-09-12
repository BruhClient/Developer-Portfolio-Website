"use client";

/*
  A Japanese Chin, sitting on the rug beside the desk chair.

  Built from boxes rather than loaded from the pack, for the same reason the
  cross by the bed is: the pack has 107 models and not one animal in it. The
  shape is simple enough that primitives are honest rather than a workaround,
  and flat Lambert colour keeps it in the same voxel language as the furniture -
  a smooth, detailed dog would read as the one thing in the room that came from
  somewhere else.

  Four things carry the breed at this size, and they are the only reason the
  proportions below look wrong for a dog in general: a muzzle so short and broad
  it barely leaves the face, eyes set wide and low on it, drop ears that hang
  past the jaw, and a plumed tail arched forward over the back. Drop any one of
  them and it is a generic small dog. A snout of any length is the worst
  offender - it turns a Chin into a chihuahua.

  Sitting, not lying: a toy breed is 20-27cm at the shoulder, and curled on the
  floor beside a chair 0.65 tall it would be a brown smudge behind a chair leg.
  Sitting up buys the height that makes it readable from the camera's angle.

  It is scenery: no binding, no sign, nothing to click. scene.ts keeps exactly
  six objects clickable, one per section, and a seventh sign saying "Dog" would
  point at nothing.
*/

/*
  Brown-and-white, which is what "brown" means on this breed - Chins are
  parti-coloured, never solid. The chestnut sits in patches over the ears, the
  skull and the saddle, and everything else is the white ground showing through.
*/
const WHITE = "#f2ebe0";
const BROWN = "#7c4a2a";
const DARK = "#241a15";

/*
  Where it sits, and which way it looks.

  The camera looks in over the open +x/+z corner, so `facing` is a yaw into that
  quadrant - square on at 45, and a little under that here so the dog reads as
  sitting with the desk rather than posing for the room.

  The position is the front-right corner of the blue rug, which is the one patch
  of the projects zone that is floor rather than furniture: clear of the chair
  at x -0.85, clear of the briefcase at z -1.35, and inside the rug on all four
  sides. Chin.test.ts asserts each of those rather than trusting this comment.
*/
const AT = { x: -0.28, y: 0, z: -0.78 };
const FACING = 40;

/** Nose to tail plume, ear to ear, floor to crown. */
const SIZE = { w: 0.22, h: 0.28, d: 0.3 };

const DEG = Math.PI / 180;

export function Chin() {
  return (
    <group position={[AT.x, AT.y, AT.z]} rotation={[0, FACING * DEG, 0]} name="projects:chin">
      {/* Haunches on the floor, and the thighs bulging either side of them. */}
      <mesh position={[0, 0.08, -0.08]}>
        <boxGeometry args={[0.185, 0.16, 0.155]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`thigh-${side}`} position={[side * 0.085, 0.055, -0.035]}>
          <boxGeometry args={[0.05, 0.11, 0.13]} />
          <meshLambertMaterial color={WHITE} />
        </mesh>
      ))}
      {/* The saddle patch, sitting on top of the rump. */}
      <mesh position={[0, 0.163, -0.075]}>
        <boxGeometry args={[0.15, 0.022, 0.135]} />
        <meshLambertMaterial color={BROWN} />
      </mesh>

      {/* Chest, carried high and upright - this is a dog sitting to attention. */}
      <mesh position={[0, 0.135, 0.035]}>
        <boxGeometry args={[0.16, 0.145, 0.125]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>

      {/* Front legs straight down under the chest, with paws on the floor. */}
      {[-1, 1].map((side) => (
        <group key={`foreleg-${side}`}>
          <mesh position={[side * 0.052, 0.05, 0.082]}>
            <boxGeometry args={[0.048, 0.1, 0.05]} />
            <meshLambertMaterial color={WHITE} />
          </mesh>
          <mesh position={[side * 0.052, 0.018, 0.105]}>
            <boxGeometry args={[0.052, 0.036, 0.062]} />
            <meshLambertMaterial color={WHITE} />
          </mesh>
        </group>
      ))}

      {/* Skull, broad and domed, in chestnut. */}
      <mesh position={[0, 0.225, 0.055]}>
        <boxGeometry args={[0.15, 0.105, 0.115]} />
        <meshLambertMaterial color={BROWN} />
      </mesh>
      <mesh position={[0, 0.272, 0.05]}>
        <boxGeometry args={[0.115, 0.03, 0.09]} />
        <meshLambertMaterial color={BROWN} />
      </mesh>
      {/* The white blaze up the centre of the face, between the eyes. */}
      <mesh position={[0, 0.235, 0.113]}>
        <boxGeometry args={[0.03, 0.085, 0.012]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>

      {/*
        The muzzle. 3cm of it, which is the whole point: a Chin's face is flat,
        and anything longer here reads as a different dog entirely.
      */}
      <mesh position={[0, 0.205, 0.118]}>
        <boxGeometry args={[0.072, 0.048, 0.032]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.218, 0.138]}>
        <boxGeometry args={[0.03, 0.024, 0.012]} />
        <meshLambertMaterial color={DARK} />
      </mesh>

      {/* Eyes: large, round, and set wide apart low on the face. */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.046, 0.24, 0.108]}>
          <boxGeometry args={[0.03, 0.032, 0.012]} />
          <meshLambertMaterial color={DARK} />
        </mesh>
      ))}

      {/* Feathered drop ears, hanging past the jaw either side of the skull. */}
      {[-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.083, 0.19, 0.035]}>
          <boxGeometry args={[0.026, 0.14, 0.092]} />
          <meshLambertMaterial color={BROWN} />
        </mesh>
      ))}

      {/*
        The plumed tail, arched forward over the back rather than hanging. It
        has to stay BELOW the crown and well behind the skull: level with the
        head, from the camera's angle, it reads as a white block balanced on
        the dog rather than as a tail.
      */}
      <mesh position={[0, 0.165, -0.14]}>
        <boxGeometry args={[0.045, 0.07, 0.05]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 0.2, -0.095]}>
        <boxGeometry args={[0.09, 0.055, 0.135]} />
        <meshLambertMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

/*
  A guard rather than a comment: the dog is positioned by hand against furniture
  that could move, and a toy breed is small enough to vanish behind any of it
  without anything in the render saying so.
*/
export const CHIN_PLACEMENT = { at: AT, facing: FACING, size: SIZE } as const;
