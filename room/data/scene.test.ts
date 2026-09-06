import { describe, expect, test } from "vitest";
import { MODELS } from "./models";
import { ARCHITECTURE, INTERACTIVE, SCENE } from "./scene";
import { ZONE_ORDER, ZONES } from "./zones";

const models = new Set<string>(MODELS);

describe("the scene manifest", () => {
  test("every prop uses a vendored model", () => {
    const strays = [...SCENE, ...ARCHITECTURE].filter((p) => !models.has(p.model));
    expect(strays.map((p) => `${p.id} -> ${p.model}`)).toEqual([]);
  });

  test("every prop id is unique", () => {
    const ids = [...SCENE, ...ARCHITECTURE].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every prop belongs to a real zone", () => {
    const strays = [...SCENE, ...ARCHITECTURE].filter((p) => !(p.zone in ZONES));
    expect(strays.map((p) => p.id)).toEqual([]);
  });

  test("every zone has at least one interactive prop, or it is invisible to a visitor", () => {
    for (const zone of ZONE_ORDER) {
      expect(
        INTERACTIVE.filter((p) => p.zone === zone).length,
        `zone "${zone}" has nothing to click`,
      ).toBeGreaterThan(0);
    }
  });

  test("architecture is never interactive", () => {
    expect(ARCHITECTURE.filter((p) => p.binding)).toEqual([]);
  });

  test("no two zone floors overlap", () => {
    // Overlapping carpets would make click-a-carpet-to-enter-a-zone ambiguous.
    const boxes = ZONE_ORDER.map((id) => {
      const z = ZONES[id];
      return {
        id,
        x0: z.origin.x - z.size.w / 2,
        x1: z.origin.x + z.size.w / 2,
        z0: z.origin.z - z.size.d / 2,
        z1: z.origin.z + z.size.d / 2,
      };
    });
    const clashes: string[] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        if (a.x0 < b.x1 && b.x0 < a.x1 && a.z0 < b.z1 && b.z0 < a.z1) {
          clashes.push(`${a.id} overlaps ${b.id}`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });
});
