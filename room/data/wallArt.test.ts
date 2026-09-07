import { describe, expect, test } from "vitest";
import { SCENE, WALL_FACE } from "./scene";

/*
  Nothing hung on a wall may overlap anything else hung on the same wall.

  Every mounted prop sits at exactly WALL_FACE, so two that overlap are not one
  in front of the other - they are coplanar, and the depth buffer picks a winner
  per pixel per frame. On screen that is the art flickering as the camera moves,
  with nothing in the console to say why.

  The sizes below are measured from the vendored FBX files, because the models
  carry their dimensions and the manifest does not. To re-measure, load a model
  with FBXLoader and read Box3.setFromObject(...).getSize(), then divide by
  MODEL_SCALE. They are here rather than in scene.ts on purpose: production code
  never needs them, and a copy that drifts is worse than no copy at all - which
  is why this asserts a relationship between them and the manifest rather than
  trusting either alone.
*/
const SIZE: Record<string, { w: number; d: number }> = {
  painting_lighthouse: { w: 0.55, d: 0.65 },
  painting_shaman: { w: 0.525, d: 0.75 },
  painting_hyperlightdrifter: { w: 0.475, d: 0.675 },
  painting_halflife: { w: 1.125, d: 0.8 },
  painting_squirtle: { w: 0.575, d: 0.45 },
  painting_mario: { w: 0.45, d: 0.3 },
  painting_pokeball: { w: 0.575, d: 0.575 },
};

/** The ceiling: wall_tile is 2.2 tall. */
const CEILING = 2.2;

interface Rect {
  id: string;
  mount: string;
  across: [number, number];
  up: [number, number];
}

/*
  The rectangle a mounted prop covers on its wall.

  A painting is modelled lying flat and stood up by an X tilt, so the model's
  DEPTH becomes its height on the wall and its WIDTH runs along the wall - see
  engine/mount.ts. Which world axis "along the wall" means depends on which
  wall, so the two are kept apart and only compared within a wall.
*/
function rects(): Rect[] {
  return SCENE.filter((prop) => prop.mount).map((prop) => {
    const size = SIZE[prop.model];
    if (!size) throw new Error(`no measured size for ${prop.model}`);
    const along = prop.mount === "wall-left" ? prop.position.z : prop.position.x;
    return {
      id: prop.id,
      mount: prop.mount!,
      across: [along - size.w / 2, along + size.w / 2],
      up: [prop.position.y - size.d / 2, prop.position.y + size.d / 2],
    };
  });
}

const overlaps = (a: Rect, b: Rect): boolean =>
  a.across[0] < b.across[1] &&
  b.across[0] < a.across[1] &&
  a.up[0] < b.up[1] &&
  b.up[0] < a.up[1];

describe("art hung on the walls", () => {
  test("no two pieces on the same wall overlap", () => {
    const all = rects();
    const clashes: string[] = [];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        if (all[i].mount !== all[j].mount) continue;
        if (overlaps(all[i], all[j])) clashes.push(`${all[i].id} x ${all[j].id}`);
      }
    }
    expect(clashes).toEqual([]);
  });

  test("nothing hangs through the ceiling or into the floor", () => {
    for (const rect of rects()) {
      expect(rect.up[0]).toBeGreaterThan(0);
      expect(rect.up[1]).toBeLessThanOrEqual(CEILING);
    }
  });

  test("everything hangs on the wall face, clear of the plaster", () => {
    // Two rounds of art vanished into the wall before WALL_FACE was measured.
    for (const prop of SCENE.filter((p) => p.mount)) {
      const along = prop.mount === "wall-left" ? prop.position.x : prop.position.z;
      expect(along).toBe(WALL_FACE);
    }
  });

  test("every measured size belongs to a model the room actually hangs", () => {
    // Keeps this table from rotting into a list of models nobody placed.
    const hung = new Set<string>(SCENE.filter((p) => p.mount).map((p) => p.model));
    for (const model of Object.keys(SIZE)) expect(hung.has(model)).toBe(true);
  });
});
