import { describe, expect, test } from "vitest";
import { MAX_ZOOM, MIN_ZOOM, zoomFor } from "./Zoom";

// The grey-box floor: 40x19 tiles at 16px.
const map = { width: 640, height: 304 };

describe("zoomFor", () => {
  test("fills a tall phone rather than letterboxing it", () => {
    // A 19.5:9 phone is far taller than a 40x19 floor is deep. Scaling to width
    // alone leaves black bands above and below the map.
    const phone = { width: 390, height: 844 };
    const zoom = zoomFor(phone, map);

    expect(map.height * zoom).toBeGreaterThanOrEqual(phone.height);
  });

  test("fills a desktop window too", () => {
    const desktop = { width: 1280, height: 800 };
    const zoom = zoomFor(desktop, map);

    expect(map.width * zoom).toBeGreaterThanOrEqual(desktop.width);
    expect(map.height * zoom).toBeGreaterThanOrEqual(desktop.height);
  });

  test("stops magnifying before the art dissolves", () => {
    expect(zoomFor({ width: 4000, height: 4000 }, map)).toBe(MAX_ZOOM);
  });

  test("never drops below the floor on a tiny window", () => {
    expect(zoomFor({ width: 120, height: 120 }, map)).toBe(MIN_ZOOM);
  });
});
