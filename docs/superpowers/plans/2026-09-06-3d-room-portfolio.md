# 3D Room Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the PixiJS walkable world and the scrolling routes with a single real-time 3D cutaway room, built from the House & Office FBX pack, where objects are the portfolio and clicking one opens a reader panel beside it without ever leaving `/`.

**Architecture:** A `room/` module split into three layers. `room/data/` holds the scene as plain tables (zones, props, content bindings). `room/engine/` holds four pure, unit-tested maths modules (swivel, focus, tab order, attract sweep) plus the React Three Fiber components that consume them. `room/ui/` holds the panel and its content bodies. Content in `constants/pages/*` is never touched — both the room and the `/text` fallback read from it, so they cannot drift.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind 4, three.js, @react-three/fiber v9, @react-three/drei, vitest.

**Spec:** `docs/superpowers/specs/2026-09-06-3d-room-portfolio-design.md`

## Global Constraints

- **Six sections, this order:** Experience, Projects, Hackathons, Certifications, About Me, Contact Me.
- **No nav bar, no menu, no section rail.** The room is the only navigation a mouse user sees. Success criterion 5 of the spec: "Nothing on screen looks like a website navigation menu."
- **Swivel limits:** ±35° horizontal, +5°/−20° vertical, hard-clamped so the two missing walls never rotate into view.
- **Camera levels:** exactly three — `home` → `zone` → `item`. Escape steps back exactly one level.
- **Item framing:** object in the left 55% of the viewport on desktop; top half on mobile. Panel takes the right ~45% desktop, a 60%-height bottom sheet on mobile.
- **The room is never blurred, dimmed or covered** while a panel is open. It stays lit, animated and swivel-able.
- **Textures:** `NearestFilter` for min and mag, no mipmaps. They are palette swatches (`desk.png` is 631 bytes at 128x128) and smoothing destroys them.
- **Scenery rule:** anything without a binding never responds to hover or click.
- **URL convention:** `?zone=<zoneId>` and `?zone=<zoneId>&item=<slug>`. Text anchors are `#<zone>-<item>`.
- **Content files in `constants/` are read-only for this plan.** No content file changes shape.
- **Existing test convention** (`vitest.config.ts`): pure logic is unit-tested in a node environment; browser/renderer code "is verified by looking at it, not here". Follow it — do not add jsdom.
- **Asset source:** `c:\Users\travi\Downloads\House & Office_v2_francoface\House & Office_v2_francoface\` — 107 binary FBX 7.4 models, 107 same-named PNGs in `Materials/`, no embedded texture references.

### Correction to the spec's estimate

The spec says "~25 models" and "~520KB" in §8 and §13. The real manifest below needs **42 models** once architecture tiles and carpets are counted, so expect roughly **840KB** of FBX. Task 18 measures the real figure. If the spec's 4s/30fps budget is missed, the GLB bake named in spec §8 is the first lever — do not pre-emptively build it.

---

### Task 1: Dependencies and test configuration

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `three`, `@react-three/fiber`, `@react-three/drei` importable; vitest picks up `room/**/*.test.ts`.

`pixi.js` is NOT removed here — `world/` still imports it and must keep building until Task 17 cuts over. Removing it now breaks the build.

- [ ] **Step 1: Install the 3D dependencies**

```bash
npm install three @react-three/fiber @react-three/drei
npm install --save-dev @types/three
```

R3F v9 is the line that supports React 19, which this project is on. Let npm resolve it; do not pin.

- [ ] **Step 2: Verify the installed majors**

```bash
node -e "
const fs=require('fs');
for (const p of ['three','@react-three/fiber','@react-three/drei','@types/three']) {
  try { console.log(p, JSON.parse(fs.readFileSync('node_modules/'+p+'/package.json','utf8')).version); }
  catch(e) { console.log(p, 'NOT INSTALLED'); }
}"
```

Read the manifests off disk rather than `require(p + '/package.json')` — `three` does not expose `./package.json` through its exports map, so the require form throws `ERR_PACKAGE_PATH_NOT_EXPORTED`.

Expected: `@react-three/fiber` is 9.x. If it resolved to 8.x, run `npm install @react-three/fiber@^9`.

- [ ] **Step 3: Teach vitest about `room/`**

In `vitest.config.ts`, replace the `include` line with:

```ts
    include: [
      "world/**/*.test.ts",
      "room/**/*.test.ts",
      "constants/**/*.test.ts",
    ],
```

Both `world` and `room` are listed on purpose: the old suite must keep passing until Task 17 deletes it, so a regression there is still caught while the new room is built alongside.

- [ ] **Step 4: Confirm the existing suite still passes**

Run: `npm test`
Expected: PASS, the existing `world/**` tests all green.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "Add three.js and R3F, and point vitest at room/"
```

---

### Task 2: Vendor the models the room actually uses

**Files:**
- Create: `scripts/vendor-room-assets.mjs`
- Create: `room/data/models.ts`
- Create: `room/data/models.test.ts`
- Create: `public/room-assets/**` (script output, committed)

**Interfaces:**
- Consumes: nothing.
- Produces: `MODELS: readonly string[]` from `room/data/models.ts` — the 42 bare model names, no extension. Every later task refers to models by these exact strings.

- [ ] **Step 1: Write the model list**

Create `room/data/models.ts`:

```ts
/*
  Every model the room uses, by bare name. `scripts/vendor-room-assets.mjs`
  copies exactly these out of the asset pack, and `models.test.ts` fails if a
  name here has no file behind it.

  The pack has 107 models. Vendoring all of them would ship roughly 2.6MB of
  furniture the room never places, so this list is the contract between the
  pack and `public/room-assets/`.
*/
export const MODELS = [
  // Architecture
  "floortile_office",
  "wall_tile",
  "wall_tile_grey_side1",
  "wall_tile_grey_side2",
  "wall_tile_window",
  "corner_pillar_grey",
  // Zone carpets
  "carpet_black",
  "carpet_blue",
  "carpetred",
  "carpetcolored",
  "carpetgreen",
  // Experience
  "file_cabinet",
  "drawer",
  // Projects
  "desk",
  "chair",
  "computer_screen",
  "briefcase_black",
  "keyboard",
  "mouse",
  // Hackathons
  "television",
  "nes",
  "nes_controller",
  "cartridge1",
  "cartridge2",
  "cartridge3",
  "cartridge4",
  "footrest",
  // Certifications
  "painting_lighthouse",
  "painting_shaman",
  "painting_hyperlightdrifter",
  "painting_halflife",
  "bookcase_small",
  // About Me
  "couch_double",
  "coffee_table",
  "bookcasetall",
  "plant1",
  "lamp_tall",
  "mugred",
  // Contact Me
  "house_door",
  "doorframe_house",
  "nightstand",
  // Lighting prop
  "lamp",
] as const;

export type ModelName = (typeof MODELS)[number];

/** Where a vendored model and its texture live, relative to `public/`. */
export function modelUrl(name: ModelName | string): string {
  return `/room-assets/models/${name}.fbx`;
}

