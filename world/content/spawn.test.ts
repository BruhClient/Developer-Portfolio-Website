import { describe, expect, test } from "vitest";
import type { Anchor } from "../engine/TiledMap";
import { resolveSpawn, roomSpawn } from "./spawn";

const anchors: Anchor[] = [
  { x: 40, y: 40, name: "project-1", kind: "project" },
  { x: 90, y: 40, name: "project-2", kind: "project" },
  { x: 10, y: 200, name: "portrait", ref: "about:portrait" },
];

const mapSpawn = { x: 312, y: 248 };

describe("roomSpawn", () => {
  test("lands at the first anchor of a room's kind", () => {
    expect(roomSpawn(anchors, "projects")).toEqual({ x: 40, y: 40 });
  });

  test("lands at the named anchor for rooms defined by a ref", () => {
    expect(roomSpawn(anchors, "about")).toEqual({ x: 10, y: 200 });
  });

  test("is null for a room nobody has heard of", () => {
    expect(roomSpawn(anchors, "kitchen")).toBeNull();
  });

  test("is null for a known room with nothing in it yet", () => {
    // /?room=contact is a valid link even before a contact anchor is drawn.
    expect(roomSpawn(anchors, "contact")).toBeNull();
  });
});

describe("resolveSpawn", () => {
  test("an explicit room beats a remembered position", () => {
    // Following a link should take you where the link says, not where you
    // happened to be standing last time.
    expect(
      resolveSpawn({
        room: "projects",
        saved: { x: 500, y: 500 },
        anchors,
        mapSpawn,
      }),
    ).toEqual({ x: 40, y: 40 });
  });

  test("a remembered position beats the map's spawn point", () => {
    // Coming back from a project page should not teleport you to the lobby.
    expect(
      resolveSpawn({ room: null, saved: { x: 500, y: 500 }, anchors, mapSpawn }),
    ).toEqual({ x: 500, y: 500 });
  });

  test("falls back to the map's spawn point", () => {
    expect(
      resolveSpawn({ room: null, saved: null, anchors, mapSpawn }),
    ).toEqual(mapSpawn);
  });

  test("an unknown room falls through rather than stranding the player", () => {
    expect(
      resolveSpawn({ room: "kitchen", saved: null, anchors, mapSpawn }),
    ).toEqual(mapSpawn);
  });
});
