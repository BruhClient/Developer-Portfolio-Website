import { describe, expect, test } from "vitest";
import {
  anchorsFrom,
  collisionFrom,
  spawnFrom,
  tileRefFromGid,
  type TiledMap,
  type TiledTileset,
} from "./TiledMap";

const tilesets: TiledTileset[] = [
  { firstgid: 1, columns: 17, tilecount: 391, image: "room-builder.png" },
  { firstgid: 392, columns: 16, tilecount: 1424, image: "interiors.png" },
];

describe("tileRefFromGid", () => {
  test("treats gid 0 as an empty cell", () => {
    expect(tileRefFromGid(0, tilesets)).toBeNull();
  });

  test("maps the first gid to the top left tile of its sheet", () => {
    expect(tileRefFromGid(1, tilesets)).toEqual({ sheet: 0, c: 0, r: 0 });
  });

  test("wraps to the next row after a full row of columns", () => {
    // 17 columns, so gid 18 is local id 17, the first tile of row 1.
    expect(tileRefFromGid(18, tilesets)).toEqual({ sheet: 0, c: 0, r: 1 });
    expect(tileRefFromGid(20, tilesets)).toEqual({ sheet: 0, c: 2, r: 1 });
  });

  test("picks the second tileset once past its firstgid", () => {
    expect(tileRefFromGid(392, tilesets)).toEqual({ sheet: 1, c: 0, r: 0 });
    expect(tileRefFromGid(393, tilesets)).toEqual({ sheet: 1, c: 1, r: 0 });
  });

  test("ignores the flip flags Tiled packs into the high bits", () => {
    // Tiled sets the top three bits when a tile is flipped or rotated. Left in
    // place they make the gid astronomically large and the lookup fails.
    const flippedHorizontally = 0x80000000 | 20;

    expect(tileRefFromGid(flippedHorizontally, tilesets)).toEqual({
      sheet: 0,
      c: 2,
      r: 1,
    });
  });
});

const map: TiledMap = {
  width: 4,
  height: 3,
  tilewidth: 16,
  tileheight: 16,
  tilesets,
  layers: [
    { type: "tilelayer", name: "floor", data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
    {
      type: "objectgroup",
      name: "collision",
      objects: [{ x: 0, y: 0, width: 64, height: 16 }],
    },
    {
      type: "objectgroup",
      name: "anchors",
      objects: [
        {
          x: 32,
          y: 32,
          name: "desk",
          properties: [{ name: "kind", value: "project" }],
        },
        {
          x: 16,
          y: 32,
          name: "cabinet",
          properties: [{ name: "ref", value: "action:resume" }],
        },
      ],
    },
    { type: "objectgroup", name: "spawn", objects: [{ x: 48, y: 16, name: "spawn" }] },
  ],
};

describe("collisionFrom", () => {
  test("turns the collision layer's rectangles into solids", () => {
    expect(collisionFrom(map)).toEqual([{ x: 0, y: 0, w: 64, h: 16 }]);
  });

  test("has no solids when the map has no collision layer", () => {
    expect(collisionFrom({ ...map, layers: [] })).toEqual([]);
  });
});

describe("anchorsFrom", () => {
  test("reads kind anchors that content gets slotted into", () => {
    expect(anchorsFrom(map)).toContainEqual({
      x: 32,
      y: 32,
      name: "desk",
      kind: "project",
      ref: undefined,
    });
  });

  test("reads fixed refs for objects that are not content slots", () => {
    expect(anchorsFrom(map)).toContainEqual({
      x: 16,
      y: 32,
      name: "cabinet",
      kind: undefined,
      ref: "action:resume",
    });
  });
});

describe("spawnFrom", () => {
  test("finds the spawn point", () => {
    expect(spawnFrom(map)).toEqual({ x: 48, y: 16 });
  });

  test("falls back to the middle of the map with no spawn object", () => {
    expect(spawnFrom({ ...map, layers: [] })).toEqual({ x: 32, y: 24 });
  });
});
