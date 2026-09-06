import { describe, expect, test } from "vitest";
import type { Anchor } from "../engine/TiledMap";
import { anchorsOfKind, assignSlots, overflowCount } from "./slots";

const anchor = (name: string, kind?: string, ref?: string): Anchor => ({
  x: 0,
  y: 0,
  name,
  kind,
  ref,
});

const anchors: Anchor[] = [
  anchor("project-2", "project"),
  anchor("project-1", "project"),
  anchor("hackathon-1", "hackathon"),
  anchor("resume", undefined, "action:resume"),
];

describe("anchorsOfKind", () => {
  test("keeps only the anchors of the kind asked for", () => {
    expect(anchorsOfKind(anchors, "project").map((a) => a.name)).toEqual([
      "project-1",
      "project-2",
    ]);
  });

  test("orders by name so the map's editing order cannot shuffle content", () => {
    // Dragging an object in Tiled reorders the file. Names decide the order so
    // the first project is always the desk you named project-1.
    const shuffled = [anchor("project-10", "project"), anchor("project-2", "project")];

    expect(anchorsOfKind(shuffled, "project").map((a) => a.name)).toEqual([
      "project-2",
      "project-10",
    ]);
  });
});

describe("assignSlots", () => {
  test("pairs each item with the anchor of the same position", () => {
    const pairs = assignSlots(anchors, "project", ["first", "second"]);

    expect(pairs).toEqual([
      { anchor: anchor("project-1", "project"), item: "first" },
      { anchor: anchor("project-2", "project"), item: "second" },
    ]);
  });

  test("leaves spare anchors unfilled rather than repeating content", () => {
    expect(assignSlots(anchors, "project", ["only"])).toHaveLength(1);
  });
});

describe("overflowCount", () => {
  test("is zero when every item has an anchor", () => {
    expect(overflowCount(anchors, "project", ["a", "b"])).toBe(0);
  });

  test("counts items that would not appear in the world at all", () => {
    expect(overflowCount(anchors, "project", ["a", "b", "c"])).toBe(1);
  });
});
