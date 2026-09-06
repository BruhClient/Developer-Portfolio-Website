import { describe, expect, test } from "vitest";
import { CROSS_PLACEMENT } from "./WallCross";
import { SCENE, WALL_FACE } from "../data/scene";

/*
  The cross is placed by hand, against a wall face that is itself a measured
  constant. Nothing in the render would complain if it ended up buried in the
  plaster or hanging in mid-air, so the two relationships that matter are
  stated here instead.
*/
describe("the cross by the bed", () => {
  test("hangs just proud of the wall, not inside it and not floating", () => {
    const offset = CROSS_PLACEMENT.at.x - WALL_FACE;
    expect(offset).toBeGreaterThan(0);
    expect(offset).toBeLessThan(0.02);
  });

  test("is beside the bed rather than on top of it", () => {
    const bed = SCENE.find((p) => p.id === "about:bed")!;
    const gap = CROSS_PLACEMENT.at.z - bed.position.z;
    // bedsingle measures 0.575 deep, so half of it is 0.2875.
    expect(gap).toBeGreaterThan(0.2875);
  });

  test("does not crowd the poster already on that wall", () => {
    const poster = SCENE.find((p) => p.id === "poster:squirtle")!;
    // painting_squirtle is 0.575 across, so it reaches 0.2875 either side.
    expect(CROSS_PLACEMENT.at.z - poster.position.z).toBeGreaterThan(0.2875 + 0.11);
  });

  test("is inside the room, not past the wall it hangs on", () => {
    expect(Math.abs(CROSS_PLACEMENT.at.z)).toBeLessThan(CROSS_PLACEMENT.roomHalf);
  });
});
