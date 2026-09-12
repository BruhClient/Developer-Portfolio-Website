import { describe, expect, test } from "vitest";
import { CHIN_PLACEMENT } from "./Chin";
import { SCENE } from "../data/scene";
import { ZONES } from "../data/zones";

/*
  The dog is placed by hand on the floor of the projects zone, and everything
  keeping it there is a relationship to furniture that could move. A toy breed
  is small enough to disappear behind any of it, which is the failure this
  guards: not a crash, just a dog nobody can see.

  Sizes are measured from the vendored FBX files and divided by MODEL_SCALE,
  the same way room/data/wallArt.test.ts does it.
*/
const SIZE: Record<string, { w: number; d: number }> = {
  chair: { w: 0.325, d: 0.35 },
  briefcase_black: { w: 0.325, d: 0.325 },
  carpet_blue: { w: 1.55, d: 2.1 },
};

const DEG = Math.PI / 180;

interface Box {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

/** The axis-aligned floor box something covers, once its own yaw is applied. */
function boxOf(w: number, d: number, rotationY: number, x: number, z: number): Box {
  const c = Math.abs(Math.cos(rotationY * DEG));
  const s = Math.abs(Math.sin(rotationY * DEG));
  const halfX = (w / 2) * c + (d / 2) * s;
  const halfZ = (w / 2) * s + (d / 2) * c;
  return { x0: x - halfX, x1: x + halfX, z0: z - halfZ, z1: z + halfZ };
}

function propBox(id: string): Box {
  const prop = SCENE.find((p) => p.id === id)!;
  const { w, d } = SIZE[prop.model];
  return boxOf(w, d, prop.rotationY, prop.position.x, prop.position.z);
}

function chinBox(): Box {
  const { at, facing, size } = CHIN_PLACEMENT;
  return boxOf(size.w, size.d, facing, at.x, at.z);
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1;

describe("the Japanese Chin by the desk", () => {
  test("sits on the floor", () => {
    expect(CHIN_PLACEMENT.at.y).toBe(0);
  });

  /*
    A Chin is a toy breed - 20 to 27cm at the shoulder. Sitting, it is a little
    taller than that. If this ever grows past a foot it has stopped being the
    breed that was asked for.
  */
  test("is the size of a toy breed", () => {
    expect(CHIN_PLACEMENT.size.h).toBeGreaterThan(0.2);
    expect(CHIN_PLACEMENT.size.h).toBeLessThan(0.3);
  });

  test("is not inside the desk chair", () => {
    expect(overlaps(chinBox(), propBox("projects:chair"))).toBe(false);
  });

  test("is not inside the briefcase", () => {
    expect(overlaps(chinBox(), propBox("projects:briefcase"))).toBe(false);
  });

  /*
    On the rug, not beside it. The rug is what marks this corner out as the
    projects zone, and a dog sitting on the bare boards next to it reads as
    having wandered out of the scene.
  */
  test("sits on the projects rug", () => {
    const zone = ZONES.projects;
    const { w, d } = SIZE[zone.carpet];
    const rug = boxOf(w, d, 0, zone.origin.x, zone.origin.z);
    const chin = chinBox();
    expect(chin.x0).toBeGreaterThan(rug.x0);
    expect(chin.x1).toBeLessThan(rug.x1);
    expect(chin.z0).toBeGreaterThan(rug.z0);
    expect(chin.z1).toBeLessThan(rug.z1);
  });

  /*
    The camera looks in over the open +x/+z corner, so a dog facing anywhere in
    that quadrant shows its face. Facing away would hide the flat muzzle, the
    wide-set eyes and the drop ears - which is the entire breed.
  */
  test("faces the open corner, so the camera sees its face", () => {
    expect(CHIN_PLACEMENT.facing).toBeGreaterThan(0);
    expect(CHIN_PLACEMENT.facing).toBeLessThan(90);
  });
});