export function textureUrl(name: ModelName | string): string {
  return `/room-assets/textures/${name}.png`;
}
```

- [ ] **Step 2: Write the vendoring script**

Create `scripts/vendor-room-assets.mjs`:

```js
/*
  Copies the models named in room/data/models.ts out of the House & Office pack
  and into public/room-assets/, so the site does not depend on a folder that
  lives outside the repo.

  Run: node scripts/vendor-room-assets.mjs "<path to pack>"
*/
import { readFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pack =
  process.argv[2] ??
  "C:/Users/travi/Downloads/House & Office_v2_francoface/House & Office_v2_francoface";

// models.ts is TypeScript, so read the names out rather than importing it.
const source = readFileSync(join(root, "room/data/models.ts"), "utf8");
const names = [...source.matchAll(/^\s*"([a-z0-9_]+)",$/gim)].map((m) => m[1]);

const modelsOut = join(root, "public/room-assets/models");
const texturesOut = join(root, "public/room-assets/textures");
mkdirSync(modelsOut, { recursive: true });
mkdirSync(texturesOut, { recursive: true });

const missing = [];
for (const name of names) {
  const fbx = join(pack, `${name}.fbx`);
  const png = join(pack, "Materials", `${name}.png`);
  if (!existsSync(fbx)) missing.push(`${name}.fbx`);
  else copyFileSync(fbx, join(modelsOut, `${name}.fbx`));
  if (!existsSync(png)) missing.push(`Materials/${name}.png`);
  else copyFileSync(png, join(texturesOut, `${name}.png`));
}

console.log(`vendored ${names.length - missing.length} of ${names.length} models`);
if (missing.length) {
  console.error("missing from the pack:\n  " + missing.join("\n  "));
  process.exit(1);
}
```

- [ ] **Step 3: Write the failing manifest test**

Create `room/data/models.test.ts`:

```ts
import { existsSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { MODELS, modelUrl, textureUrl } from "./models";

/*
  The guard between the manifest and what actually ships. A model named in
  MODELS but never vendored would fail at runtime as an invisible prop and a
  404 in the console; this turns that into a red build.
*/
describe("vendored room assets", () => {
  test.each(MODELS)("%s has a vendored model and texture", (name) => {
    expect(existsSync(`public${modelUrl(name)}`), `${name}.fbx missing`).toBe(true);
    expect(existsSync(`public${textureUrl(name)}`), `${name}.png missing`).toBe(true);
  });

  test("no model is listed twice", () => {
    expect(new Set(MODELS).size).toBe(MODELS.length);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run room/data/models.test.ts`
Expected: FAIL — every case reports the `.fbx` missing, because nothing is vendored yet.

- [ ] **Step 5: Vendor the assets**

```bash
node scripts/vendor-room-assets.mjs
```

Expected: `vendored 42 of 42 models` and exit 0. If it reports anything missing, the name in `models.ts` is misspelled against the pack — fix the name, do not rename the pack file.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run room/data/models.test.ts`
Expected: PASS, 43 tests.

- [ ] **Step 7: Check the real payload size**

```bash
du -sh public/room-assets public/room-assets/models public/room-assets/textures
```

Record the number. Task 18 compares it against the spec's budget.

- [ ] **Step 8: Commit**

```bash
git add scripts/vendor-room-assets.mjs room/data/models.ts room/data/models.test.ts public/room-assets
git commit -m "Vendor the 42 room models and textures from the asset pack"
```

---

### Task 3: `swivel.ts` — clamp dragging to the cone

**Files:**
- Create: `room/engine/swivel.ts`
- Test: `room/engine/swivel.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `interface Swivel { yaw: number; pitch: number }` (degrees), `SWIVEL_LIMITS`, `clampSwivel(s: Swivel): Swivel`, `applyDrag(current: Swivel, dxPx: number, dyPx: number, degreesPerPixel?: number): Swivel`. `CameraRig.tsx` (Task 12) is the only consumer.

- [ ] **Step 1: Write the failing test**

Create `room/engine/swivel.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { applyDrag, clampSwivel, SWIVEL_LIMITS } from "./swivel";

describe("clampSwivel", () => {
  test("leaves a swivel inside the cone alone", () => {
    expect(clampSwivel({ yaw: 10, pitch: -5 })).toEqual({ yaw: 10, pitch: -5 });
  });

  test("clamps yaw at both limits", () => {
    expect(clampSwivel({ yaw: 90, pitch: 0 }).yaw).toBe(SWIVEL_LIMITS.yawMax);
    expect(clampSwivel({ yaw: -90, pitch: 0 }).yaw).toBe(SWIVEL_LIMITS.yawMin);
  });

  test("clamps pitch asymmetrically, since looking up hits the missing ceiling first", () => {
    expect(clampSwivel({ yaw: 0, pitch: 45 }).pitch).toBe(SWIVEL_LIMITS.pitchMax);
    expect(clampSwivel({ yaw: 0, pitch: -45 }).pitch).toBe(SWIVEL_LIMITS.pitchMin);
  });

  test("the cone never lets the missing walls rotate into view", () => {
    // The two front walls are absent, so anything past +-35 yaw shows the void.
    expect(SWIVEL_LIMITS.yawMax).toBe(35);
    expect(SWIVEL_LIMITS.yawMin).toBe(-35);
  });
});

describe("applyDrag", () => {
  test("turns horizontal pixels into yaw degrees", () => {
    expect(applyDrag({ yaw: 0, pitch: 0 }, 40, 0, 0.25).yaw).toBe(10);
  });

  test("dragging down looks down", () => {
    expect(applyDrag({ yaw: 0, pitch: 0 }, 0, 40, 0.25).pitch).toBe(-10);
  });

  test("accumulates onto the current swivel", () => {
    expect(applyDrag({ yaw: 10, pitch: 0 }, 40, 0, 0.25).yaw).toBe(20);
  });

  test("clamps as it accumulates, so a long drag cannot escape the cone", () => {
    expect(applyDrag({ yaw: 30, pitch: 0 }, 400, 0, 0.25).yaw).toBe(35);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run room/engine/swivel.test.ts`
Expected: FAIL — `Cannot find module './swivel'`.

- [ ] **Step 3: Write the implementation**

Create `room/engine/swivel.ts`:

```ts
/*
  The room is a cutaway box: floor, back-left wall, back-right wall, and no
  front walls at all. Free orbit would swing the camera behind the missing
  walls and show an unlit, un-art-directed void, so dragging is clamped to a
  cone that always keeps the open corner in front of the viewer.

  Degrees, not radians, because these numbers are read and tuned by hand.
*/
export interface Swivel {
  /** Horizontal, 0 is the default corner-on framing. */
  yaw: number;
  /** Vertical, 0 is the default. Positive looks up. */
  pitch: number;
}

export const SWIVEL_LIMITS = {
  yawMin: -35,
  yawMax: 35,
  /** Tighter upward: there is no ceiling, so looking up runs out of room first. */
  pitchMin: -20,
  pitchMax: 5,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampSwivel(swivel: Swivel): Swivel {
  return {
    yaw: clamp(swivel.yaw, SWIVEL_LIMITS.yawMin, SWIVEL_LIMITS.yawMax),
    pitch: clamp(swivel.pitch, SWIVEL_LIMITS.pitchMin, SWIVEL_LIMITS.pitchMax),
  };
}

/**
 * Fold a pointer drag into the current swivel. Dragging down looks down, which
 * is the direction people expect when they feel like they are turning the room
 * rather than turning their head.
 */
export function applyDrag(
  current: Swivel,
  dxPx: number,
  dyPx: number,
  degreesPerPixel = 0.25,
): Swivel {
  return clampSwivel({
    yaw: current.yaw + dxPx * degreesPerPixel,
    pitch: current.pitch - dyPx * degreesPerPixel,
  });
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run room/engine/swivel.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add room/engine/swivel.ts room/engine/swivel.test.ts
git commit -m "Add swivel clamping so the missing walls never rotate into view"
```

---

### Task 4: `focus.ts` — camera framing for the three levels

**Files:**
- Create: `room/engine/focus.ts`
- Test: `room/engine/focus.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `type Level = "home" | "zone" | "item"`, `interface Vec3 { x, y, z }`, `interface Bounds { center: Vec3; radius: number }`, `interface Viewport { width, height }`, `interface Framing { target: Vec3; distance: number; screenAnchor: { x: number; y: number } }`, `isMobile(v: Viewport): boolean`, `framingFor(level, bounds, viewport, fovDegrees): Framing`. `CameraRig.tsx` (Task 12) is the only consumer.

`screenAnchor` is normalised 0–1 across the viewport: `{ x: 0.5, y: 0.5 }` is dead centre. The rig offsets the camera so the target lands there.

- [ ] **Step 1: Write the failing test**

Create `room/engine/focus.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { framingFor, isMobile, type Bounds, type Viewport } from "./focus";

const desktop: Viewport = { width: 1440, height: 900 };
const phone: Viewport = { width: 390, height: 844 };
const bounds: Bounds = { center: { x: 2, y: 1, z: -3 }, radius: 1 };
const fov = 50;

describe("isMobile", () => {
  test("splits at the Tailwind md breakpoint", () => {
    expect(isMobile({ width: 767, height: 900 })).toBe(true);
    expect(isMobile({ width: 768, height: 900 })).toBe(false);
  });
});

describe("framingFor", () => {
  test("aims at the bounds centre at every level", () => {
    for (const level of ["home", "zone", "item"] as const) {
      expect(framingFor(level, bounds, desktop, fov).target).toEqual(bounds.center);
    }
  });

  test("home and zone stay centred, because no panel is open", () => {
    expect(framingFor("home", bounds, desktop, fov).screenAnchor).toEqual({ x: 0.5, y: 0.5 });
    expect(framingFor("zone", bounds, desktop, fov).screenAnchor).toEqual({ x: 0.5, y: 0.5 });
  });

  test("item framing on desktop leaves the right 45% clear for the panel", () => {
    const { screenAnchor } = framingFor("item", bounds, desktop, fov);
    // Centre of the left 55% is 0.275.
    expect(screenAnchor).toEqual({ x: 0.275, y: 0.5 });
    expect(screenAnchor.x + 0.275).toBeLessThanOrEqual(0.55);
  });

  test("item framing on mobile moves the object to the top half instead", () => {
    // The panel is a 60% bottom sheet there, so shifting left would do nothing.
    expect(framingFor("item", bounds, phone, fov).screenAnchor).toEqual({ x: 0.5, y: 0.25 });
  });

  test("pulls back further for wider bounds", () => {
    const wide: Bounds = { center: bounds.center, radius: 4 };
    expect(framingFor("item", wide, desktop, fov).distance).toBeGreaterThan(
      framingFor("item", bounds, desktop, fov).distance,
    );
  });

  test("each level steps closer than the one before it", () => {
    const at = (l: "home" | "zone" | "item") => framingFor(l, bounds, desktop, fov).distance;
    expect(at("home")).toBeGreaterThan(at("zone"));
    expect(at("zone")).toBeGreaterThan(at("item"));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run room/engine/focus.test.ts`
Expected: FAIL — `Cannot find module './focus'`.

- [ ] **Step 3: Write the implementation**

Create `room/engine/focus.ts`:

```ts
/*
  Where the camera sits for each of the three levels.

  Pure maths on purpose. The rig in CameraRig.tsx does the tweening and owns the
  three.js objects; everything decidable without a renderer is decided here so it
  can be tested in a node environment, matching the convention in vitest.config.ts.
*/
export type Level = "home" | "zone" | "item";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Bounds {
  center: Vec3;
  /** Radius of the bounding sphere, in world units. */
  radius: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Framing {
  target: Vec3;
  /** How far back along the swivel direction the camera sits. */
  distance: number;
  /** Where the target should land on screen, normalised 0-1. */
  screenAnchor: { x: number; y: number };
}

/** Matches the Tailwind `md` breakpoint the panel switches layout at. */
export function isMobile(viewport: Viewport): boolean {
  return viewport.width < 768;
}

/*
  How much air to leave around the subject. Home shows the whole room, zone
  shows a cluster, item fills the frame with one object.
*/
const PADDING: Record<Level, number> = {
  home: 1.9,
  zone: 1.4,
  item: 1.15,
};

export function framingFor(
  level: Level,
  bounds: Bounds,
  viewport: Viewport,
  fovDegrees: number,
): Framing {
  const halfFov = (fovDegrees / 2) * (Math.PI / 180);
  const distance = (bounds.radius / Math.tan(halfFov)) * PADDING[level];

  // Only the item level has a panel to make room for.
  let screenAnchor = { x: 0.5, y: 0.5 };
  if (level === "item") {
    screenAnchor = isMobile(viewport)
      ? { x: 0.5, y: 0.25 } // centre of the top half, above the bottom sheet
      : { x: 0.275, y: 0.5 }; // centre of the left 55%, beside the panel
  }

  return { target: bounds.center, distance, screenAnchor };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run room/engine/focus.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add room/engine/focus.ts room/engine/focus.test.ts
git commit -m "Add camera framing maths for the three focus levels"
```

---

### Task 5: `zones.ts` and `scene.ts` — the room as data

**Files:**
- Create: `room/data/zones.ts`
- Create: `room/data/scene.ts`
- Test: `room/data/scene.test.ts`

**Interfaces:**
- Consumes: `MODELS`, `ModelName` (Task 2); `Vec3` (Task 4).
- Produces:
  - `type ZoneId = "experience" | "projects" | "hackathons" | "certifications" | "about" | "contact"`
  - `ZONE_ORDER: readonly ZoneId[]` — the six, in spec order
  - `interface Zone { id, label, carpet, origin: Vec3, size: { w: number; d: number }, light: { color: string; intensity: number } }`
  - `ZONES: Record<ZoneId, Zone>`
  - `interface Prop { id: string; model: ModelName; zone: ZoneId; position: Vec3; rotationY: number; scale?: number; binding?: string }`
  - `SCENE: readonly Prop[]`, `ARCHITECTURE: readonly Prop[]`

Positions are in tile units. Task 10 calibrates one global scale factor from `floortile_office` so these numbers never carry the pack's raw model scale. Exact placement is tuned visually in Task 18 by editing these tables.

- [ ] **Step 1: Write `zones.ts`**

```ts
import type { Vec3 } from "../engine/focus";
import type { ModelName } from "./models";

/*
  The six sections, as places rather than menu entries.

  Order is the spec's order and is load-bearing twice over: it is the order the
  establishing sweep visits, and the order Tab moves through the room.
*/
export type ZoneId =
  | "experience"
  | "projects"
  | "hackathons"
  | "certifications"
  | "about"
  | "contact";

export const ZONE_ORDER = [
  "experience",
  "projects",
  "hackathons",
  "certifications",
  "about",
  "contact",
] as const satisfies readonly ZoneId[];

export interface Zone {
  id: ZoneId;
  /** Shown on the floor decal and announced to screen readers. */
  label: string;
  /** The carpet that marks this zone's clickable floor. */
  carpet: ModelName;
  /** Centre of the zone's floor area, in tile units. */
  origin: Vec3;
  /** Floor footprint in tiles, used for the carpet and the click target. */
  size: { w: number; d: number };
  light: { color: string; intensity: number };
}

/*
  Floor plan, looking in over the open corner. -x is the back-left wall, -z is
  the back-right wall, +x/+z is the open front.

  Experience and Certifications split the back-left wall left/right rather than
  stacking, so no two zone floors overlap and every carpet stays clickable.
*/
export const ZONES: Record<ZoneId, Zone> = {
  experience: {
    id: "experience",
    label: "Experience",
    carpet: "carpet_black",
    origin: { x: -3.5, y: 0, z: -1 },
    size: { w: 3, d: 3 },
    light: { color: "#ffb46b", intensity: 8 },
  },
  projects: {
    id: "projects",
    label: "Projects",
    carpet: "carpet_blue",
    origin: { x: 1.5, y: 0, z: -3.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ffc98a", intensity: 10 },
  },
  hackathons: {
    id: "hackathons",
    label: "Hackathons",
    carpet: "carpetred",
    origin: { x: 2, y: 0, z: 1.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ff9d6b", intensity: 7 },
  },
  certifications: {
    id: "certifications",
    label: "Certifications",
    carpet: "carpetcolored",
    origin: { x: -3.5, y: 0, z: -4 },
    size: { w: 3, d: 2 },
    light: { color: "#ffd0a0", intensity: 7 },
  },
  about: {
    id: "about",
    label: "About Me",
    carpet: "carpetgreen",
    origin: { x: -2, y: 0, z: 2.5 },
    size: { w: 4, d: 3 },
    light: { color: "#ffbe7d", intensity: 8 },
  },
  contact: {
    id: "contact",
    label: "Contact Me",
    carpet: "carpet_black",
    origin: { x: 4.5, y: 0, z: -1.5 },
    size: { w: 1.5, d: 2 },
    light: { color: "#ffd9a8", intensity: 12 },
  },
};
```

- [ ] **Step 2: Write `scene.ts`**

```ts
import type { Vec3 } from "../engine/focus";
import type { ModelName } from "./models";
import type { ZoneId } from "./zones";

/*
  Every object in the room, as a table.

  `binding` is what makes a prop interactive. A prop without one is scenery: it
  never highlights, never takes a click, and never appears in the Tab order.
  That is the spec's scenery rule, and keeping it a single optional field means
  it cannot be half-applied.
*/
export interface Prop {
  id: string;
  model: ModelName;
  zone: ZoneId;
  position: Vec3;
  /** Degrees. */
  rotationY: number;
  scale?: number;
  /** Binding id resolved by room/data/bindings.ts. Absent means scenery. */
  binding?: string;
}

/** Walls and floor. Never interactive, never in the Tab order. */
export const ARCHITECTURE: readonly Prop[] = [
  { id: "wall:left", model: "wall_tile_grey_side1", zone: "experience", position: { x: -5, y: 0, z: -1 }, rotationY: 90 },
  { id: "wall:left-2", model: "wall_tile", zone: "certifications", position: { x: -5, y: 0, z: -4 }, rotationY: 90 },
  { id: "wall:back", model: "wall_tile_grey_side2", zone: "projects", position: { x: 1.5, y: 0, z: -5 }, rotationY: 0 },
  { id: "wall:window", model: "wall_tile_window", zone: "projects", position: { x: 3.5, y: 0, z: -5 }, rotationY: 0 },
  { id: "pillar:corner", model: "corner_pillar_grey", zone: "certifications", position: { x: -5, y: 0, z: -5 }, rotationY: 0 },
];

export const SCENE: readonly Prop[] = [
  // 1. EXPERIENCE
  { id: "experience:cabinet", model: "file_cabinet", zone: "experience", position: { x: -4.2, y: 0, z: -1 }, rotationY: 90, binding: "experience" },
  { id: "experience:drawer", model: "drawer", zone: "experience", position: { x: -4.2, y: 0, z: 0.4 }, rotationY: 90 },

  // 2. PROJECTS
  { id: "projects:desk", model: "desk", zone: "projects", position: { x: 1.5, y: 0, z: -4.2 }, rotationY: 0 },
  { id: "projects:chair", model: "chair", zone: "projects", position: { x: 1.5, y: 0, z: -3 }, rotationY: 180 },
  { id: "projects:monitor", model: "computer_screen", zone: "projects", position: { x: 1.2, y: 0.75, z: -4.3 }, rotationY: 0, binding: "project:git-dummy" },
  { id: "projects:keyboard", model: "keyboard", zone: "projects", position: { x: 1.4, y: 0.75, z: -3.9 }, rotationY: 0 },
  { id: "projects:mouse", model: "mouse", zone: "projects", position: { x: 2.1, y: 0.75, z: -3.9 }, rotationY: 0 },
  { id: "projects:briefcase", model: "briefcase_black", zone: "projects", position: { x: 3, y: 0, z: -3.6 }, rotationY: -20, binding: "project:millitary-stores-telegram-bot" },

  // 3. HACKATHONS
  { id: "hackathons:tv", model: "television", zone: "hackathons", position: { x: 2, y: 0, z: 0.4 }, rotationY: 160 },
  { id: "hackathons:nes", model: "nes", zone: "hackathons", position: { x: 2, y: 0, z: 1.5 }, rotationY: 160, binding: "hackathons" },
  { id: "hackathons:controller", model: "nes_controller", zone: "hackathons", position: { x: 2.7, y: 0, z: 2 }, rotationY: 140 },
  { id: "hackathons:footrest", model: "footrest", zone: "hackathons", position: { x: 3.4, y: 0, z: 1.2 }, rotationY: 0 },
  { id: "hackathons:cart-1", model: "cartridge1", zone: "hackathons", position: { x: 1.2, y: 0, z: 1.9 }, rotationY: 10, binding: "hackathon:0" },
  { id: "hackathons:cart-2", model: "cartridge2", zone: "hackathons", position: { x: 1.45, y: 0, z: 2.1 }, rotationY: -5, binding: "hackathon:1" },
  { id: "hackathons:cart-3", model: "cartridge3", zone: "hackathons", position: { x: 1.7, y: 0, z: 2.3 }, rotationY: 15, binding: "hackathon:2" },
  { id: "hackathons:cart-4", model: "cartridge4", zone: "hackathons", position: { x: 1.95, y: 0, z: 2.5 }, rotationY: 0, binding: "hackathon:3" },

  // 4. CERTIFICATIONS
  { id: "certifications:frame-1", model: "painting_lighthouse", zone: "certifications", position: { x: -4.9, y: 1.9, z: -4.7 }, rotationY: 90, binding: "certificate:0" },
  { id: "certifications:frame-2", model: "painting_shaman", zone: "certifications", position: { x: -4.9, y: 1.9, z: -3.9 }, rotationY: 90, binding: "certificate:1" },
  { id: "certifications:frame-3", model: "painting_hyperlightdrifter", zone: "certifications", position: { x: -4.9, y: 1.1, z: -4.7 }, rotationY: 90, binding: "certificate:2" },
  { id: "certifications:frame-4", model: "painting_halflife", zone: "certifications", position: { x: -4.9, y: 1.1, z: -3.9 }, rotationY: 90, binding: "certificate:3" },
  { id: "certifications:bookcase", model: "bookcase_small", zone: "certifications", position: { x: -4.4, y: 0, z: -4.3 }, rotationY: 90 },

  // 5. ABOUT ME
  { id: "about:couch", model: "couch_double", zone: "about", position: { x: -2.6, y: 0, z: 2.5 }, rotationY: 60, binding: "about" },
  { id: "about:table", model: "coffee_table", zone: "about", position: { x: -1.3, y: 0, z: 2.9 }, rotationY: 0 },
  { id: "about:mug", model: "mugred", zone: "about", position: { x: -1.3, y: 0.45, z: 2.9 }, rotationY: 0, binding: "credits" },
  { id: "about:bookcase", model: "bookcasetall", zone: "about", position: { x: -4.4, y: 0, z: 2.2 }, rotationY: 90, binding: "toolkit" },
  { id: "about:plant", model: "plant1", zone: "about", position: { x: -3.6, y: 0, z: 3.8 }, rotationY: 0 },
  { id: "about:lamp-tall", model: "lamp_tall", zone: "about", position: { x: -0.6, y: 0, z: 3.6 }, rotationY: 0 },

  // 6. CONTACT ME
  { id: "contact:doorframe", model: "doorframe_house", zone: "contact", position: { x: 4.9, y: 0, z: -1.5 }, rotationY: -90 },
  { id: "contact:door", model: "house_door", zone: "contact", position: { x: 4.85, y: 0, z: -1.9 }, rotationY: -55, binding: "contact" },
  { id: "contact:nightstand", model: "nightstand", zone: "contact", position: { x: 4.5, y: 0, z: -0.4 }, rotationY: -90 },

  // Lighting prop, scenery: the warm point light in Task 10 sits inside it.
  { id: "projects:lamp", model: "lamp", zone: "projects", position: { x: 0.4, y: 0.75, z: -4.3 }, rotationY: 0 },
];

/** Every prop that responds to hover, click and Tab. */
export const INTERACTIVE: readonly Prop[] = SCENE.filter((p) => p.binding);
```

- [ ] **Step 3: Write the failing scene test**

Create `room/data/scene.test.ts`:

```ts
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
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run room/data/scene.test.ts`
Expected: PASS, 6 tests. If the overlap test fails, adjust `origin`/`size` in `zones.ts` until the six footprints are disjoint — that is the test doing its job.

- [ ] **Step 5: Commit**

```bash
git add room/data/zones.ts room/data/scene.ts room/data/scene.test.ts
git commit -m "Add the room as data: six zones and the prop manifest"
```

---

### Task 6: `bindings.ts` — props to portfolio content

**Files:**
- Create: `room/data/bindings.ts`
- Test: `room/data/bindings.test.ts`

**Interfaces:**
- Consumes: `INTERACTIVE` (Task 5); `PROJECTS`, `HACKATHONS`, `EXPERIENCE`, `CERTIFICATES`, `ABOUT`, `TOOLKIT_ROWS`, `CONTACT_CHANNELS` from `constants/`.
- Produces: `type PanelContent` (a discriminated union on `kind`), `BINDINGS: Record<string, PanelContent>`, `resolveBinding(id: string): PanelContent | undefined`, `siblingsOf(id: string): { id: string; title: string }[]`. `Panel.tsx` (Task 14) and `TextSite.tsx` (Task 16) both consume this.

- [ ] **Step 1: Write the implementation**

Create `room/data/bindings.ts`:

```ts
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import type { CertificateEntry, ExperienceEntry } from "@/constants/pages/experience";
import { ABOUT, type AboutData } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import { CONTACT_CHANNELS, type ContactChannel } from "@/constants/contact";
import type { PageData } from "@/constants/pages/types";
import type { ZoneId } from "./zones";

/*
  What a prop opens.

  Everything here is derived from constants/, never copied out of it, so the
  room and the /text version cannot drift from each other or from the data.
*/
export type PanelContent =
  | { kind: "project"; zone: ZoneId; section: "projects" | "hackathons"; data: PageData }
  | { kind: "experience"; zone: ZoneId; entries: ExperienceEntry[]; resumeHref: string }
  | { kind: "certificate"; zone: ZoneId; entry: CertificateEntry }
  | { kind: "list"; zone: ZoneId; title: string; of: string[] }
  | { kind: "about"; zone: ZoneId; data: AboutData }
  | { kind: "toolkit"; zone: ZoneId; rows: string[][] }
  | { kind: "contact"; zone: ZoneId; channels: readonly ContactChannel[] }
  | { kind: "credits"; zone: ZoneId };

export const RESUME_HREF = "/files/resume.pdf";

function projectBindings(): Record<string, PanelContent> {
  const out: Record<string, PanelContent> = {};
  for (const data of PROJECTS) {
    out[`project:${data.slug}`] = { kind: "project", zone: "projects", section: "projects", data };
  }
  HACKATHONS.forEach((data, i) => {
    // Indexed, so adding a hackathon does not require renaming a cartridge.
    out[`hackathon:${i}`] = { kind: "project", zone: "hackathons", section: "hackathons", data };
  });
  return out;
}

function certificateBindings(): Record<string, PanelContent> {
  const out: Record<string, PanelContent> = {};
  CERTIFICATES.forEach((entry, i) => {
    out[`certificate:${i}`] = { kind: "certificate", zone: "certifications", entry };
  });
  return out;
}

export const BINDINGS: Record<string, PanelContent> = {
  ...projectBindings(),
  ...certificateBindings(),
  experience: {
    kind: "experience",
    zone: "experience",
    entries: EXPERIENCE,
    resumeHref: RESUME_HREF,
  },
  hackathons: {
    kind: "list",
    zone: "hackathons",
    title: "Hackathons",
    of: HACKATHONS.map((_, i) => `hackathon:${i}`),
  },
  about: { kind: "about", zone: "about", data: ABOUT },
  toolkit: { kind: "toolkit", zone: "about", rows: TOOLKIT_ROWS },
  contact: { kind: "contact", zone: "contact", channels: CONTACT_CHANNELS },
  credits: { kind: "credits", zone: "about" },
};

export function resolveBinding(id: string): PanelContent | undefined {
  return BINDINGS[id];
}

/** Title for a binding, used by the panel header and the sibling list. */
export function titleOf(content: PanelContent): string {
  switch (content.kind) {
    case "project":
      return content.data.cardTitle;
    case "experience":
      return "Experience";
    case "certificate":
      return content.entry.name;
    case "list":
      return content.title;
    case "about":
      return "About Me";
    case "toolkit":
      return "Toolkit";
    case "contact":
      return "Contact Me";
    case "credits":
      return "Credits";
  }
}

/**
 * The other items in the same section, so a visitor can move through all four
 * hackathons without going back to the room. This is where the spec's "grouped
 * into sections" requirement is honoured.
 */
export function siblingsOf(id: string): { id: string; title: string }[] {
  const content = BINDINGS[id];
  if (!content) return [];
  return Object.entries(BINDINGS)
    .filter(([otherId, other]) => {
      if (otherId === id) return false;
      if (other.zone !== content.zone) return false;
      return other.kind === content.kind;
    })
    .map(([otherId, other]) => ({ id: otherId, title: titleOf(other) }));
}
```

- [ ] **Step 2: Write the coverage test**

Create `room/data/bindings.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { BINDINGS, resolveBinding, siblingsOf, titleOf } from "./bindings";
import { INTERACTIVE } from "./scene";

/*
  The guard that keeps the room honest against the content.

  Everything else tests logic in isolation. This one reads the manifest that
  actually ships and the arrays that actually render, so the day a third project
  is added to a two-object desk the build stops and says so, instead of quietly
  dropping that project off the site.

  This is the carried-over descendant of world/content/coverage.test.ts and is
  the single most valuable test in the suite.
*/
describe("the room covers the content", () => {
  test("every prop binding resolves to real content", () => {
    const dangling = INTERACTIVE.filter((p) => !resolveBinding(p.binding!));
    expect(dangling.map((p) => `${p.id} -> ${p.binding}`)).toEqual([]);
  });

  test("no two props share a binding", () => {
    const used = INTERACTIVE.map((p) => p.binding!);
    expect(new Set(used).size).toBe(used.length);
  });

  test("every project has an object in the room", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = PROJECTS.filter((p) => !placed.has(`project:${p.slug}`));
    expect(
      missing.map((p) => p.slug),
      "add an object with this binding to room/data/scene.ts",
    ).toEqual([]);
  });

  test("every hackathon has a cartridge", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = HACKATHONS.map((_, i) => `hackathon:${i}`).filter((id) => !placed.has(id));
    expect(missing, "add a cartridge to room/data/scene.ts").toEqual([]);
  });

  test("every certificate has a frame", () => {
    const placed = new Set(INTERACTIVE.map((p) => p.binding));
    const missing = CERTIFICATES.map((_, i) => `certificate:${i}`).filter((id) => !placed.has(id));
    expect(missing, "add a painting to room/data/scene.ts").toEqual([]);
  });

  test("the experience cabinet lists every role", () => {
    const content = resolveBinding("experience");
    expect(content?.kind).toBe("experience");
    if (content?.kind === "experience") {
      expect(content.entries).toHaveLength(EXPERIENCE.length);
    }
  });

  test("the hackathon list points only at bindings that exist", () => {
    const content = resolveBinding("hackathons");
    if (content?.kind !== "list") throw new Error("expected a list binding");
    for (const id of content.of) expect(BINDINGS[id]).toBeDefined();
  });

  test("every binding has a title", () => {
    for (const [id, content] of Object.entries(BINDINGS)) {
      expect(titleOf(content), `${id} has no title`).toBeTruthy();
    }
  });

  test("siblings stay inside their own section", () => {
    const siblings = siblingsOf("hackathon:0");
    expect(siblings).toHaveLength(HACKATHONS.length - 1);
    expect(siblings.map((s) => s.id)).not.toContain("project:git-dummy");
  });
});
```

- [ ] **Step 3: Run it to verify it passes**

Run: `npx vitest run room/data/bindings.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 4: Commit**

```bash
git add room/data/bindings.ts room/data/bindings.test.ts
git commit -m "Bind room objects to portfolio content, with a coverage guard"
```

---

### Task 7: `tabOrder.ts` — the rail, made invisible

**Files:**
- Create: `room/engine/tabOrder.ts`
- Test: `room/engine/tabOrder.test.ts`

**Interfaces:**
- Consumes: `Prop` and `INTERACTIVE` (Task 5); `ZONE_ORDER` (Task 5).
- Produces: `tabOrder(props?: readonly Prop[]): string[]` returning prop ids. `Room.tsx` (Task 10) and the keyboard handler (Task 15) consume it.

- [ ] **Step 1: Write the failing test**

Create `room/engine/tabOrder.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run room/engine/tabOrder.test.ts`
Expected: FAIL — `Cannot find module './tabOrder'`.

- [ ] **Step 3: Write the implementation**

Create `room/engine/tabOrder.ts`:

```ts
import { INTERACTIVE, type Prop } from "../data/scene";
import { ZONE_ORDER } from "../data/zones";

/*
  There is no section rail on screen, by design: the room is the navigation.
  That leaves keyboard users with nothing to move through, so Tab order becomes
  the rail instead - invisible to a mouse, complete for anyone without one.

  Section order first, manifest order within a section, so tabbing walks the
  room the same way reading it does.
*/
export function tabOrder(props: readonly Prop[] = INTERACTIVE): string[] {
  const rank = new Map(ZONE_ORDER.map((zone, i) => [zone, i]));
  return props
    .map((prop, index) => ({ prop, index }))
    .sort((a, b) => {
      const byZone = rank.get(a.prop.zone)! - rank.get(b.prop.zone)!;
      return byZone !== 0 ? byZone : a.index - b.index;
    })
    .map(({ prop }) => prop.id);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run room/engine/tabOrder.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add room/engine/tabOrder.ts room/engine/tabOrder.test.ts
git commit -m "Add spatial Tab order so keyboard users get the rail mouse users do not"
```

---

### Task 8: `attract.ts` — the establishing sweep

**Files:**
- Create: `room/engine/attract.ts`
- Test: `room/engine/attract.test.ts`

**Interfaces:**
- Consumes: `ZoneId`, `ZONE_ORDER` (Task 5).
- Produces: `SWEEP_DURATION_MS: number`, `interface SweepStop { zone: ZoneId | null; atMs: number }`, `sweepPath(): SweepStop[]`, `sweepAt(ms: number): ZoneId | null`. `CameraRig.tsx` (Task 12) consumes it.

- [ ] **Step 1: Write the failing test**

Create `room/engine/attract.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { ZONE_ORDER } from "../data/zones";
import { SWEEP_DURATION_MS, sweepAt, sweepPath } from "./attract";

describe("the establishing sweep", () => {
  test("visits all six zones, so nobody has to be told the sections exist", () => {
    const zones = sweepPath().map((s) => s.zone).filter(Boolean);
    expect(zones).toEqual([...ZONE_ORDER]);
  });

  test("visits them in the spec's order", () => {
    expect(sweepPath()[0].zone).toBe("experience");
    expect(sweepPath()[ZONE_ORDER.length - 1].zone).toBe("contact");
  });

  test("ends at home, not parked on the last zone", () => {
    const path = sweepPath();
    expect(path[path.length - 1].zone).toBeNull();
    expect(path[path.length - 1].atMs).toBe(SWEEP_DURATION_MS);
  });

  test("runs for about four seconds", () => {
    expect(SWEEP_DURATION_MS).toBe(4000);
  });

  test("stops are strictly increasing in time", () => {
    const times = sweepPath().map((s) => s.atMs);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(new Set(times).size).toBe(times.length);
  });

  test("sweepAt reports the zone the camera is on", () => {
    expect(sweepAt(0)).toBe("experience");
    expect(sweepAt(SWEEP_DURATION_MS)).toBeNull();
    expect(sweepAt(SWEEP_DURATION_MS + 500)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run room/engine/attract.test.ts`
Expected: FAIL — `Cannot find module './attract'`.

- [ ] **Step 3: Write the implementation**

Create `room/engine/attract.ts`:

```ts
import { ZONE_ORDER, type ZoneId } from "../data/zones";

/*
  On arrival the camera pans across all six zones and settles at home.

  This is what replaces a nav bar. A visitor cannot be told "there are six
  sections" without chrome on screen, so they are shown instead - once, in four
  seconds, abortable by any input. Anyone who starts clicking has already found
  the room and does not need the tour.
*/
export const SWEEP_DURATION_MS = 4000;

export interface SweepStop {
  /** null means the home framing. */
  zone: ZoneId | null;
  atMs: number;
}

export function sweepPath(): SweepStop[] {
  const perZone = SWEEP_DURATION_MS / ZONE_ORDER.length;
  const stops: SweepStop[] = ZONE_ORDER.map((zone, i) => ({
    zone,
    atMs: Math.round(i * perZone),
  }));
  stops.push({ zone: null, atMs: SWEEP_DURATION_MS });
  return stops;
}

/** Which zone the sweep is looking at, at a given moment. */
export function sweepAt(ms: number): ZoneId | null {
  let current: ZoneId | null = null;
  for (const stop of sweepPath()) {
    if (ms >= stop.atMs) current = stop.zone;
  }
  return current;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run room/engine/attract.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS — the old `world/**` tests and all four new pure modules.

- [ ] **Step 6: Commit**

```bash
git add room/engine/attract.ts room/engine/attract.test.ts
git commit -m "Add the establishing sweep that shows every section on arrival"
```

---

### Task 9: `useModels.ts` — load FBX and pair textures by filename

**Files:**
- Create: `room/engine/useModels.ts`

**Interfaces:**
- Consumes: `modelUrl`, `textureUrl`, `ModelName` (Task 2).
- Produces: `useModel(name: ModelName): THREE.Group | null` and `preloadModels(names: readonly ModelName[]): Promise<void>`. `Scenery.tsx` (Task 10), `Prop.tsx` (Task 11) and `ZoneDecal.tsx` (Task 13) consume it.

Verified by looking at the running room, not by unit test — it needs a WebGL context, and `vitest.config.ts` records that renderer code is checked that way here.

- [ ] **Step 1: Write the loader**

```ts
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { modelUrl, textureUrl, type ModelName } from "../data/models";

/*
  The pack ships binary FBX 7.4 with no embedded texture references at all, so
  the material has to be rebuilt here and paired with Materials/<name>.png by
  filename. That pairing is the whole contract; get it wrong and every prop
  renders flat white.

  Models are cached and cloned rather than re-fetched, so four cartridges and
  four paintings cost one network round trip each.
*/
const loader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();
const cache = new Map<string, Promise<THREE.Group>>();

function loadTexture(name: ModelName): Promise<THREE.Texture> {
  return textureLoader.loadAsync(textureUrl(name)).then((texture) => {
    // These are palette swatches - desk.png is 631 bytes at 128x128. Any
    // smoothing or mipmapping turns them to mush, so keep them hard.
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    return texture;
  });
}

function load(name: ModelName): Promise<THREE.Group> {
  const cached = cache.get(name);
  if (cached) return cached;

  const pending = Promise.all([
    loader.loadAsync(modelUrl(name)),
    loadTexture(name),
  ]).then(([group, map]) => {
    const material = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.85,
      metalness: 0,
    });
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return group;
  });

  cache.set(name, pending);
  return pending;
}

/** A fresh clone of the model, or null while it is still loading. */
export function useModel(name: ModelName): THREE.Group | null {
  const [group, setGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let live = true;
    load(name).then((loaded) => {
      if (live) setGroup(loaded.clone(true));
    });
    return () => {
      live = false;
    };
  }, [name]);

  return group;
}

export async function preloadModels(names: readonly ModelName[]): Promise<void> {
  await Promise.all(names.map(load));
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors from `room/engine/useModels.ts`. If `FBXLoader` cannot be found, confirm `@types/three` installed in Task 1 and that the import path is `three/examples/jsm/loaders/FBXLoader.js` with the `.js` extension.

- [ ] **Step 3: Commit**

```bash
git add room/engine/useModels.ts
git commit -m "Add FBX loader that pairs pack models with their textures by name"
```

---

### Task 10: `Room.tsx` — canvas, lights, floor, walls

**Files:**
- Create: `room/engine/Room.tsx`
- Create: `room/engine/Scenery.tsx`
- Create: `app/room-page.tsx` (temporary preview route wiring, replaced in Task 17)
- Create: `app/preview/page.tsx` (temporary, deleted in Task 17)

**Interfaces:**
- Consumes: `SCENE`, `ARCHITECTURE`, `ZONES`, `ZONE_ORDER` (Task 5); `useModel`, `preloadModels` (Task 9).
- Produces: `<Room />` — the `<Canvas>` with lighting and all scenery mounted. Tasks 11–15 mount their pieces inside it.

A temporary `/preview` route exists so the room can be looked at before Task 17 deletes the Pixi homepage. That keeps `npm run build` green throughout.

- [ ] **Step 1: Write the scenery renderer**

Create `room/engine/Scenery.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import type { Prop } from "../data/scene";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;

/** One non-interactive prop. No pointer handlers at all - that is the spec's scenery rule. */
export function SceneryProp({ prop }: { prop: Prop }) {
  const model = useModel(prop.model);
  const object = useMemo(() => model, [model]);
  if (!object) return null;
  return (
    <primitive
      object={object}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, prop.rotationY * DEG, 0]}
      scale={prop.scale ?? 1}
    />
  );
}
```

- [ ] **Step 2: Write the room**

Create `room/engine/Room.tsx`:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { ARCHITECTURE, SCENE } from "../data/scene";
import { ZONES, ZONE_ORDER } from "../data/zones";
import { SceneryProp } from "./Scenery";

/*
  A cutaway box: floor, back-left wall, back-right wall, no front walls. The
  camera looks in over the open corner, and swivel.ts keeps it from ever
  rotating far enough to see the missing sides.

  Night lighting is not decoration. Six warm pools against a dark room are what
  make the six zones read as separate places without a single line of UI chrome.
*/
export function Room() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 50, position: [9, 7, 9] }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b0d16"]} />

      {/* Nothing goes fully black. */}
      <ambientLight color="#2a3350" intensity={0.6} />

      {/* Keeps silhouettes legible from the open corner. */}
      <directionalLight color="#8fa6d8" intensity={0.25} position={[8, 10, 8]} />

      {/* One warm pool per zone: this is what makes a zone look like a zone. */}
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <pointLight
            key={id}
            color={zone.light.color}
            intensity={zone.light.intensity}
            distance={7}
            decay={2}
            castShadow
            shadow-mapSize={[512, 512]}
            position={[zone.origin.x, 2.4, zone.origin.z]}
          />
        );
      })}

      {/* The desk lamp, sitting inside the lamp model. */}
      <pointLight color="#ffbb66" intensity={14} distance={5} decay={2} position={[0.4, 1.35, -4.3]} />

      {/* Monitor glow, cool against all that warmth. */}
      <rectAreaLight
        color="#9fd0ff"
        intensity={6}
        width={1.1}
        height={0.7}
        position={[1.2, 1.15, -4.1]}
        rotation={[0, 0, 0]}
      />

      {/* Warm light spilling through the ajar contact door. */}
      <spotLight
        color="#ffd9a8"
        intensity={18}
        distance={8}
        angle={0.7}
        penumbra={0.8}
        position={[5.6, 2, -1.5]}
        target-position={[3, 0, -1]}
      />

      <group>
        {ARCHITECTURE.map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
        {SCENE.filter((p) => !p.binding).map((prop) => (
          <SceneryProp key={prop.id} prop={prop} />
        ))}
      </group>
    </Canvas>
  );
}
```

- [ ] **Step 3: Add the temporary preview route**

Create `app/preview/page.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

/*
  Temporary while the room is built alongside the old world. Task 17 deletes
  this and moves the room onto `/`.

  This page is a Client Component because Next 16 rejects `ssr: false` on
  `next/dynamic` inside a Server Component. The real entry point in Task 17
  (`room/RoomShell.tsx`) is a client component for the same reason.
*/
const Room = dynamic(() => import("@/room/engine/Room").then((m) => m.Room), {
  ssr: false,
});

export default function Preview() {
  return (
    <main style={{ position: "fixed", inset: 0 }}>
      <Room />
    </main>
  );
}
```

**The `"use client"` is required, not stylistic.** Without it Next 16 fails the
route with `ssr: false is not allowed with next/dynamic in Server Components`
and no canvas ever mounts.

- [ ] **Step 4: Look at it**

Run: `npm run dev`, open `http://localhost:3000/preview`.
Expected: a dark room with lit furniture, the floor and two walls visible, no console 404s for `.fbx` or `.png`.

If props are flat white, the texture pairing in Task 9 failed — check the Network tab for 404s under `/room-assets/textures/`.
If props are enormous or invisible, note the scale: Task 18 tunes `scale` in `scene.ts`. Record what factor looks right; do not tune it yet.

- [ ] **Step 5: Commit**

```bash
git add room/engine/Room.tsx room/engine/Scenery.tsx app/preview/page.tsx
git commit -m "Render the cutaway room with night lighting and scenery"
```

---

### Task 11: `Prop.tsx` — hover, click, focus ring, idle pulse

**Files:**
- Create: `room/engine/Prop.tsx`
- Create: `room/engine/roomState.ts`
- Modify: `room/engine/Room.tsx`

**Interfaces:**
- Consumes: `Prop` (Task 5), `useModel` (Task 9).
- Produces:
  - `roomState.ts`: `type RoomState = { level: Level; zone: ZoneId | null; item: string | null; hovered: string | null; focused: string | null; opened: Set<string> }` and a zustand-free React context `useRoom()` returning `{ state, openItem(id), openZone(z), goHome(), setHovered(id), setFocused(id) }`.
  - `<InteractiveProp prop={...} />`.

- [ ] **Step 1: Write the room state**

Create `room/engine/roomState.ts`:

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { BINDINGS } from "../data/bindings";
import type { ZoneId } from "../data/zones";
import type { Level } from "./focus";

export interface RoomState {
  level: Level;
  zone: ZoneId | null;
  item: string | null;
  hovered: string | null;
  /** Keyboard focus, which is separate from hover. */
  focused: string | null;
  /** Bindings opened this session; they stop pulsing once opened. */
  opened: Set<string>;
}

interface RoomApi {
  state: RoomState;
  openItem: (bindingId: string) => void;
  openZone: (zone: ZoneId) => void;
  goHome: () => void;
  /** Steps back exactly one level, which is what Escape does. */
  back: () => void;
  setHovered: (id: string | null) => void;
  setFocused: (id: string | null) => void;
}

const RoomContext = createContext<RoomApi | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RoomState>({
    level: "home",
    zone: null,
    item: null,
    hovered: null,
    focused: null,
    opened: new Set(),
  });

  const openItem = useCallback((bindingId: string) => {
    const content = BINDINGS[bindingId];
    if (!content) return;
    setState((s) => ({
      ...s,
      level: "item",
      zone: content.zone,
      item: bindingId,
      opened: new Set(s.opened).add(bindingId),
    }));
  }, []);

  const openZone = useCallback((zone: ZoneId) => {
    setState((s) => ({ ...s, level: "zone", zone, item: null }));
  }, []);

  const goHome = useCallback(() => {
    setState((s) => ({ ...s, level: "home", zone: null, item: null }));
  }, []);

  // Exactly one level, never two. There is no state you cannot get home from.
  const back = useCallback(() => {
    setState((s) =>
      s.level === "item"
        ? { ...s, level: "zone", item: null }
        : { ...s, level: "home", zone: null, item: null },
    );
  }, []);

  const setHovered = useCallback((id: string | null) => {
    setState((s) => (s.hovered === id ? s : { ...s, hovered: id }));
  }, []);

  const setFocused = useCallback((id: string | null) => {
    setState((s) => (s.focused === id ? s : { ...s, focused: id }));
  }, []);

  const api = useMemo(
    () => ({ state, openItem, openZone, goHome, back, setHovered, setFocused }),
    [state, openItem, openZone, goHome, back, setHovered, setFocused],
  );

  return <RoomContext.Provider value={api}>{children}</RoomContext.Provider>;
}

export function useRoom(): RoomApi {
  const api = useContext(RoomContext);
  if (!api) throw new Error("useRoom must be used inside <RoomProvider>");
  return api;
}
```

- [ ] **Step 2: Write the interactive prop**

Create `room/engine/Prop.tsx`:

```tsx
"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { BINDINGS, titleOf } from "../data/bindings";
import type { Prop } from "../data/scene";
import { useRoom } from "./roomState";
import { useModel } from "./useModels";

const DEG = Math.PI / 180;
const LIFT = 0.02; // 2cm, the spec's hover lift

/*
  One clickable object.

  Hover lifts it and labels it and does nothing else - no dimming of the room,
  no ghosting of its neighbours. The room stays exactly as it was so that a
  hover reads as "this one is alive", not "everything else just left".
*/
export function InteractiveProp({ prop, idleHint }: { prop: Prop; idleHint: boolean }) {
  const model = useModel(prop.model);
  const group = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const { state, openItem, setHovered } = useRoom();

  const binding = prop.binding!;
  const label = useMemo(() => {
    const content = BINDINGS[binding];
    return content ? titleOf(content) : prop.id;
  }, [binding, prop.id]);

  const isFocused = state.focused === prop.id;
  const unopened = !state.opened.has(binding);
  const active = hover || isFocused;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pulse =
      idleHint && unopened && !active
        ? Math.sin(clock.elapsedTime * 2.2) * 0.5 + 0.5
        : 0;
    const target = prop.position.y + (active ? LIFT : 0) + pulse * 0.012;
    group.current.position.y += (target - group.current.position.y) * 0.2;
  });

  if (!model) return null;

  return (
    <group
      ref={group}
      position={[prop.position.x, prop.position.y, prop.position.z]}
      rotation={[0, prop.rotationY * DEG, 0]}
      scale={prop.scale ?? 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        setHovered(prop.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHover(false);
        setHovered(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        openItem(binding);
      }}
    >
      <primitive object={model} />

      {/* Warm rim light, so the lift reads even against a dark wall. */}
      {active && <pointLight color="#ffd9a0" intensity={3} distance={1.6} decay={2} position={[0, 0.5, 0]} />}

      {active && (
        <Html center distanceFactor={9} position={[0, 0.9, 0]} style={{ pointerEvents: "none" }}>
          <span
            style={{
              background: "rgba(12,14,22,0.86)",
              border: isFocused ? "1px solid #ffd9a0" : "1px solid rgba(255,217,160,0.35)",
              color: "#f4ead9",
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}
```

- [ ] **Step 3: Mount interactive props and the idle timer in `Room.tsx`**

In `room/engine/Room.tsx`, add imports:

```tsx
import { useEffect, useState } from "react";
import { InteractiveProp } from "./Prop";
import { useRoom } from "./roomState";
```

Add inside the component, above the `return`:

```tsx
  const { state } = useRoom();
  const [idleHint, setIdleHint] = useState(false);

  // After 8 seconds of nothing at home, unopened objects start pulsing. It is
  // the only nudge in the room, and any input cancels it.
  useEffect(() => {
    if (state.level !== "home") {
      setIdleHint(false);
      return;
    }
    let timer = window.setTimeout(() => setIdleHint(true), 8000);
    const reset = () => {
      setIdleHint(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdleHint(true), 8000);
    };
    for (const ev of ["pointerdown", "pointermove", "wheel", "keydown"] as const) {
      window.addEventListener(ev, reset);
    }
    return () => {
      window.clearTimeout(timer);
      for (const ev of ["pointerdown", "pointermove", "wheel", "keydown"] as const) {
        window.removeEventListener(ev, reset);
      }
    };
  }, [state.level]);
```

And inside the `<group>`, after the scenery:

```tsx
        {SCENE.filter((p) => p.binding).map((prop) => (
          <InteractiveProp key={prop.id} prop={prop} idleHint={idleHint} />
        ))}
```

- [ ] **Step 4: Wrap the preview in the provider**

In `app/preview/page.tsx`, wrap `<Room />`:

```tsx
import { RoomProvider } from "@/room/engine/roomState";
// ...
    <main style={{ position: "fixed", inset: 0 }}>
      <RoomProvider>
        <Room />
      </RoomProvider>
    </main>
```

`RoomProvider` must be imported dynamically alongside `Room` or marked `"use client"` — it already is.

- [ ] **Step 5: Look at it**

Run: `npm run dev`, open `/preview`.
Expected: hovering the monitor, briefcase, cartridges, paintings, cabinet, couch, bookcase, mug and door lifts each and shows a label. Hovering the desk, chair, keyboard, TV or plant does nothing at all. Wait 8s without moving: unopened objects pulse gently.

- [ ] **Step 6: Commit**

```bash
git add room/engine/Prop.tsx room/engine/roomState.ts room/engine/Room.tsx app/preview/page.tsx
git commit -m "Make bound objects hoverable and clickable, with an idle nudge"
```

---

### Task 12: `CameraRig.tsx` — swivel, zoom and the three-level glide

**Files:**
- Create: `room/engine/CameraRig.tsx`
- Modify: `room/engine/Room.tsx`

**Interfaces:**
- Consumes: `applyDrag`, `clampSwivel` (Task 3); `framingFor`, `isMobile` (Task 4); `sweepAt`, `SWEEP_DURATION_MS` (Task 8); `useRoom` (Task 11); `ZONES` (Task 5).
- Produces: `<CameraRig />`, mounted inside `<Canvas>`.

- [ ] **Step 1: Write the rig**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "../data/scene";
import { ZONES } from "../data/zones";
import { SWEEP_DURATION_MS, sweepAt } from "./attract";
import { framingFor, isMobile, type Bounds } from "./focus";
import { applyDrag, type Swivel } from "./swivel";
import { useRoom } from "./roomState";

const HOME: Bounds = { center: { x: 0, y: 1.2, z: -0.5 }, radius: 6.5 };

function boundsForZone(id: keyof typeof ZONES): Bounds {
  const zone = ZONES[id];
  return {
    center: { x: zone.origin.x, y: 1, z: zone.origin.z },
    radius: Math.max(zone.size.w, zone.size.d) * 0.75,
  };
}

function boundsForProp(propId: string): Bounds {
  const prop = SCENE.find((p) => p.id === propId);
  if (!prop) return HOME;
  return { center: { ...prop.position, y: prop.position.y + 0.4 }, radius: 0.9 };
}

/*
  Owns the camera. Everything decidable without a renderer was decided in
  swivel.ts and focus.ts; this glues those to three.js and tweens between them.

  Swivel stays live at every level, including with a panel open - the room is
  never frozen while you read, which is the whole point of not using a
  full-screen takeover.
*/
export function CameraRig() {
  const { camera, size } = useThree();
  const { state, back } = useRoom();
  const [swivel, setSwivel] = useState<Swivel>({ yaw: 0, pitch: 0 });
  const [zoom, setZoom] = useState(1);
  const [sweepStart] = useState(() => Date.now());
  const [sweeping, setSweeping] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const target = useRef(new THREE.Vector3());

  // Any input aborts the establishing sweep immediately.
  useEffect(() => {
    const stop = () => setSweeping(false);
    for (const ev of ["pointerdown", "wheel", "keydown"] as const) {
      window.addEventListener(ev, stop, { once: true });
    }
    const done = window.setTimeout(stop, SWEEP_DURATION_MS + 200);
    return () => window.clearTimeout(done);
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => (drag.current = { x: e.clientX, y: e.clientY });
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      drag.current = { x: e.clientX, y: e.clientY };
      setSwivel((s) => applyDrag(s, dx, dy));
    };
    const onUp = () => (drag.current = null);
    const onWheel = (e: WheelEvent) => {
      setZoom((z) => Math.min(1.35, Math.max(0.65, z + Math.sign(e.deltaY) * 0.06)));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [back]);

  useFrame(() => {
    // Which bounds are we framing?
    let bounds = HOME;
    let level = state.level;

    if (sweeping) {
      const zone = sweepAt(Date.now() - sweepStart);
      bounds = zone ? boundsForZone(zone) : HOME;
      level = zone ? "zone" : "home";
    } else if (state.level === "item" && (state.focused || state.item)) {
      const propId =
        state.focused ??
        SCENE.find((p) => p.binding === state.item)?.id ??
        "";
      bounds = boundsForProp(propId);
    } else if (state.level === "zone" && state.zone) {
      bounds = boundsForZone(state.zone);
    }

    const framing = framingFor(level, bounds, size, 50);

    // Place the camera on the swivel direction, `distance` back from target.
    const yaw = (swivel.yaw + 45) * (Math.PI / 180);
    const pitch = (swivel.pitch + 28) * (Math.PI / 180);
    const d = framing.distance * zoom;
    const desired = new THREE.Vector3(
      framing.target.x + d * Math.cos(pitch) * Math.sin(yaw),
      framing.target.y + d * Math.sin(pitch),
      framing.target.z + d * Math.cos(pitch) * Math.cos(yaw),
    );

    camera.position.lerp(desired, 0.08);
    target.current.lerp(
      new THREE.Vector3(framing.target.x, framing.target.y, framing.target.z),
      0.08,
    );
    camera.lookAt(target.current);

    // Slide the subject to its screen anchor by offsetting the projection.
    const offX = (framing.screenAnchor.x - 0.5) * 2;
    const offY = (0.5 - framing.screenAnchor.y) * 2;
    const cam = camera as THREE.PerspectiveCamera;
    cam.setViewOffset(
      size.width,
      size.height,
      -offX * size.width * 0.5,
      -offY * size.height * 0.5,
      size.width,
      size.height,
    );
    cam.updateProjectionMatrix();
  });

  return null;
}
```

- [ ] **Step 2: Mount it and make empty floor step back**

In `room/engine/Room.tsx`, import and mount `<CameraRig />` as the first child of `<Canvas>`. Widen the existing destructure from `const { state } = useRoom();` to `const { state, back } = useRoom();` — `back` is needed by the backplate below. Then add a click-through backplate so clicking nothing steps back a level. Inside `<Canvas>`, before `<group>`:

```tsx
      <CameraRig />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={() => back()}
      >
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#141726" />
      </mesh>
```

- [ ] **Step 3: Look at it**

Run: `npm run dev`, open `/preview`.
Expected:
- On load the camera pans across all six zones over ~4s then settles wide. Clicking during it stops it dead.
- Dragging swivels; it stops hard at the limits and never shows behind the missing walls.
- Scrolling zooms within a limited range.
- Clicking the monitor glides the camera in and puts it in the left portion of the screen.
- Escape steps back out one level at a time.

- [ ] **Step 4: Commit**

```bash
git add room/engine/CameraRig.tsx room/engine/Room.tsx
git commit -m "Add the camera rig: swivel, zoom, sweep and three-level focus"
```

---

### Task 13: In-world surfaces — floor decals and the live monitor

**Files:**
- Create: `room/ui/ZoneDecal.tsx`
- Create: `room/ui/MonitorScreen.tsx`
- Modify: `room/engine/Room.tsx`

**Interfaces:**
- Consumes: `ZONES`, `ZONE_ORDER` (Task 5); `useRoom` (Task 11); `resolveBinding` (Task 6); `cardImageOf` from `@/constants/pages/types`.
- Produces: `<ZoneDecals />` and `<MonitorScreen />`, both mounted inside `<Canvas>`.

Two pieces of signage that live in the room rather than over it. The decals are what replaces the deleted rail visually — the section names exist, on the floor in perspective. The monitor is spec §5's "the desk monitor lights up with the open item's cover image", which is what keeps the room feeling like it is responding to you while you read.

- [ ] **Step 1: Write the decals**

```tsx
"use client";

import { Text } from "@react-three/drei";
import { SCENE } from "../data/scene";
import { ZONES, ZONE_ORDER } from "../data/zones";
import { SceneryProp } from "../engine/Scenery";
import { useRoom } from "../engine/roomState";

/*
  Section names, printed on the rugs.

  The spec forbids a nav bar, so the six labels have to live somewhere a visitor
  will read them without them being chrome. On the floor, in perspective, lit by
  that zone's own lamp, they are signage inside the room rather than an overlay
  on top of it. Clicking a rug is also how you enter a zone.
*/
export function ZoneDecals() {
  const { state, openZone } = useRoom();

  return (
    <group>
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        const active = state.zone === id;
        return (
          <group key={id} position={[zone.origin.x, 0, zone.origin.z]}>
            {/* The clickable floor area for this zone. */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.005, 0]}
              onClick={(e) => {
                e.stopPropagation();
                openZone(id);
              }}
              onPointerOver={() => (document.body.style.cursor = "pointer")}
              onPointerOut={() => (document.body.style.cursor = "auto")}
            >
              <planeGeometry args={[zone.size.w, zone.size.d]} />
              <meshStandardMaterial
                color={active ? "#2b2338" : "#1b1c2b"}
                transparent
                opacity={0.55}
              />
            </mesh>

            <Text
              position={[0, 0.02, zone.size.d / 2 - 0.35]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.24}
              color={active ? "#ffe2b8" : "#8d7f6d"}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.18}
            >
              {zone.label.toUpperCase()}
            </Text>
          </group>
        );
      })}

      {/* The carpets themselves, from the pack. */}
      {ZONE_ORDER.map((id) => {
        const zone = ZONES[id];
        return (
          <SceneryProp
            key={`carpet:${id}`}
            prop={{
              id: `carpet:${id}`,
              model: zone.carpet,
              zone: id,
              position: { x: zone.origin.x, y: 0, z: zone.origin.z },
              rotationY: 0,
            }}
          />
        );
      })}
    </group>
  );
}
```

- [ ] **Step 2: Write the live monitor**

Create `room/ui/MonitorScreen.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { cardImageOf } from "@/constants/pages/types";
import { resolveBinding } from "../data/bindings";
import { useRoom } from "../engine/roomState";

/*
  The desk monitor shows whatever is currently open.

  It is a small thing that does a large amount of work: while you read the panel,
  the room visibly answers you. Without it the camera move is the only feedback
  that the room noticed, and the illusion thins.

  Positioned to sit just in front of the computer_screen model's glass. Task 18
  nudges these numbers once the furniture is finally placed.
*/
const IDLE_COLOUR = "#12305a";

export function MonitorScreen() {
  const { state } = useRoom();
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const content = state.item ? resolveBinding(state.item) : undefined;
  const src = content?.kind === "project" ? cardImageOf(content.data) : undefined;

  useEffect(() => {
    if (!src) {
      setTexture(null);
      return;
    }
    let live = true;
    new THREE.TextureLoader().loadAsync(src).then((loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (live) setTexture(loaded);
      else loaded.dispose();
    });
    return () => {
      live = false;
    };
  }, [src]);

  return (
    <mesh position={[1.2, 1.15, -4.07]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.98, 0.6]} />
      {texture ? (
        // Unlit, so the screen reads as emitting rather than being lit by the room.
        <meshBasicMaterial map={texture} toneMapped={false} />
      ) : (
        <meshBasicMaterial color={IDLE_COLOUR} toneMapped={false} />
      )}
    </mesh>
  );
}
```

- [ ] **Step 3: Mount both in `Room.tsx`**

Add the imports:

```tsx
import { MonitorScreen } from "../ui/MonitorScreen";
import { ZoneDecals } from "../ui/ZoneDecal";
```

Place `<ZoneDecals />` inside `<group>` before the architecture, and `<MonitorScreen />` after the interactive props.

- [ ] **Step 4: Look at it**

Run: `npm run dev`, open `/preview`.
Expected:
- Six rugs, each with its section name lying flat on it in perspective. Clicking a rug moves the camera into that zone, and the active zone's lettering is brighter.
- The monitor glows dim blue when nothing is open, and shows the project's cover art when Git Dummy or a hackathon is open.

If the screen plane z-fights with the monitor model, nudge its z by ±0.02 until it sits cleanly in front of the glass.

- [ ] **Step 5: Commit**

```bash
git add room/ui/ZoneDecal.tsx room/ui/MonitorScreen.tsx room/engine/Room.tsx
git commit -m "Print section names on the floor and show open work on the monitor"
```

---

### Task 14: `Panel.tsx` and the content bodies

**Files:**
- Create: `room/ui/Panel.tsx`
- Create: `room/ui/bodies/ProjectBody.tsx`
- Create: `room/ui/bodies/ExperienceBody.tsx`
- Create: `room/ui/bodies/CertificateBody.tsx`
- Create: `room/ui/bodies/ListBody.tsx`
- Create: `room/ui/bodies/AboutBody.tsx`
- Create: `room/ui/bodies/ToolkitBody.tsx`
- Create: `room/ui/bodies/ContactBody.tsx`
- Create: `room/ui/bodies/CreditsBody.tsx`
- Modify: `app/preview/page.tsx`

**Interfaces:**
- Consumes: `PanelContent`, `resolveBinding`, `siblingsOf`, `titleOf`, `RESUME_HREF` (Task 6); `useRoom` (Task 11); `ContactForm` (existing `components/contact-form.tsx`).
- Produces: `<Panel />`, rendered as a DOM sibling of the `<Canvas>`, never inside it.

The panel is DOM, not 3D. It sits beside the canvas, and the canvas is never blurred or dimmed behind it.

- [ ] **Step 1: Write the bodies**

Create `room/ui/bodies/ProjectBody.tsx`:

```tsx
import Image from "next/image";
import type { PageData } from "@/constants/pages/types";

export function ProjectBody({ data }: { data: PageData }) {
  return (
    <article className="space-y-6">
      {data.cardKicker && (
        <p className="text-xs uppercase tracking-widest text-amber-200/70">{data.cardKicker}</p>
      )}
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-amber-50">{data.title}</h2>
        <p className="text-sm text-amber-100/50">
          {data.date}
          {data.award ? ` · ${data.award}` : ""}
        </p>
      </header>

      <ul className="flex flex-wrap gap-1.5">
        {data.techs.map((tech) => (
          <li key={tech} className="rounded-full border border-amber-200/20 px-2 py-0.5 text-xs text-amber-100/70">
            {tech}
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed text-amber-50/85">{data.overview}</p>

      {data.links.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {data.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {data.images.length > 0 && (
        <div className="space-y-3">
          {data.images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={880}
              height={550}
              className="w-full rounded-lg border border-amber-200/10"
            />
          ))}
        </div>
      )}

      <Section title="Impact" items={data.impacts} />
      <Section title="What I did" items={data.whatIDid} />

      <section className="space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-amber-200/70">Reflection</h3>
        <p className="text-sm leading-relaxed text-amber-50/75">{data.reflection}</p>
      </section>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-widest text-amber-200/70">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-amber-50/80">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Create `room/ui/bodies/ExperienceBody.tsx`:

```tsx
import type { ExperienceEntry } from "@/constants/pages/experience";

export function ExperienceBody({
  entries,
  resumeHref,
}: {
  entries: ExperienceEntry[];
  resumeHref: string;
}) {
  return (
    <div className="space-y-7">
      <a
        href={resumeHref}
        download
        className="inline-block rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
      >
        Download resume
      </a>

      {entries.map((entry) => (
        <article key={entry.id} className="space-y-2 border-l border-amber-200/15 pl-4">
          <h3 className="text-lg font-medium text-amber-50">{entry.role}</h3>
          <p className="text-sm text-amber-100/60">
            {entry.organisation}
            {entry.type ? ` · ${entry.type}` : ""}
          </p>
          <p className="text-xs text-amber-100/40">
            {entry.period}
            {entry.location ? ` · ${entry.location}` : ""}
          </p>
          {entry.highlights && (
            <ul className="space-y-1.5 pt-1">
              {entry.highlights.map((h) => (
                <li key={h} className="text-sm leading-relaxed text-amber-50/80">
                  {h}
                </li>
              ))}
            </ul>
          )}
          {entry.link && (
            <a
              href={entry.link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-amber-200 underline underline-offset-4"
            >
              {entry.link.label}
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
```

Create `room/ui/bodies/CertificateBody.tsx`:

```tsx
import type { CertificateEntry } from "@/constants/pages/experience";

export function CertificateBody({ entry }: { entry: CertificateEntry }) {
  return (
    <article className="space-y-3">
      <h2 className="text-xl font-semibold text-amber-50">{entry.name}</h2>
      <p className="text-sm text-amber-100/60">{entry.issuer}</p>
      <p className="text-xs text-amber-100/40">Issued {entry.issued}</p>
      {entry.credentialUrl && (
        <a
          href={entry.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
        >
          Verify credential
        </a>
      )}
    </article>
  );
}
```

Create `room/ui/bodies/ListBody.tsx`:

```tsx
import { BINDINGS, titleOf } from "@/room/data/bindings";

export function ListBody({ of, onPick }: { of: string[]; onPick: (id: string) => void }) {
  return (
    <ul className="space-y-2">
      {of.map((id) => {
        const content = BINDINGS[id];
        if (!content) return null;
        return (
          <li key={id}>
            <button
              onClick={() => onPick(id)}
              className="w-full rounded-md border border-amber-200/15 px-3 py-2.5 text-left text-sm text-amber-50/90 hover:border-amber-200/40 hover:bg-amber-200/5"
            >
              {titleOf(content)}
              {content.kind === "project" && content.data.cardKicker && (
                <span className="block pt-0.5 text-xs text-amber-100/45">
                  {content.data.cardKicker}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

Create `room/ui/bodies/AboutBody.tsx`:

```tsx
import Image from "next/image";
import type { AboutData } from "@/constants/pages/about";

export function AboutBody({ data, onToolkit }: { data: AboutData; onToolkit: () => void }) {
  return (
    <article className="space-y-6">
      <Image
        src={data.images.portrait.src}
        alt={data.images.portrait.alt}
        width={640}
        height={640}
        className="w-40 rounded-lg border border-amber-200/10"
      />
      <p className="text-base leading-relaxed text-amber-50">{data.lead}</p>

      {data.sections.map((section) => (
        <section key={section.label} className="space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-amber-200/70">{section.label}</h3>
          {section.paragraphs.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-amber-50/80">
              {p}
            </p>
          ))}
        </section>
      ))}

      <blockquote className="border-l-2 border-amber-200/40 pl-4">
        <p className="text-sm italic text-amber-50/90">{data.pullQuote.text}</p>
        <footer className="pt-1 text-xs text-amber-100/45">{data.pullQuote.caption}</footer>
      </blockquote>

      <ul className="flex flex-wrap gap-1.5">
        {data.disciplines.map((d) => (
          <li key={d} className="rounded-full border border-amber-200/20 px-2 py-0.5 text-xs text-amber-100/70">
            {d}
          </li>
        ))}
      </ul>

      <button
        onClick={onToolkit}
        className="rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
      >
        See the toolkit
      </button>
    </article>
  );
}
```

Create `room/ui/bodies/ToolkitBody.tsx`:

```tsx
export function ToolkitBody({ rows }: { rows: string[][] }) {
  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <ul key={i} className="flex flex-wrap gap-1.5">
          {row.map((tech) => (
            <li key={tech} className="rounded-full border border-amber-200/20 px-2.5 py-1 text-xs text-amber-100/80">
              {tech}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}
```

Create `room/ui/bodies/ContactBody.tsx`:

```tsx
"use client";

import { ContactForm } from "@/components/contact-form";
import type { ContactChannel } from "@/constants/contact";

export function ContactBody({ channels }: { channels: readonly ContactChannel[] }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-amber-50/85">
        Send a message and it lands in my inbox.
      </p>
      <ContactForm />
      <ul className="space-y-1.5 border-t border-amber-200/15 pt-4">
        {channels.map((channel) => (
          <li key={channel.label} className="text-sm">
            <span className="text-amber-100/45">{channel.label} · </span>
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer"
              className="text-amber-100 underline underline-offset-4"
            >
              {channel.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Create `room/ui/bodies/CreditsBody.tsx`:

```tsx
export function CreditsBody() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-amber-50/80">
      <p>This room is built from the House &amp; Office asset pack by francoface.</p>
      <p>Rendered with three.js and React Three Fiber. The rest of the site is Next.js.</p>
      <p className="text-amber-100/45">You found the mug. There is nothing else in it.</p>
    </div>
  );
}
```

- [ ] **Step 2: Write the panel**

Create `room/ui/Panel.tsx`:

```tsx
"use client";

import { resolveBinding, siblingsOf, titleOf } from "../data/bindings";
import { useRoom } from "../engine/roomState";
import { AboutBody } from "./bodies/AboutBody";
import { CertificateBody } from "./bodies/CertificateBody";
import { ContactBody } from "./bodies/ContactBody";
import { CreditsBody } from "./bodies/CreditsBody";
import { ExperienceBody } from "./bodies/ExperienceBody";
import { ListBody } from "./bodies/ListBody";
import { ProjectBody } from "./bodies/ProjectBody";
import { ToolkitBody } from "./bodies/ToolkitBody";

/*
  The reader.

  It slides in beside the room, never over it: the canvas keeps rendering, keeps
  its lights, and stays swivel-able the whole time. That is the difference
  between "a panel opened" and "I went to another page", and it is the thing the
  whole design is built around.

  Desktop: right 45%. Mobile: a 60%-height bottom sheet.
*/
export function Panel() {
  const { state, openItem, back } = useRoom();
  const open = state.level === "item" && state.item !== null;
  const content = state.item ? resolveBinding(state.item) : undefined;
  const siblings = state.item ? siblingsOf(state.item) : [];

  return (
    <aside
      aria-hidden={!open}
      className={[
        "fixed z-20 overflow-y-auto border-amber-200/15 bg-[#0d0f18]/95 backdrop-blur-sm transition-transform duration-500 ease-out",
        "inset-x-0 bottom-0 h-[60svh] rounded-t-2xl border-t",
        "md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[45vw] md:rounded-none md:border-l md:border-t-0",
        open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full",
      ].join(" ")}
    >
      {content && (
        <div className="p-6 md:p-10">
          <div className="flex items-start justify-between gap-4 pb-6">
            <p className="text-xs uppercase tracking-widest text-amber-200/60">
              {titleOf(content)}
            </p>
            <button
              onClick={back}
              aria-label="Close"
              className="rounded-full border border-amber-200/25 px-2.5 py-0.5 text-sm text-amber-100/70 hover:bg-amber-200/10"
            >
              ✕
            </button>
          </div>

          <Body content={content} onPick={openItem} />

          {siblings.length > 0 && (
            <nav className="mt-10 border-t border-amber-200/15 pt-5">
              <p className="pb-2 text-xs uppercase tracking-widest text-amber-200/50">
                More in this section
              </p>
              <ul className="space-y-1">
                {siblings.map((sibling) => (
                  <li key={sibling.id}>
                    <button
                      onClick={() => openItem(sibling.id)}
                      className="text-sm text-amber-100/70 underline underline-offset-4 hover:text-amber-50"
                    >
                      {sibling.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      )}
    </aside>
  );
}

function Body({
  content,
  onPick,
}: {
  content: NonNullable<ReturnType<typeof resolveBinding>>;
  onPick: (id: string) => void;
}) {
  switch (content.kind) {
    case "project":
      return <ProjectBody data={content.data} />;
    case "experience":
      return <ExperienceBody entries={content.entries} resumeHref={content.resumeHref} />;
    case "certificate":
      return <CertificateBody entry={content.entry} />;
    case "list":
      return <ListBody of={content.of} onPick={onPick} />;
    case "about":
      return <AboutBody data={content.data} onToolkit={() => onPick("toolkit")} />;
    case "toolkit":
      return <ToolkitBody rows={content.rows} />;
    case "contact":
      return <ContactBody channels={content.channels} />;
    case "credits":
      return <CreditsBody />;
  }
}
```

- [ ] **Step 3: Check what `ContactForm` exports**

Run: `grep -n "export" components/contact-form.tsx`
If it is a default export, change the import in `ContactBody.tsx` to `import ContactForm from "@/components/contact-form";`. If it requires props, pass them; do not change the component's signature.

- [ ] **Step 4: Mount the panel in the preview**

In `app/preview/page.tsx`, add `<Panel />` as a sibling of `<Room />` inside `<RoomProvider>`, importing it dynamically with `ssr: false` alongside `Room`.

- [ ] **Step 5: Look at it**

Run: `npm run dev`, open `/preview`.
Expected: clicking the monitor opens Git Dummy in a right-hand panel with images and all sections; the room behind stays lit and can still be dragged. Clicking the NES opens a list of four hackathons; picking one opens it with the other three listed under "More in this section". Narrow the window below 768px: the panel becomes a bottom sheet.

- [ ] **Step 6: Commit**

```bash
git add room/ui app/preview/page.tsx
git commit -m "Add the reader panel and a content body per section"
```

---

### Task 15: URL sync, keyboard navigation and announcements

**Files:**
- Create: `room/engine/useRoomUrl.ts`
- Create: `room/engine/useRoomKeys.ts`
- Modify: `room/engine/Room.tsx`

**Interfaces:**
- Consumes: `tabOrder` (Task 7); `useRoom` (Task 11); `BINDINGS`, `titleOf` (Task 6); `SCENE` (Task 5); `ZONES` (Task 5).
- Produces: `useRoomUrl()` and `useRoomKeys()` hooks, plus an `aria-live` region.

- [ ] **Step 1: Write the URL sync**

Create `room/engine/useRoomUrl.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { BINDINGS } from "../data/bindings";
import { ZONES, type ZoneId } from "../data/zones";
import { useRoom } from "./roomState";

/*
  Keeps ?zone= and ?item= in step with the camera, so the back button steps back
  a level and a link to one project restores that exact framing. Uses
  replaceState rather than the router: this is camera state, not a navigation,
  and pushing a Next route would defeat the entire point of the design.
*/
export function useRoomUrl() {
  const { state, openItem, openZone, goHome } = useRoom();
  const applying = useRef(false);

  // Read the URL once on mount, and on every back/forward.
  useEffect(() => {
    const apply = () => {
      applying.current = true;
      const params = new URLSearchParams(window.location.search);
      const item = params.get("item");
      const zone = params.get("zone") as ZoneId | null;
      if (item && BINDINGS[item]) openItem(item);
      else if (zone && zone in ZONES) openZone(zone);
      else goHome();
      window.setTimeout(() => (applying.current = false), 0);
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, [openItem, openZone, goHome]);

  // Write the URL when the camera moves.
  useEffect(() => {
    if (applying.current) return;
    const params = new URLSearchParams();
    if (state.zone) params.set("zone", state.zone);
    if (state.item) params.set("item", state.item);
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (next !== window.location.pathname + window.location.search) {
      window.history.pushState(null, "", next);
    }
  }, [state.zone, state.item]);
}

/** True when the URL addresses an item directly, so the sweep should be skipped. */
export function urlAddressesItem(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("item") ?? params.get("zone"));
}
```

- [ ] **Step 2: Write the keyboard navigation**

Create `room/engine/useRoomKeys.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";
import { BINDINGS, titleOf } from "../data/bindings";
import { SCENE } from "../data/scene";
import { ZONES } from "../data/zones";
import { useRoom } from "./roomState";
import { tabOrder } from "./tabOrder";

/*
  There is no rail on screen, so Tab is the rail.

  Tab walks the room in section order, flying the camera to each object and
  announcing it. A mouse user never sees any of this; a keyboard user gets a
  complete map of a room they cannot drag. Returns the string to put in the
  aria-live region.
*/
export function useRoomKeys(): string {
  const { state, openItem, setFocused, back } = useRoom();
  const [announcement, setAnnouncement] = useState("");
  const index = useRef(-1);

  useEffect(() => {
    const order = tabOrder();
    const byId = new Map(SCENE.map((p) => [p.id, p]));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        index.current =
          (index.current + (e.shiftKey ? -1 : 1) + order.length) % order.length;
        const propId = order[index.current];
        const prop = byId.get(propId)!;
        const content = BINDINGS[prop.binding!];
        setFocused(propId);
        setAnnouncement(
          `${ZONES[prop.zone].label} — ${content ? titleOf(content) : propId}`,
        );
        return;
      }

      if (e.key === "Enter" && index.current >= 0) {
        const prop = byId.get(order[index.current]);
        if (prop?.binding) {
          e.preventDefault();
          openItem(prop.binding);
        }
        return;
      }

      if (e.key === "Escape") {
        back();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openItem, setFocused, back]);

  return announcement;
}
```

- [ ] **Step 3: Wire both into `Room.tsx`**

`Room.tsx` currently returns only `<Canvas>`. Wrap it so the live region is a DOM sibling:

```tsx
export function Room() {
  useRoomUrl();
  const announcement = useRoomKeys();
  // ...existing idle-hint effect...

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      <Canvas /* ...as before... */>
        {/* ...as before... */}
      </Canvas>
    </>
  );
}
```

Add the imports for `useRoomUrl` and `useRoomKeys`. Confirm `.sr-only` exists in `app/globals.css`; if Tailwind 4 does not provide it in this setup, add:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

- [ ] **Step 4: Skip the sweep when a link addresses an item, and de-duplicate Escape**

In `CameraRig.tsx`, change the sweep initialiser:

```tsx
  const [sweeping, setSweeping] = useState(() => !urlAddressesItem());
```

and import `urlAddressesItem` from `./useRoomUrl`. A shared link should land on its subject, not make the visitor sit through a tour first.

In the same file, **delete the Escape branch from the rig's `onKey` handler** and drop `onKey` from that effect's listeners along with `back` from its dependency array. `useRoomKeys` now owns Escape; leaving it in both makes one keypress step back two levels, which would skip the zone entirely and look like a bug in the camera.

- [ ] **Step 5: Verify by hand**

Run: `npm run dev`, open `/preview`.
- Tab six-plus times: the camera flies object to object in section order — Experience first, Contact last.
- Enter opens the focused object's panel; Escape closes it.
- The URL gains `?zone=projects&item=project:git-dummy` when the monitor opens.
- Copy that URL into a new tab: it opens with the panel already open and no sweep.
- Browser back closes the panel rather than leaving the site.

- [ ] **Step 6: Commit**

```bash
git add room/engine/useRoomUrl.ts room/engine/useRoomKeys.ts room/engine/Room.tsx room/engine/CameraRig.tsx app/globals.css
git commit -m "Sync camera state to the URL and make Tab the invisible rail"
```

---

### Task 16: `/text` — the fallback that carries everything

**Files:**
- Create: `room/fallback/TextSite.tsx`
- Create: `app/text/page.tsx`
- Create: `room/fallback/webgl.ts`

**Interfaces:**
- Consumes: `constants/pages/*` directly (not `BINDINGS` — this page is server-rendered and must not pull in client-only code).
- Produces: `<TextSite />`, `hasWebGL(): boolean`.

Anchors are `#<zone>-<item>` per the spec, matching the room's URL convention.

- [ ] **Step 1: Write the WebGL probe**

Create `room/fallback/webgl.ts`:

```ts
/*
  Whether this browser can run the room at all.

  A locked-down work laptop or an old phone gets a blank screen otherwise, and
  that visitor is very often the one deciding whether to interview you.
*/
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") ?? canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Write the text site**

Create `room/fallback/TextSite.tsx`:

```tsx
import { PROJECTS } from "@/constants/pages/projects";
import { HACKATHONS } from "@/constants/pages/hackathons";
import { CERTIFICATES, EXPERIENCE } from "@/constants/pages/experience";
import { ABOUT } from "@/constants/pages/about";
import { TOOLKIT_ROWS } from "@/constants/toolkit";
import { CONTACT_CHANNELS } from "@/constants/contact";
import type { PageData } from "@/constants/pages/types";

/*
  Every word of the portfolio as plain server-rendered HTML.

  It imports the same constants the room does, so the two cannot drift: adding a
  project makes it appear here and fail the room's coverage test in the same
  commit. This is what crawlers, link previews, screen readers and anyone
  without WebGL actually receive.
*/
export function TextSite() {
  return (
    <main className="mx-auto max-w-2xl space-y-16 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Travis Ang</h1>
        <p className="text-neutral-600 dark:text-neutral-300">{ABOUT.lead}</p>
        <p className="text-sm text-neutral-500">
          This is the text version. The full site is an interactive 3D room at{" "}
          <a href="/" className="underline underline-offset-4">
            the home page
          </a>
          .
        </p>
      </header>

      <section id="experience" className="space-y-6">
        <h2 className="text-xl font-semibold">Experience</h2>
        {EXPERIENCE.map((entry) => (
          <article key={entry.id} id={`experience-${entry.id}`} className="space-y-1.5">
            <h3 className="font-medium">
              {entry.role} · {entry.organisation}
            </h3>
            <p className="text-sm text-neutral-500">
              {entry.period}
              {entry.location ? ` · ${entry.location}` : ""}
            </p>
            {entry.highlights && (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
        <p>
          <a href="/files/resume.pdf" download className="underline underline-offset-4">
            Download resume
          </a>
        </p>
      </section>

      <TextProjects id="projects" title="Projects" items={PROJECTS} />
      <TextProjects id="hackathons" title="Hackathons" items={HACKATHONS} />

      <section id="certifications" className="space-y-4">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <ul className="space-y-2">
          {CERTIFICATES.map((cert) => (
            <li key={cert.id} id={`certifications-${cert.id}`} className="text-sm">
              <strong className="font-medium">{cert.name}</strong> · {cert.issuer} ·{" "}
              {cert.issued}
              {cert.credentialUrl && (
                <>
                  {" "}
                  <a href={cert.credentialUrl} className="underline underline-offset-4">
                    Verify
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="space-y-4">
        <h2 className="text-xl font-semibold">About Me</h2>
        {ABOUT.sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <h3 className="font-medium">{section.label}</h3>
            {section.paragraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        ))}
        <h3 className="font-medium">Toolkit</h3>
        <p className="text-sm">{TOOLKIT_ROWS.flat().join(" · ")}</p>
      </section>

      <section id="contact" className="space-y-3">
        <h2 className="text-xl font-semibold">Contact Me</h2>
        <ul className="space-y-1 text-sm">
          {CONTACT_CHANNELS.map((channel) => (
            <li key={channel.label}>
              {channel.label}:{" "}
              <a href={channel.href} className="underline underline-offset-4">
                {channel.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function TextProjects({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: PageData[];
}) {
  return (
    <section id={id} className="space-y-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {items.map((item) => (
        // Anchor matches the room's URL convention: #<zone>-<item>.
        <article key={item.slug} id={`${id}-${item.slug}`} className="space-y-2">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-neutral-500">
            {item.date}
            {item.award ? ` · ${item.award}` : ""} · {item.techs.join(", ")}
          </p>
          <p className="text-sm leading-relaxed">{item.overview}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {item.impacts.map((impact) => (
              <li key={impact}>{impact}</li>
            ))}
          </ul>
          {item.links.length > 0 && (
            <p className="text-sm">
              {item.links.map((link) => (
                <a key={link.href} href={link.href} className="mr-3 underline underline-offset-4">
                  {link.label}
                </a>
              ))}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
```

- [ ] **Step 3: Add the route**

Create `app/text/page.tsx`:

```tsx
import type { Metadata } from "next";
import { TextSite } from "@/room/fallback/TextSite";

export const metadata: Metadata = {
  title: "Travis Ang — portfolio (text version)",
  description: "Projects, hackathons, experience and certifications, in plain text.",
};

export default function TextPage() {
  return <TextSite />;
}
```

- [ ] **Step 4: Verify it renders server-side**

Run: `npm run dev`, then `curl -s http://localhost:3000/text | grep -c "Git Dummy"`
Expected: at least 1 — proving the content is in the server HTML, not injected by JS. If it is 0, something in the import chain is client-only; check that `TextSite.tsx` has no `"use client"` and imports nothing from `room/engine/`.

- [ ] **Step 5: Commit**

```bash
git add room/fallback app/text/page.tsx
git commit -m "Add the /text fallback carrying every item as server-rendered HTML"
```

---

### Task 17: Cutover — the room becomes the site

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Delete: `world/**`, `app/about/`, `app/projects/`, `app/hackathons/`, `app/preview/`
- Delete: `components/navbar.tsx`, `detail-page.tsx`, `reveal.tsx`, `scroll-progress.tsx`, `site-chrome.tsx`, `social-links-bar.tsx`, `zoomable-image.tsx`
- Delete: `public/world-assets/`
- Modify: `package.json`, `vitest.config.ts`, `ASSETS.md`

**Interfaces:**
- Consumes: everything built above.
- Produces: `/` is the room.

Do this in one commit. A half-cutover leaves the build broken.

- [ ] **Step 1: Make `/` the room**

Replace `app/page.tsx` entirely:

```tsx
import type { Metadata } from "next";
import { RoomShell } from "@/room/RoomShell";

export const metadata: Metadata = {
  title: "Travis Ang — portfolio",
  description:
    "A walkable 3D room where every object is a piece of my work: projects, hackathons, experience and certifications.",
  openGraph: {
    title: "Travis Ang — portfolio",
    description: "Every object in the room is a piece of my work.",
    type: "website",
  },
};

/*
  The homepage is the room. There are no other content routes: everything opens
  in a panel beside it, which is the whole point. /text carries the same content
  for anyone who cannot run WebGL.
*/
export default function Home() {
  return (
    <>
      <RoomShell />
      <noscript>
        <div style={{ padding: 24 }}>
          <p>
            This site is an interactive 3D room and needs JavaScript. The full text
            version is at <a href="/text">/text</a>.
          </p>
        </div>
      </noscript>
    </>
  );
}
```

- [ ] **Step 2: Write the shell that gates on WebGL**

Create `room/RoomShell.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { RoomProvider } from "./engine/roomState";
import { hasWebGL } from "./fallback/webgl";

const Room = dynamic(() => import("./engine/Room").then((m) => m.Room), { ssr: false });
const Panel = dynamic(() => import("./ui/Panel").then((m) => m.Panel), { ssr: false });

export function RoomShell() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = hasWebGL();
    setSupported(ok);
    if (!ok) window.location.replace("/text");
  }, []);

  if (supported === false) return null;

  return (
    <div className="fixed inset-0 bg-[#0b0d16]">
      <RoomProvider>
        <Room />
        <Panel />
      </RoomProvider>
      <a
        href="/text"
        className="fixed bottom-3 left-3 z-30 text-[11px] text-amber-100/35 underline underline-offset-4 hover:text-amber-100/70"
      >
        text version
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Strip the old chrome from the layout**

Run: `grep -n "SiteChrome\|Navbar\|ScrollProgress" app/layout.tsx`
Remove those imports and their JSX, leaving `<html>`, `<body>`, fonts, and `{children}`. Keep the `Toaster` from `sonner` if the contact form uses it — check with `grep -n "toast" components/contact-form.tsx`.

- [ ] **Step 4: Delete the old world and routes**

```bash
git rm -r world app/about app/projects app/hackathons app/preview public/world-assets
git rm components/navbar.tsx components/detail-page.tsx components/reveal.tsx \
       components/scroll-progress.tsx components/site-chrome.tsx \
       components/social-links-bar.tsx components/zoomable-image.tsx
```

- [ ] **Step 5: Drop pixi and narrow the test glob**

```bash
npm uninstall pixi.js
```

In `vitest.config.ts`, remove `"world/**/*.test.ts"` from `include` and update the file's leading comment to describe the room rather than the Pixi world:

```ts
/*
  The room's maths - swivel, focus framing, tab order and the attract sweep - is
  deliberately pure TypeScript with no React and no DOM, so the default node
  environment is all it needs. Anything that touches three.js or the browser
  lives in `room/engine/` and `room/ui/` and is verified by looking at it.
*/
```

- [ ] **Step 6: Rewrite `ASSETS.md`**

Replace its contents:

```markdown
# Room assets

The 3D room is built from **House & Office** by francoface.

- Vendored: 42 of the pack's 107 models, listed in `room/data/models.ts`
- Models: `public/room-assets/models/<name>.fbx`
- Textures: `public/room-assets/textures/<name>.png`

## Re-vendoring

```bash
node scripts/vendor-room-assets.mjs "<path to the pack>"
```

The script copies exactly the models named in `room/data/models.ts` and their
same-named PNGs from the pack's `Materials/` folder. `room/data/models.test.ts`
fails if a listed model was never vendored.

## Why the models need their textures wired up by hand

The pack's FBX files are binary FBX 7.4 and carry **no embedded texture
references**. `room/engine/useModels.ts` therefore builds each material itself
and pairs it with `Materials/<same name>.png`.

The textures are tiny palette swatches — `desk.png` is 631 bytes at 128x128 — so
they are sampled with `NearestFilter` and no mipmaps. Any smoothing turns them
to mush.

## Licence

Check the pack's own licence before promoting this site anywhere that reads as
commercial, and credit francoface either way. The credit is in the room, on the
coffee mug.
```

- [ ] **Step 7: Verify the whole thing builds and passes**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all four clean. `npm test` now runs only the room's suites — expect the four pure modules plus the two data guards. If `tsc` complains about a deleted import, something still references the old world; grep for it and remove.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Make the room the site: delete the Pixi world and the scrolling routes"
```

---

### Task 18: Tune, measure and verify against the spec

**Files:**
- Modify: `room/data/scene.ts`, `room/data/zones.ts` (placement only)
- Modify: `docs/superpowers/specs/2026-09-06-3d-room-portfolio-design.md` (record measured figures)

**Interfaces:**
- Consumes: everything.
- Produces: a room whose furniture is actually placed well, and measured numbers against the spec's budget.

Placement is deliberately last. Tuning coordinates before the camera, panel and lighting exist means tuning them twice.

- [ ] **Step 1: Calibrate scale**

Run `npm run dev` and open `/`. If props are wildly mis-sized, set a global scale by wrapping the scene `<group>` in `Room.tsx` with `scale={K}` and adjusting K until a `desk` is about 1.2 tiles wide. Record K in a comment. Do not scale props individually unless one model is genuinely off.

- [ ] **Step 2: Place the furniture**

Working zone by zone in `ZONE_ORDER`, adjust `position` and `rotationY` in `scene.ts` until:
- Nothing intersects a wall or another prop.
- Every interactive object is visible from the HOME framing — this is spec success criterion 2.
- The four cartridges read as a scattered pile, not a row.
- The four paintings hang level and evenly spaced on the back-left wall.
- The door reads as ajar with light coming through.

Re-run `npx vitest run room/data/scene.test.ts` after zone changes; the overlap guard will catch a carpet you dragged onto its neighbour.

- [ ] **Step 3: Measure the payload**

```bash
npm run build
du -sh public/room-assets
```

Record: total `public/room-assets` size, and the First Load JS for `/` from the build output.

- [ ] **Step 4: Measure on a throttled profile**

In Chrome DevTools, Performance panel, 4x CPU throttle and Fast 3G:
- Time from navigation to the first rendered frame of the room.
- Frame rate while dragging at HOME.

Spec §13 asks for under 4s and 30fps or better.

- [ ] **Step 5: Record the numbers in the spec**

Append to §13 of the spec a short "Measured" table with the real figures and the date. If the budget was missed, note it and state that the GLB bake in §8 is the next lever — do not build it in this task.

- [ ] **Step 6: Walk the spec's success criteria**

Confirm each of the five in spec §1 by hand and note the result:
1. All 13 items reachable without leaving `/`.
2. All six sections apparent within ten seconds (the sweep does this).
3. Every interactive object reachable by Tab and openable by Enter.
4. `/text` carries every word; `curl -s localhost:3000/text | wc -c` is substantial.
5. Nothing on screen looks like a nav menu.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Place the furniture and record measured performance against the budget"
```

---

## Verification

The whole build is done when all of these pass:

```bash
npm test          # room maths + the two data guards
npx tsc --noEmit  # no dangling references to the deleted world
npm run lint
npm run build
```

plus the five spec success criteria confirmed by hand in Task 18 Step 6.
