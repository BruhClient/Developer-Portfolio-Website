import { describe, expect, test } from "vitest";
import { framingFor, isMobile, type Bounds, type Viewport } from "./focus";

const desktop: Viewport = { width: 1440, height: 900 };
const phone: Viewport = { width: 390, height: 844 };
/* A phone on its side, and a tablet upright. Together they say that the rules
   below key on the frame's SHAPE, not on how wide the device is: the landscape
   phone is narrow and behaves like the desktop, the portrait tablet is wide and
   behaves like the phone. */
const phoneLandscape: Viewport = { width: 844, height: 390 };
const tabletPortrait: Viewport = { width: 768, height: 1024 };
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
    for (const level of ["home", "item"] as const) {
      expect(framingFor(level, bounds, desktop, fov).target).toEqual(bounds.center);
    }
  });

  test("home stays centred, because no panel is open", () => {
    expect(framingFor("home", bounds, desktop, fov).screenAnchor).toEqual({ x: 0.5, y: 0.5 });
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

  test("opening something steps the camera closer than the whole room", () => {
    const at = (l: "home" | "item") => framingFor(l, bounds, desktop, fov).distance;
    expect(at("home")).toBeGreaterThan(at("item"));
  });
});

/*
  The fov three.js takes is the VERTICAL one, so on a portrait screen the
  horizontal field is the narrow one and fitting only the height lets the
  subject run off both sides. That is not a hypothetical: at 390px it put two
  of the six signs - a third of the site's navigation - outside the viewport.
*/
describe("fitting the narrow axis", () => {
  test("a portrait frame pulls back further than a landscape one", () => {
    for (const level of ["home", "item"] as const) {
      const wide = framingFor(level, bounds, phoneLandscape, fov).distance;
      const tall = framingFor(level, bounds, phone, fov).distance;
      expect(tall).toBeGreaterThan(wide);
    }
  });

  test("the subject fits across the frame's narrow axis, not just its height", () => {
    // What "fits" means: the half-width the frame covers at that distance is at
    // least the subject's radius. Without the aspect correction this fails on
    // every portrait viewport, which is the whole bug.
    const halfFov = (fov / 2) * (Math.PI / 180);
    for (const viewport of [desktop, phone, phoneLandscape, tabletPortrait]) {
      const { distance } = framingFor("item", bounds, viewport, fov);
      const aspect = viewport.width / viewport.height;
      const halfWidthCovered = distance * Math.tan(halfFov) * aspect;
      expect(halfWidthCovered).toBeGreaterThan(bounds.radius);
    }
  });

  test("a landscape frame is unchanged, so the desktop composition is untouched", () => {
    // radius / tan(halfFov) * PADDING.home, the original formula.
    const expected = (bounds.radius / Math.tan((fov / 2) * (Math.PI / 180))) * 1.9;
    expect(framingFor("home", bounds, desktop, fov).distance).toBeCloseTo(expected, 6);
    expect(framingFor("home", bounds, desktop, fov).screenAnchor).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe("home framing on a portrait screen", () => {
  test("aims left of centre, so the six signs land centred rather than the floor", () => {
    // The door sits alone at the far corner while the other five cluster, so
    // centring the room's middle pushes its sign off the right edge.
    const { screenAnchor } = framingFor("home", bounds, phone, fov);
    expect(screenAnchor.x).toBeLessThan(0.5);
    expect(screenAnchor.y).toBe(0.5);
  });

  test("a portrait tablet gets it too, though it is past the mobile breakpoint", () => {
    expect(isMobile(tabletPortrait)).toBe(false);
    expect(framingFor("home", bounds, tabletPortrait, fov).screenAnchor.x).toBeLessThan(0.5);
  });

  /*
    The two rules key on different things, and deliberately so. Home framing
    asks about the frame's shape, because that is what decides whether the room
    fits across it. An open item asks isMobile(), because what it is dodging is
    the panel, and the panel switches from a side panel to a bottom sheet at
    exactly that breakpoint. An upright tablet is portrait AND has a side
    panel, which is the case that tells the two apart.
  */
  test("an open item follows the panel, not the frame's shape", () => {
    expect(framingFor("item", bounds, phone, fov).screenAnchor).toEqual({ x: 0.5, y: 0.25 });
    expect(framingFor("item", bounds, tabletPortrait, fov).screenAnchor).toEqual({
      x: 0.275,
      y: 0.5,
    });
  });
});
