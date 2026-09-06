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
