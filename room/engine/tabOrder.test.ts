import { describe, expect, test } from "vitest";
import { INTERACTIVE, SCENE } from "../data/scene";
import { ZONE_ORDER } from "../data/zones";
import { tabOrder } from "./tabOrder";

describe("tabOrder", () => {
  test("visits the six sections in the spec's order", () => {
    const zoneOf = new Map(SCENE.map((p) => [p.id, p.zone]));
    const seen: string[] = [];
    for (const id of tabOrder()) {
      const zone = zoneOf.get(id)!;
      if (seen[seen.length - 1] !== zone) seen.push(zone);
    }
    expect(seen).toEqual([...ZONE_ORDER]);
  });

  test("includes every interactive prop exactly once", () => {
    const order = tabOrder();
    expect(order).toHaveLength(INTERACTIVE.length);
    expect(new Set(order).size).toBe(order.length);
  });

  test("never includes scenery", () => {
    const scenery = new Set(SCENE.filter((p) => !p.binding).map((p) => p.id));
    expect(tabOrder().filter((id) => scenery.has(id))).toEqual([]);
  });

  test("keeps manifest order within a zone, so Tab moves the way the eye does", () => {
    const inZone = INTERACTIVE.filter((p) => p.zone === "hackathons").map((p) => p.id);
    const tabbed = tabOrder().filter((id) => inZone.includes(id));
    expect(tabbed).toEqual(inZone);
  });
});
