import { describe, expect, test } from "vitest";
import { GUITAR_PLACEMENT } from "./Guitar";
import { SCENE, WALL_FACE } from "../data/scene";

/*
  The guitar leans on a wall whose face is a measured constant, in the one gap
  on that wall wide enough to take it. Nothing in the render would complain if
  it ended up buried in the plaster, standing in the middle of the floor, or
  growing out of the bed - so the relationships that hold it there are stated
  here instead.

  Sizes are measured from the vendored FBX files and divided by MODEL_SCALE, the
  same way room/data/wallArt.test.ts does it. To re-measure, load a model with
  FBXLoader and read Box3.setFromObject(...).getSize().
*/
const SIZE: Record<string, { w: number; d: number }> = {
  file_cabinet: { w: 0.5, d: 0.225 },
  bedsingle: { w: 1.1, d: 0.575 },
};

const DEG = Math.PI / 180;

/** The axis-aligned floor box a prop covers, once its own yaw is applied. */
function footprint(id: string) {
  const prop = SCENE.find((p) => p.id === id)!;
  const { w, d } = SIZE[prop.model];
  const c = Math.abs(Math.cos(prop.rotationY * DEG));
  const s = Math.abs(Math.sin(prop.rotationY * DEG));
  const halfX = (w / 2) * c + (d / 2) * s;
  const halfZ = (w / 2) * s + (d / 2) * c;
  return {
    x0: prop.position.x - halfX,
    x1: prop.position.x + halfX,
    z0: prop.position.z - halfZ,
    z1: prop.position.z + halfZ,
  };
}

/** How far along z the leaning guitar reaches, at its widest. */
function guitarSpan() {
  const { at, bodyWidth } = GUITAR_PLACEMENT;
  return { z0: at.z - bodyWidth / 2, z1: at.z + bodyWidth / 2 };
}

describe("the guitar against the left wall", () => {
  test("stands on the floor rather than floating", () => {
    expect(GUITAR_PLACEMENT.at.y).toBe(0);
  });

  test("leans back onto the wall without passing through it", () => {
    const { at, lean, height, topThickness } = GUITAR_PLACEMENT;
    // The headstock is the part nearest the wall; its back corner is the first
    // thing that would clip through.
    const back =
      at.x - height * Math.sin(lean * DEG) - (topThickness / 2) * Math.cos(lean * DEG);
    expect(back).toBeGreaterThan(WALL_FACE);
    // And close enough to be resting on it, not propped in mid-air.
    expect(back - WALL_FACE).toBeLessThan(0.08);
  });

  test("has its foot out from the wall, which is what leaning means", () => {
    expect(GUITAR_PLACEMENT.at.x).toBeGreaterThan(WALL_FACE + 0.15);
  });

  test("sits in the gap between the file cabinet and the bed", () => {
    const guitar = guitarSpan();
    expect(guitar.z0).toBeGreaterThan(footprint("experience:cabinet").z1);
    expect(guitar.z1).toBeLessThan(footprint("about:bed").z0);
  });

  test("is inside the room", () => {
    expect(Math.abs(GUITAR_PLACEMENT.at.z)).toBeLessThan(GUITAR_PLACEMENT.roomHalf);
  });
});
