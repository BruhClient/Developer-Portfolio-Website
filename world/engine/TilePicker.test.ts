import { describe, expect, test } from "vitest";
import { WALL_FACE, WALL_TOP, floorTileFor, wallTileFor } from "./TilePicker";

describe("floorTileFor", () => {
  test("tiles the 3x2 floor pattern across the room", () => {
    // The pattern block is three tiles wide and two tall, so column 3 must
    // restart the block rather than run off its right edge.
    expect(floorTileFor(0, 0, "room")).toEqual(floorTileFor(3, 0, "room"));
    expect(floorTileFor(0, 0, "room")).toEqual(floorTileFor(0, 2, "room"));
    expect(floorTileFor(0, 0, "room")).not.toEqual(floorTileFor(1, 0, "room"));
    expect(floorTileFor(0, 0, "room")).not.toEqual(floorTileFor(0, 1, "room"));
  });

  test("uses a different block for the corridor than the rooms", () => {
    expect(floorTileFor(0, 0, "corridor")).not.toEqual(
      floorTileFor(0, 0, "room"),
    );
  });
});

describe("wallTileFor", () => {
  const wallEverywhere = () => true;
  const floorBelow = (_c: number, r: number) => r === 0;

  test("shows the wall face when there is floor directly below", () => {
    const face = wallTileFor(0, 0, floorBelow);
    const top = wallTileFor(0, 0, wallEverywhere);

    expect(face).not.toEqual(top);
  });

  test("shows the wall top when the tile below is also wall", () => {
    // Two stacked wall tiles: the upper one is seen from above, so it must not
    // be drawn with the face texture used for the bottom edge of a room.
    expect(wallTileFor(0, 0, wallEverywhere)).toEqual(WALL_TOP);
    expect(wallTileFor(0, 0, floorBelow)).toEqual(WALL_FACE);
  });
});
