import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { anchorsFrom, type TiledMap } from "../engine/TiledMap";
import { anchorsOfKind, overflowCount, type AnchorKind } from "./slots";

/*
  The guard that keeps the world honest against the content.

  Everything else in this suite tests logic in isolation. This one reads the map
  that actually ships and the arrays that actually render, so the day a fifth
  project is added to a four desk room the build stops and says so, instead of
  quietly dropping that project off the site.
*/
const map: TiledMap = JSON.parse(
  readFileSync("public/world-assets/map.json", "utf8"),
);
const anchors = anchorsFrom(map);

const CONTENT: { kind: AnchorKind; items: unknown[] }[] = [
  { kind: "project", items: PROJECTS },
  { kind: "hackathon", items: HACKATHONS },
  { kind: "experience", items: EXPERIENCE },
  { kind: "certificate", items: CERTIFICATES },
];

const KNOWN_REFS = new Set([
  "npc:travis",
  "action:resume",
  "action:contact",
  "action:credits",
  "action:socials",
  "about:portrait",
  "about:toolkit",
]);

describe("world map covers the content", () => {
  test.each(CONTENT)("every $kind has somewhere to appear", ({ kind, items }) => {
    const spare = anchorsOfKind(anchors, kind).length - items.length;

    expect(
      overflowCount(anchors, kind, items),
      `${items.length} ${kind} entries but only ${anchorsOfKind(anchors, kind).length} anchors in map.json. ` +
        `Add ${kind} anchors in Tiled, see world/map/README.md.`,
    ).toBe(0);
    expect(spare).toBeGreaterThanOrEqual(0);
  });

  test("every anchor is either a content slot or a known ref", () => {
    // Catches a typo made in Tiled, where a misspelled ref would otherwise be
    // an object that silently does nothing when the player walks up to it.
    const unknown = anchors.filter(
      (anchor) =>
        !anchor.kind && (!anchor.ref || !KNOWN_REFS.has(anchor.ref)),
    );

    expect(unknown.map((a) => a.name ?? a.ref)).toEqual([]);
  });

  test("anchors are named, since names decide content order", () => {
    expect(anchors.filter((anchor) => !anchor.name)).toEqual([]);
  });

  test("the map declares a spawn point", () => {
    const spawn = map.layers
      .flatMap((layer) => layer.objects ?? [])
      .filter((object) => object.name === "spawn");

    expect(spawn).toHaveLength(1);
  });
});
